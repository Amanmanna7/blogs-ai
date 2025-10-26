export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
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
