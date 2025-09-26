import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

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
                    status: true
                  }
                }
              },
              orderBy: {
                sequence: 'asc'
              }
            }
          },
          orderBy: {
            sequenceNumber: 'asc'
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

    // Transform the data to include only published blogs and sort them properly
    const transformedCourse = {
      ...course,
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