import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkUserId } = await auth();

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUserId || ''
      },
      select: {
        id: true
      }
    });

    let userId = '';
    if (user) {
      userId = user.id;
    }

    const chapterTopic = await prisma.chapterTopic.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        sequenceNumber: true,
        blogRelations: {
          select: {
            blog: {
              select: {
                id: true,
                slug: true,
                title: true,
                publishedAt: true,
                status: true
              }
            },
            sequence: true
          },
          orderBy: {
            sequence: 'asc'
          }
        },
        blogProgress: {
          where: {
            userId: userId || '',
          },
          select: {
            status: true
          }
        }
      }
    });

    if (!chapterTopic) {
      return NextResponse.json({ error: 'Chapter topic not found' }, { status: 404 });
    }
    
    let progressResponse = {
      completedBlogs: chapterTopic.blogProgress.filter(bp => bp.status === 'COMPLETED').length,
      totalBlogs: chapterTopic.blogRelations.length,
      progressPercentage: chapterTopic.blogRelations.length > 0 ? Math.round((chapterTopic.blogProgress.filter(bp => bp.status === 'COMPLETED').length / chapterTopic.blogRelations.length) * 100) : 0
    }

    // Only expose published blogs in public endpoint
    const filtered = {
      id: chapterTopic.id,
      name: chapterTopic.name,
      description: chapterTopic.description,
      sequenceNumber: chapterTopic.sequenceNumber,
      progress: progressResponse,
      isUserSignedIn: !!userId,
      blogs: chapterTopic.blogRelations
        .filter((rel) => rel.blog.status === 'PUBLISHED')
        .sort((a, b) => a.sequence - b.sequence)
        .map((rel) => ({
          id: rel.blog.id,
          slug: rel.blog.slug,
          title: rel.blog.title,
          sequence: rel.sequence,
          publishedAt: rel.blog.publishedAt
        }))
    };

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching public chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter topic' },
      { status: 500 }
    );
  }
}


