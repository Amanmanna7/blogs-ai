import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    const { notes } = await request.json();

    if (!Array.isArray(notes)) {
      return NextResponse.json({ error: 'Invalid notes format' }, { status: 400 });
    }

    // Get existing notes from database
    const existingNotes = await prisma.userNote.findMany({
      where: { userId },
      select: { id: true, status: true }
    });

    const existingNoteIds = new Set(existingNotes.map((note: any) => note.id));
    const incomingNoteIds = new Set(notes.map((note: any) => note.id));

    // Mark notes as deleted if they exist in DB but not in localStorage
    const notesToDelete = existingNotes.filter((note: any) => !incomingNoteIds.has(note.id));
    
    if (notesToDelete.length > 0) {
      await prisma.userNote.updateMany({
        where: {
          id: { in: notesToDelete.map((note: any) => note.id) },
          userId
        },
        data: { status: 'DELETED' }
      });
    }

    // Upsert notes (create or update)
    const upsertPromises = notes.map(note => {
      const noteData = {
        userId,
        noteTitle: note.title,
        noteContent: note.content,
        lastOpenedAt: new Date(note.lastOpenedAt),
        status: 'ACTIVE' as const,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      };

      return prisma.userNote.upsert({
        where: { id: note.id },
        update: {
          noteTitle: noteData.noteTitle,
          noteContent: noteData.noteContent,
          lastOpenedAt: noteData.lastOpenedAt,
          updatedAt: noteData.updatedAt,
          status: 'ACTIVE'
        },
        create: {
          id: note.id,
          ...noteData
        }
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${notes.length} notes, marked ${notesToDelete.length} as deleted` 
    });

  } catch (error) {
    console.error('Error syncing notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/notes/sync - Starting request');
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      console.log('GET /api/notes/sync - No clerkUserId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET /api/notes/sync - Found clerkUserId:', clerkUserId);
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      console.log('GET /api/notes/sync - User not found for clerkUserId:', clerkUserId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;
    console.log('GET /api/notes/sync - Found user with ID:', userId);

    // Get all active notes from database
    const notes = await prisma.userNote.findMany({
      where: { 
        userId,
        status: 'ACTIVE'
      },
      orderBy: { lastOpenedAt: 'desc' }
    });

    console.log('GET /api/notes/sync - Found notes:', notes.length);

    // Transform to match localStorage format
    const transformedNotes = notes.map((note: any) => ({
      id: note.id,
      title: note.noteTitle,
      content: note.noteContent,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      lastOpenedAt: note.lastOpenedAt.toISOString()
    }));

    console.log('GET /api/notes/sync - Returning transformed notes:', transformedNotes.length);
    return NextResponse.json({ notes: transformedNotes });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
