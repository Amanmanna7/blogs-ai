export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

const STORAGE_KEY = 'blog-ai-notes';

export const getNotes = (): Note[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const notes = JSON.parse(stored) as Note[];
    // Sort by lastOpenedAt (most recent first)
    return notes.sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime());
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return [];
  }
};

export const saveNote = (note: Omit<Note, 'createdAt' | 'updatedAt' | 'lastOpenedAt'>): Note => {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available');
  }
  
  const now = new Date().toISOString();
  const notes = getNotes();
  
  const existingNoteIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingNoteIndex >= 0) {
    // Update existing note - don't change lastOpenedAt unless explicitly called
    const updatedNote: Note = {
      ...notes[existingNoteIndex],
      title: note.title,
      content: note.content,
      updatedAt: now,
      // Keep existing lastOpenedAt
    };
    notes[existingNoteIndex] = updatedNote;
  } else {
    // Create new note
    const newNote: Note = {
      ...note,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now
    };
    notes.unshift(newNote); // Add to beginning
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return existingNoteIndex >= 0 ? notes[existingNoteIndex] : notes[0];
  } catch (error) {
    console.error('Error saving note to localStorage:', error);
    throw new Error('Failed to save note. Storage might be full.');
  }
};

export const deleteNote = (noteId: string): void => {
  if (typeof window === 'undefined') return;

  const notes = getNotes();
  const filteredNotes = notes.filter(note => note.id !== noteId);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
  } catch (error) {
    console.error('Error deleting note from localStorage:', error);
    throw new Error('Failed to delete note.');
  }
};

export const updateLastOpened = (noteId: string): void => {
  if (typeof window === 'undefined') return;

  const notes = getNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex >= 0) {
    notes[noteIndex].lastOpenedAt = new Date().toISOString();
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error updating last opened time:', error);
    }
  }
};

export const createNewNote = (): Note => {
  const now = new Date().toISOString();
  const newNote: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Untitled Note',
    content: '<p>Start writing your note...</p>',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  };

  return saveNote(newNote);
};

export const getStorageSize = (): { used: number; available: number } => {
  if (typeof window === 'undefined') return { used: 0, available: 0 };

  try {
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([stored]).size;
    // Most browsers have ~5-10MB localStorage limit
    const available = 5 * 1024 * 1024 - used; // 5MB - used
    return { used, available };
  } catch {
    return { used: 0, available: 0 };
  }
};

// Sync functions for database integration
export const syncNotesToDatabase = async (): Promise<SyncResult> => {
  try {
    const notes = getNotes();
    
    const response = await fetch('/api/notes/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to sync notes',
        error: result.error || 'Unknown error'
      };
    }

    return {
      success: true,
      message: result.message
    };
  } catch (error) {
    console.error('Error syncing notes to database:', error);
    return {
      success: false,
      message: 'Failed to sync notes',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const loadNotesFromDatabase = async (): Promise<Note[]> => {
  try {
    const response = await fetch('/api/notes/sync', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to load notes from database:', result.error);
      return getNotes(); // Fallback to localStorage
    }

    // Save to localStorage for offline access
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.notes));
    }

    return result.notes;
  } catch (error) {
    console.error('Error loading notes from database:', error);
    return getNotes(); // Fallback to localStorage
  }
};

export const hasUnsavedChanges = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const lastSync = localStorage.getItem('blog-ai-notes-last-sync');
    const notes = getNotes();
    
    if (!lastSync) return notes.length > 0;
    
    const lastSyncTime = new Date(lastSync).getTime();
    const latestNoteTime = Math.max(
      ...notes.map(note => new Date(note.updatedAt).getTime())
    );
    
    return latestNoteTime > lastSyncTime;
  } catch (error) {
    console.error('Error checking for unsaved changes:', error);
    return false;
  }
};

export const markAsSynced = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('blog-ai-notes-last-sync', new Date().toISOString());
  }
};

export const loadNotesHybrid = async (): Promise<{ notes: Note[]; needsSync: boolean }> => {
  if (typeof window === 'undefined') {
    return { notes: [], needsSync: false };
  }

  try {
    // Get localStorage notes first
    const localNotes = getNotes();
    
    // Try to load from database
    let dbNotes: Note[] = [];
    let dbLoadSuccess = false;
    
    try {
      const response = await fetch('/api/notes/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        dbNotes = result.notes || [];
        dbLoadSuccess = true;
      }
    } catch (dbError) {
      console.error('Database load failed:', dbError);
    }
    
    // If no localStorage data but we have DB data, populate localStorage
    if (localNotes.length === 0 && dbLoadSuccess && dbNotes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbNotes));
      markAsSynced();
      return { notes: dbNotes, needsSync: false };
    }
    
    // If we have localStorage data, use it and check for sync mismatch
    if (localNotes.length > 0) {
      const needsSync = dbLoadSuccess ? checkSyncMismatch(localNotes, dbNotes) : true;
      return { notes: localNotes, needsSync };
    }
    
    // Fallback: return empty array if no data anywhere
    return { notes: [], needsSync: false };
    
  } catch (error) {
    console.error('Error in hybrid loading:', error);
    // Fallback to localStorage only
    const fallbackNotes = getNotes();
    return { notes: fallbackNotes, needsSync: true };
  }
};

const checkSyncMismatch = (localNotes: Note[], dbNotes: Note[]): boolean => {
  // If different number of notes, definitely out of sync
  if (localNotes.length !== dbNotes.length) {
    return true;
  }

  // Check if any note content or metadata differs
  for (const localNote of localNotes) {
    const dbNote = dbNotes.find(n => n.id === localNote.id);
    
    if (!dbNote) {
      // Note exists in localStorage but not in DB
      return true;
    }
    
    // Compare content and metadata
    if (
      localNote.title !== dbNote.title ||
      localNote.content !== dbNote.content ||
      localNote.updatedAt !== dbNote.updatedAt
    ) {
      return true;
    }
  }

  // Check if any DB note is missing from localStorage
  for (const dbNote of dbNotes) {
    const localNote = localNotes.find(n => n.id === dbNote.id);
    if (!localNote) {
      return true;
    }
  }

  return false;
};

// Debug function to test localStorage functionality
export const debugNotesStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const notes = getNotes();
    
    const hasChanges = hasUnsavedChanges();
    
    return {
      notesCount: notes.length,
      hasChanges
    };
  } catch (error) {
    console.error('Debug: Error testing storage:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
