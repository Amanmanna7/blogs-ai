import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include chapter topic count
    const coursesWithCount = courses.map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      subjectType: course.subjectType,
      chapterTopicCount: course._count.chapterTopics,
      createdAt: course.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: coursesWithCount
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
