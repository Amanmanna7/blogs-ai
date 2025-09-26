import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/rbac';

// GET /api/blog-content/[id] - Get specific blog content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const blogContent = await prisma.blogContent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });

    if (!blogContent) {
      return NextResponse.json({ error: 'Blog content not found' }, { status: 404 });
    }

    // Check if user has permission to view this content
    const canViewAll = hasPermission(user.role, 'VIEW_ALL_BLOGS');
    const isOwner = blogContent.createdById === user.id;

    if (!canViewAll && !isOwner) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({ blogContent });
  } catch (error) {
    console.error('Error fetching blog content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/blog-content/[id] - Update blog content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, slug, textContent } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    if (!textContent || !textContent.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing blog content
    const existingContent = await prisma.blogContent.findUnique({
      where: { id },
      select: { createdById: true, slug: true }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Blog content not found' }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (existingContent.slug !== slug.trim()) {
      const slugExists = await prisma.blogContent.findUnique({
        where: { slug: slug.trim() },
        select: { id: true }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Check permissions
    const canEditAny = hasPermission(user.role, 'EDIT_ANY_CONTENT');
    const canEditOwn = hasPermission(user.role, 'EDIT_OWN_CONTENT');
    const isOwner = existingContent.createdById === user.id;

    if (!canEditAny && (!canEditOwn || !isOwner)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const blogContent = await prisma.blogContent.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        textContent: textContent.trim(),
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });

    return NextResponse.json({ blogContent });
  } catch (error) {
    console.error('Error updating blog content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog-content/[id] - Delete blog content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing blog content
    const existingContent = await prisma.blogContent.findUnique({
      where: { id },
      select: { createdById: true }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Blog content not found' }, { status: 404 });
    }

    // Check permissions
    const canDeleteAny = hasPermission(user.role, 'DELETE_ANY_CONTENT');
    const canDeleteOwn = hasPermission(user.role, 'DELETE_OWN_CONTENT');
    const isOwner = existingContent.createdById === user.id;

    if (!canDeleteAny && (!canDeleteOwn || !isOwner)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.blogContent.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Blog content deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
