import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, sequenceNumber, name, description, blogSequences } = await request.json();

    if (!courseId || !sequenceNumber || !name || !description) {
      return NextResponse.json({ 
        error: 'Course ID, sequence number, name, and description are required' 
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found' 
      }, { status: 404 });
    }

    // Check if sequence number already exists for this course
    const existingChapter = await prisma.chapterTopic.findFirst({
      where: {
        courseId,
        sequenceNumber
      }
    });

    if (existingChapter) {
      return NextResponse.json({ 
        error: `Chapter with sequence number ${sequenceNumber} already exists for this course` 
      }, { status: 400 });
    }

    // Create chapter topic with blog relations
    const chapterTopic = await prisma.chapterTopic.create({
      data: {
        courseId,
        sequenceNumber,
        name,
        description,
        blogRelations: {
          create: blogSequences?.map((seq: any) => ({
            blogId: seq.blogId,
            sequence: seq.sequence
          })) || []
        }
      },
      include: {
        course: true,
        blogRelations: {
          include: {
            blog: true
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    });

    return NextResponse.json(chapterTopic);
  } catch (error) {
    console.error('Error creating chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter topic' },
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
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where = {
      ...(courseId && { courseId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [chapterTopics, total] = await Promise.all([
      prisma.chapterTopic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { courseId: 'asc' },
          { sequenceNumber: 'asc' }
        ],
        include: {
          course: {
            select: {
              id: true,
              name: true
            }
          },
          blogRelations: {
            include: {
              blog: {
                select: {
                  id: true,
                  title: true,
                  slug: true
                }
              }
            },
            orderBy: {
              sequence: 'asc'
            }
          }
        }
      }),
      prisma.chapterTopic.count({ where }),
    ]);

    return NextResponse.json({
      data: chapterTopics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching chapter topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter topics' },
      { status: 500 }
    );
  }
}
