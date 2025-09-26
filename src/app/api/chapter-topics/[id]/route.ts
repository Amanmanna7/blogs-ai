import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const chapterTopic = await prisma.chapterTopic.findUnique({
      where: { id },
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

    if (!chapterTopic) {
      return NextResponse.json({ error: 'Chapter topic not found' }, { status: 404 });
    }

    return NextResponse.json(chapterTopic);
  } catch (error) {
    console.error('Error fetching chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter topic' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { courseId, sequenceNumber, name, description, blogSequences } = await request.json();

    if (!courseId || !sequenceNumber || !name || !description) {
      return NextResponse.json({ 
        error: 'Course ID, sequence number, name, and description are required' 
      }, { status: 400 });
    }

    // Check if chapter topic exists
    const existingChapter = await prisma.chapterTopic.findUnique({
      where: { id }
    });

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter topic not found' }, { status: 404 });
    }

    // Check if sequence number already exists for this course (excluding current chapter)
    const conflictingChapter = await prisma.chapterTopic.findFirst({
      where: {
        courseId,
        sequenceNumber,
        id: { not: id }
      }
    });

    if (conflictingChapter) {
      return NextResponse.json({ 
        error: `Chapter with sequence number ${sequenceNumber} already exists for this course` 
      }, { status: 400 });
    }

    // Update chapter topic and blog relations
    const updatedChapterTopic = await prisma.chapterTopic.update({
      where: { id },
      data: {
        courseId,
        sequenceNumber,
        name,
        description,
        blogRelations: {
          deleteMany: {}, // Remove all existing relations
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

    return NextResponse.json(updatedChapterTopic);
  } catch (error) {
    console.error('Error updating chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter topic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if chapter topic exists
    const chapterTopic = await prisma.chapterTopic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogRelations: true
          }
        }
      }
    });

    if (!chapterTopic) {
      return NextResponse.json({ error: 'Chapter topic not found' }, { status: 404 });
    }

    // Delete chapter topic (cascade will handle blog relations)
    await prisma.chapterTopic.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Chapter topic deleted successfully',
      deletedBlogRelations: chapterTopic._count.blogRelations 
    });
  } catch (error) {
    console.error('Error deleting chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter topic' },
      { status: 500 }
    );
  }
}
