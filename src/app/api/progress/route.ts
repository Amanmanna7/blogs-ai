import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// POST /api/progress - Create or update progress for a blog
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { blogId, chapterId } = await request.json();

    if (!blogId || !chapterId) {
      return NextResponse.json(
        { success: false, error: 'blogId and chapterId are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the chapter to find the course
    const chapter = await prisma.chapterTopic.findUnique({
      where: { id: chapterId },
      select: { courseId: true }
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // First, ensure ChapterProgress exists
    const chapterProgress = await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId: dbUser.id,
          chapterId: chapterId
        }
      },
      update: {},
      create: {
        chapterId: chapterId,
        userId: dbUser.id,
        status: 'started'
      }
    });

    // Create or update blog progress
    const blogProgress = await prisma.blogProgress.upsert({
      where: {
        userId_blogId: {
          userId: dbUser.id,
          blogId: blogId
        }
      },
      update: {
        status: 'completed',
        completedAt: new Date()
      },
      create: {
        blogId: blogId,
        chapterId: chapterId,
        userId: dbUser.id,
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Check if all blogs in this chapter are completed
    const totalBlogsInChapter = await prisma.chapterTopicRelation.count({
      where: { chapterTopicId: chapterId }
    });

    const completedBlogsInChapter = await prisma.blogProgress.count({
      where: {
        chapterId: chapterId,
        userId: dbUser.id,
        status: 'completed'
      }
    });

    // Update chapter progress
    if (completedBlogsInChapter === totalBlogsInChapter) {
      // All blogs in chapter completed
      await prisma.chapterProgress.update({
        where: {
          userId_chapterId: {
            userId: dbUser.id,
            chapterId: chapterId
          }
        },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
    }

    // Check if all chapters in course are completed
    const totalChaptersInCourse = await prisma.chapterTopic.count({
      where: { courseId: chapter.courseId }
    });

    const completedChaptersInCourse = await prisma.chapterProgress.count({
      where: {
        chapterTopic: {
          courseId: chapter.courseId
        },
        userId: dbUser.id,
        status: 'completed'
      }
    });

    // Update course progress
    if (completedChaptersInCourse === totalChaptersInCourse) {
      // All chapters in course completed
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: dbUser.id,
            courseId: chapter.courseId
          }
        },
        update: {
          status: 'completed',
          completedAt: new Date()
        },
        create: {
          courseId: chapter.courseId,
          userId: dbUser.id,
          status: 'completed',
          completedAt: new Date()
        }
      });
    } else {
      // Course in progress
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: dbUser.id,
            courseId: chapter.courseId
          }
        },
        update: {
          status: 'started'
        },
        create: {
          courseId: chapter.courseId,
          userId: dbUser.id,
          status: 'started'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        blogProgress
      }
    });

  } catch (error) {
    console.error('Error creating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create progress' },
      { status: 500 }
    );
  }
}

// GET /api/progress - Get user's progress for a course
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get course progress
    const courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId: courseId
        }
      }
    });

    // Get all chapters in the course with their progress
    const chapters = await prisma.chapterTopic.findMany({
      where: { courseId: courseId },
      select: {
        id: true,
        name: true,
        sequenceNumber: true,
        blogRelations: {
          select: {
            blog: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { sequenceNumber: 'asc' }
    });

    // Get progress for each chapter
    const chaptersWithProgress = await Promise.all(
      chapters.map(async (chapter) => {
        const chapterProgress = await prisma.chapterProgress.findUnique({
          where: {
            userId_chapterId: {
              userId: dbUser.id,
              chapterId: chapter.id
            }
          }
        });

        // Get blog progress for this chapter
        const blogProgress = await prisma.blogProgress.findMany({
          where: {
            chapterId: chapter.id,
            userId: dbUser.id
          }
        });

        const completedBlogs = blogProgress.filter(bp => bp.status === 'completed').length;
        const totalBlogs = chapter.blogRelations.length;

        return {
          ...chapter,
          progress: chapterProgress,
          completedBlogs,
          totalBlogs,
          blogProgress: blogProgress.map(bp => ({
            blogId: bp.blogId,
            status: bp.status,
            completedAt: bp.completedAt
          }))
        };
      })
    );

    // Calculate overall course progress
    const totalBlogsInCourse = chaptersWithProgress.reduce((sum, chapter) => sum + chapter.totalBlogs, 0);
    const completedBlogsInCourse = chaptersWithProgress.reduce((sum, chapter) => sum + chapter.completedBlogs, 0);

    return NextResponse.json({
      success: true,
      data: {
        courseProgress,
        chapters: chaptersWithProgress,
        totalBlogs: totalBlogsInCourse,
        completedBlogs: completedBlogsInCourse,
        progressPercentage: totalBlogsInCourse > 0 ? Math.round((completedBlogsInCourse / totalBlogsInCourse) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
