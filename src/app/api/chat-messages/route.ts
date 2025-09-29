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

    const { sessionId, message, sender } = await request.json();

    if (!sessionId || !message || !sender) {
      return NextResponse.json(
        { error: 'sessionId, message, and sender are required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: dbUser.id // Use database user ID
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create new chat message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        message,
        sender: sender as 'USER' | 'AI'
      }
    });

    // Update session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      message: chatMessage 
    });

  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Failed to create chat message' },
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: dbUser.id // Use database user ID
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get messages for the session
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      messages 
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}
