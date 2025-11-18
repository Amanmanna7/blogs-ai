import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/s3-storage';
import { MediaType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const mediaType = formData.get('mediaType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }

    // Server-side file type validation based on media type
    const allowedTypes: Record<MediaType, string[]> = {
      [MediaType.IMAGE]: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      [MediaType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'],
      [MediaType.AUDIO]: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'],
      [MediaType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text'],
      [MediaType.OTHER]: [] // Allow all types
    };

    const validationMediaType = (mediaType as MediaType) || MediaType.OTHER;
    const allowedFileTypes = allowedTypes[validationMediaType];
    
    if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type for ${validationMediaType}. Allowed types: ${allowedFileTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to AWS S3
    const uploadResult = await uploadFile(
      buffer,
      file.name,
      file.type,
      'blog-media'
    );

    // Use provided slug (already validated on client side)
    // No need to generate slug as it's provided from the form

    // Determine media type based on file type
    let detectedMediaType: MediaType = MediaType.OTHER;
    if (file.type.startsWith('image/')) {
      detectedMediaType = MediaType.IMAGE;
    } else if (file.type.startsWith('video/')) {
      detectedMediaType = MediaType.VIDEO;
    } else if (file.type.startsWith('audio/')) {
      detectedMediaType = MediaType.AUDIO;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      detectedMediaType = MediaType.DOCUMENT;
    }

    // Use provided media type or detected type
    const selectedMediaType = (mediaType as MediaType) || detectedMediaType;

    // Save to database
    const blogMedia = await prisma.blogMedia.create({
      data: {
        name,
        slug,
        mediaType: selectedMediaType,
        mediaUrl: uploadResult.url,
        description: description || null,
        meta: {
          originalName: file.name,
          size: uploadResult.size,
          contentType: uploadResult.contentType,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(blogMedia);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const mediaType = searchParams.get('mediaType');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where = {
      ...(mediaType && { mediaType: mediaType as MediaType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [blogMedia, total] = await Promise.all([
      prisma.blogMedia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blogMedia.count({ where }),
    ]);

    return NextResponse.json({
      data: blogMedia,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}