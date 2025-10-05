import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: courseId, chapterId: chapterTopicId } = await params;

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
    
    await prisma.chapterTopic.delete({
      where: {
        id: chapterTopicId,
        courseId: courseId
      }
    });
    
    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error deleting chapter topic:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete chapter topic' 
      },
      { status: 500 }
    );
  }
}