import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    console.log('search params', searchParams);

    // Build where clause based on provided parameters
    const where: any = {
      userId: dbUser.id,
      status: 'ACTIVE'
    };

    if (blogId) where.blogId = blogId;
    if (courseId) where.courseId = courseId;
    if (chapterTopicId) where.chapterTopicId = chapterTopicId;

    // Get the last session with messages
    const lastSession = await prisma.chatSession.findFirst({
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

    if (!lastSession) {
      return NextResponse.json({
        success: true,
        session: null,
        messages: []
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: lastSession.id,
        sessionName: lastSession.sessionName,
        blogId: lastSession.blogId,
        courseId: lastSession.courseId,
        chapterTopicId: lastSession.chapterTopicId,
        blog: lastSession.blog,
        course: lastSession.course,
        chapterTopic: lastSession.chapterTopic,
        createdAt: lastSession.createdAt,
        updatedAt: lastSession.updatedAt
      },
      messages: lastSession.messages
    });

  } catch (error) {
    console.error('Error fetching last session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last session' },
      { status: 500 }
    );
  }
}
