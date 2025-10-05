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

    // Fetch course with chapter topics (all statuses for admin)
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        chapterTopics: {
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

    return NextResponse.json({
      success: true,
      data: course
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

export async function PUT(
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

    const body = await request.json();
    const { name, description, subjectType, status } = body;

    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        name,
        description,
        subjectType,
        status
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectType: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update course' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete course (this will cascade delete chapter topics and blog relations)
    await prisma.course.delete({
      where: {
        id: courseId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete course' 
      },
      { status: 500 }
    );
  }
}
