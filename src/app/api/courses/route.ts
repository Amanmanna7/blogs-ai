import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SubjectType, CourseStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, subjectType, status } = await request.json();

    if (!name || !description || !subjectType || !status) {
      return NextResponse.json({ 
        error: 'Name, description, subjectType, and status are required' 
      }, { status: 400 });
    }

    // Validate enum values
    if (!Object.values(SubjectType).includes(subjectType)) {
      return NextResponse.json({ 
        error: 'Invalid subject type' 
      }, { status: 400 });
    }

    const validStatuses = ['DRAFT', 'LIVE', 'ARCHIVED', 'COMING_SOON'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid course status' 
      }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        subjectType,
        status,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subjectType = searchParams.get('subjectType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where = {
      ...(subjectType && { subjectType: subjectType as SubjectType }),
      ...(status && { status: status as CourseStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chapterTopics: {
            select: {
              id: true,
              name: true,
              sequenceNumber: true,
            },
          },
          _count: {
            select: {
              chapterTopics: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
