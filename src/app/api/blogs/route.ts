import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blogs - Get all blogs
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    const { title, slug, tags, status, readingTime, authorId, categoryIds, sequences } = await request.json();

    if (!title || !slug || !authorId) {
      return NextResponse.json(
        { error: 'Title, slug, and authorId are required' },
        { status: 400 }
      );
    }

    // Check if blog with this slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 409 }
      );
    }

    // Create blog with categories and sequences
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        tags: tags || [],
        status: status || 'DRAFT',
        readingTime: readingTime || 5,
        authorId,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            categoryId
          }))
        },
        sequences: {
          create: (sequences || []).map((seq: any) => ({
            sequence: seq.sequence,
            blogContentId: seq.blogContentId,
            blogMediaId: seq.blogMediaId
          }))
        }
      },
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

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
