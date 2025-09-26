import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/gcp-storage';

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

    // Extract filename from URL for deletion from GCS
    const urlParts = blogMedia.mediaUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const fullPath = `blog-media/${fileName}`;

    // Delete from Google Cloud Storage
    try {
      await deleteFile(fullPath);
    } catch (error) {
      console.error('Error deleting file from GCS:', error);
      // Continue with database deletion even if GCS deletion fails
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
