import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found. Please refresh the page and try again.' }, { status: 404 });
    }

    const { sessionName, blogId, courseId, chapterTopicId } = await request.json();

    // Create new chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        userId: dbUser.id, // Use database user ID
        sessionName: sessionName || null,
        blogId: blogId || null,
        courseId: courseId || null,
        chapterTopicId: chapterTopicId || null,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      session: chatSession 
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found. Please refresh the page and try again.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const courseId = searchParams.get('courseId');
    const chapterTopicId = searchParams.get('chapterTopicId');

    // Build where clause based on provided parameters
    const where: any = {
      userId: dbUser.id, // Use database user ID
      status: 'ACTIVE'
    };

    if (blogId) where.blogId = blogId;
    if (courseId) where.courseId = courseId;
    if (chapterTopicId) where.chapterTopicId = chapterTopicId;

    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        blog: {
          select: { title: true, slug: true }
        },
        course: {
          select: { name: true }
        },
        chapterTopic: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      sessions 
    });

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}
