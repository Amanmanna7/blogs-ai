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
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const blogId = searchParams.get('blogId');
    const courseId = searchParams.get('courseId');
    const chapterTopicId = searchParams.get('chapterTopicId');

    if (sessionId) {
      // Load messages for a specific session
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: dbUser.id
        }
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found or unauthorized' },
          { status: 404 }
        );
      }

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.chatMessage.count({
        where: { sessionId }
      });

      return NextResponse.json({
        success: true,
        messages: messages.reverse(), // Reverse to get chronological order
        totalCount,
        hasMore: offset + limit < totalCount
      });
    } else {
      // Load recent messages across all sessions for the user
      const where: any = {
        session: {
          userId: dbUser.id,
          status: 'ACTIVE'
        }
      };

      if (blogId) where.session.blogId = blogId;
      if (courseId) where.session.courseId = courseId;
      if (chapterTopicId) where.session.chapterTopicId = chapterTopicId;

      const messages = await prisma.chatMessage.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              sessionName: true,
              blog: {
                select: { title: true, slug: true }
              },
              course: {
                select: { name: true }
              },
              chapterTopic: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.chatMessage.count({ where });

      return NextResponse.json({
        success: true,
        messages: messages.reverse(), // Reverse to get chronological order
        totalCount,
        hasMore: offset + limit < totalCount
      });
    }

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
