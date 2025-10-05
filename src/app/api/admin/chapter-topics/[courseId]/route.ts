import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { userId: clerkUserId } = await auth();

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUserId || ''
      },
      select: {
        id: true,
        role: true
      }
    });

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 403 }
      );
    }

    // Fetch all chapter topics for the course (admin can see all)
    const chapterTopics = await prisma.chapterTopic.findMany({
      where: {
        courseId: courseId
      },
      select: {
        id: true,
        name: true,
        description: true,
        sequenceNumber: true,
        createdAt: true,
        updatedAt: true,
        blogRelations: {
          select: {
            id: true,
            sequence: true,
            blog: {
              select: {
                id: true,
                title: true,
                slug: true,
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
    });

    return NextResponse.json({
      success: true,
      data: chapterTopics
    });

  } catch (error) {
    console.error('Error fetching chapter topics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch chapter topics' 
      },
      { status: 500 }
    );
  }
}
