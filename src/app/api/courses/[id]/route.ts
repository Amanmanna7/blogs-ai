import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
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

    // Fetch course with chapter topics and their related blogs
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        status: 'LIVE' // Only fetch LIVE courses
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectType: true,
        updatedAt: true,
        chapterTopics: {
          select: {
            id: true,
            name: true,
            description: true,
            sequenceNumber: true,
            blogRelations: {
              select: {
                sequence: true,
                blog: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    publishedAt: true,
                    status: true,
                    readingTime: true
                  }
                }
              },
              orderBy: {
                sequence: 'asc'
              }
            },
            chapterProgress: {
              where: {
                userId: userId || '',
              },
              select: {
                status: true,
                completedAt: true,
              }
            },
            blogProgress: {
              where: {
                userId: userId || '',
              },
              select: {
                status: true,
                completedAt: true,
                chapterId: true,
                blogId: true
              }
            }
          },
          orderBy: {
            sequenceNumber: 'asc'
          }
        },
        assessments: {
          where: {
            userId: userId || '',
          },
          select: {
            id: true,
            status: true,
            blogId: true,
            title: true,
            totalQuestions: true,
            createdAt: true,
            updatedAt: true,
            chapterTopicId: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Course not found' 
        },
        { status: 404 }
      );
    }

    const totalBlogsInCourse = course.chapterTopics.reduce((sum, chapter) => sum + chapter.blogRelations.length, 0);
    const completedBlogsInCourse = course.chapterTopics.reduce((sum, chapter) => sum + chapter.blogProgress.filter(bp => bp.status === 'COMPLETED').length, 0);
    const readingTimeInCourse = course.chapterTopics.reduce((sum, chapter) => sum + chapter.blogRelations.reduce((blogSum, blog) => blogSum + blog.blog.readingTime, 0), 0);
    const chapterWiseReadingTime = course.chapterTopics.map((chapter) => ({
      id: chapter.id,
      readingTime: chapter.blogRelations.reduce((blogSum, blog) => blogSum + blog.blog.readingTime, 0)
    }));

    const chaptersWithProgress = course.chapterTopics.map((chapter) => ({
      id: chapter.id,
      completedBlogs: chapter.blogProgress.filter(bp => bp.status === 'COMPLETED').length,
      totalBlogs: chapter.blogRelations.length,
      progress: chapter.chapterProgress,
      blogProgress: chapter.blogProgress
    }));

    let progressResponse = {
      completedBlogs: completedBlogsInCourse,
      totalBlogs: totalBlogsInCourse,
      progressPercentage: totalBlogsInCourse > 0 ? Math.round((completedBlogsInCourse / totalBlogsInCourse) * 100) : 0,
      chapters: chaptersWithProgress
    }

    // Transform the data to include only published blogs and sort them properly
    const transformedCourse = {
      ...course,
      readingTimeInCourse: readingTimeInCourse,
      chapterWiseReadingTime: chapterWiseReadingTime,
      progress: progressResponse,
      chapterTopics: course.chapterTopics.map((topic, index) => ({
        ...topic,
        displayNumber: index + 1, // Display number (1, 2, 3...)
        blogs: topic.blogRelations
          .filter(relation => relation.blog.status === 'PUBLISHED')
          .map(relation => ({
            id: relation.blog.id,
            title: relation.blog.title,
            slug: relation.blog.slug,
            publishedAt: relation.blog.publishedAt,
            sequence: relation.sequence
          }))
          .sort((a, b) => a.sequence - b.sequence)
      }))
    };

    return NextResponse.json({
      success: true,
      data: transformedCourse
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch course' 
      },
      { status: 500 }
    );
  }
}