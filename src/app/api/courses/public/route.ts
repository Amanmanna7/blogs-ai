import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch only LIVE courses with their chapter topics count
    const courses = await prisma.course.findMany({
      where: {
        status: 'LIVE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectType: true,
        createdAt: true,
        _count: {
          select: {
            chapterTopics: true
          }
        },
        chapterTopics: {
          select: {
            blogRelations: {
              select: {
                blog: {
                  select: {
                    id: true,
                    blogProgress: {
                      where: {
                        userId: userId || ''
                      },
                      select: {
                        status: true,
                        completedAt: true,
                      }
                    }
                  }
                },

              }
            },
            blogProgress: {
              select: {
                status: true,
                completedAt: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const coursesWithProgress = courses.map(course => {
      const totalBlogs = course.chapterTopics.reduce((sum, chapter) => sum + chapter.blogRelations.length, 0);
      const completedBlogs = course.chapterTopics.reduce((sum, chapter) => sum + chapter.blogProgress.filter(bp => bp.status === 'COMPLETED').length, 0);
      const progressPercentage = totalBlogs > 0 ? Math.round((completedBlogs / totalBlogs) * 100) : 0;
      
      // Find the latest completed blog time for sorting
      let latestCompletedBlogTime: Date | null = null;
      course.chapterTopics.forEach(chapter => {
        chapter.blogProgress.forEach(bp => {
          if (bp.status === 'COMPLETED' && bp.completedAt) {
            const completedAt = new Date(bp.completedAt);
            if (!latestCompletedBlogTime || completedAt > latestCompletedBlogTime) {
              latestCompletedBlogTime = completedAt;
            }
          }
        });
      });
      
      return {
        id: course.id,
        name: course.name,
        description: course.description,
        subjectType: course.subjectType,
        chapterTopicCount: course._count.chapterTopics,
        createdAt: course.createdAt,
        latestCompletedBlogTime: latestCompletedBlogTime,
        progress: {
          completedBlogs: completedBlogs,
          totalBlogs: totalBlogs,
          progressPercentage: progressPercentage
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: coursesWithProgress
    });

  } catch (error) {
    console.error('Error fetching public courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses' 
      },
      { status: 500 }
    );
  }
}
