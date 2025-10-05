import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blogs/[id] - Get a specific blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        sequences: {
          include: {
            blogContent: true,
            blogMedia: true
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, slug, tags, status, readingTime, categoryIds, sequences } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if another blog with this slug already exists
    const duplicateBlog = await prisma.blog.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (duplicateBlog) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 409 }
      );
    }

    // Update blog with categories and sequences
    const blog = await prisma.$transaction(async (tx) => {
      // Update blog basic info
      const updatedBlog = await tx.blog.update({
        where: { id },
        data: {
          title,
          slug,
          tags: tags || [],
          status: status || 'DRAFT',
          readingTime: readingTime || 5
        }
      });

      // Update categories
      await tx.blogCategory.deleteMany({
        where: { blogId: id }
      });

      if (categoryIds && categoryIds.length > 0) {
        await tx.blogCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            blogId: id,
            categoryId
          }))
        });
      }

      // Update sequences
      await tx.blogSequence.deleteMany({
        where: { blogId: id }
      });

      if (sequences && sequences.length > 0) {
        await tx.blogSequence.createMany({
          data: sequences.map((seq: any) => ({
            blogId: id,
            sequence: seq.sequence,
            blogContentId: seq.blogContentId,
            blogMediaId: seq.blogMediaId
          }))
        });
      }

      // Return updated blog with relations
      return await tx.blog.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          sequences: {
            include: {
              blogContent: true,
              blogMedia: true
            },
            orderBy: {
              sequence: 'asc'
            }
          }
        }
      });
    });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Delete blog (cascade will handle related records)
    await prisma.blog.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
