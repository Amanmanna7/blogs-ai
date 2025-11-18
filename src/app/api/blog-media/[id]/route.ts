import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/s3-storage';
import { deleteFile as deleteFileGCP } from '@/lib/gcp-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogMedia = await prisma.blogMedia.findUnique({
      where: { id: params.id },
    });

    if (!blogMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(blogMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, mediaType } = body;

    // Generate new slug if name changed
    const existingMedia = await prisma.blogMedia.findUnique({
      where: { id: params.id },
    });

    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const blogMedia = await prisma.blogMedia.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: description || null,
        mediaType: mediaType || existingMedia.mediaType,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(blogMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogMedia = await prisma.blogMedia.findUnique({
      where: { id: params.id },
    });

    if (!blogMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Extract file path from URL - handle both GCP and S3/CloudFront URLs
    const url = blogMedia.mediaUrl;
    let filePath: string;
    
    // Check if it's a GCP URL (storage.googleapis.com)
    if (url.includes('storage.googleapis.com')) {
      // GCP URL format: https://storage.googleapis.com/{bucket}/{path}
      const urlParts = url.split('storage.googleapis.com/');
      if (urlParts.length > 1) {
        // Remove bucket name (first part) and get the rest as path
        const parts = urlParts[1].split('/');
        filePath = parts.slice(1).join('/');
      } else {
        // Fallback: extract from end of URL
        const parts = url.split('/');
        const blogMediaIndex = parts.indexOf('blog-media');
        filePath = blogMediaIndex >= 0 ? parts.slice(blogMediaIndex).join('/') : parts[parts.length - 1];
      }
      
      // Delete from Google Cloud Storage (for backward compatibility)
      try {
        await deleteFileGCP(filePath);
      } catch (error) {
        console.error('Error deleting file from GCS:', error);
        // Continue with database deletion even if GCS deletion fails
      }
    } else {
      // S3 or CloudFront URL
      // S3 format: https://{bucket}.s3.{region}.amazonaws.com/{path}
      // CloudFront format: https://{cloudfront-domain}/{path}
      
      // Extract path after domain
      const urlMatch = url.match(/https?:\/\/[^\/]+\/(.+)$/);
      if (urlMatch && urlMatch[1]) {
        filePath = urlMatch[1];
      } else {
        // Fallback: try to find blog-media in path
        const parts = url.split('/');
        const blogMediaIndex = parts.indexOf('blog-media');
        filePath = blogMediaIndex >= 0 ? parts.slice(blogMediaIndex).join('/') : parts[parts.length - 1];
      }
      
      // Delete from AWS S3
      try {
        await deleteFile(filePath);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await prisma.blogMedia.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
