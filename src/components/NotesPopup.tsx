'use client';

import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  StickyNote, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import NotesEditor from './NotesEditor';
import { Note, getNotes, saveNote, deleteNote /* updateLastOpened */ } from '@/lib/notes-storage';
import '@/styles/notes.css';

interface NotesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PopupState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  sidebarCollapsed: boolean;
}

const getDefaultSize = () => {
  if (typeof window === 'undefined') {
    return {
      width: 500,
      height: 400,
      x: 100,
      y: 100,
    };
  }
  return {
    width: 500,
    height: 400,
    x: window.innerWidth - 520,
    y: window.innerHeight - 420,
  };
};

const MIN_SIZE = {
  width: 250,
  height: 300,
};

export default function NotesPopup({ isOpen, onClose }: NotesPopupProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [popupState, setPopupState] = useState<PopupState>(() => {
    if (typeof window === 'undefined') {
      const defaultSize = getDefaultSize();
      return {
        ...defaultSize,
        isMinimized: false,
        sidebarCollapsed: false,
      };
    }

    const saved = localStorage.getItem('blog-ai-notes-popup-state');
    if (saved) {
      try {
        return { ...JSON.parse(saved), isMinimized: false };
      } catch {
        const defaultSize = getDefaultSize();
        return { ...defaultSize, isMinimized: false, sidebarCollapsed: false };
      }
    }
    const defaultSize = getDefaultSize();
    return { ...defaultSize, isMinimized: false, sidebarCollapsed: false };
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const rndRef = useRef<Rnd>(null);

  // Load notes on mount
  useEffect(() => {
    if (isOpen) {
      const loadedNotes = getNotes();
      setNotes(loadedNotes);
      
      if (loadedNotes.length > 0 && !currentNote) {
        setCurrentNote(loadedNotes[0]);
        // Don't update lastOpenedAt when popup is first opened
        // Only update when user manually selects a note
      }
    }
  }, [isOpen, currentNote]);

  // Save popup state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog-ai-notes-popup-state', JSON.stringify({
        x: popupState.x,
        y: popupState.y,
        width: popupState.width,
        height: popupState.height,
        sidebarCollapsed: popupState.sidebarCollapsed,
      }));
    }
  }, [popupState]);

  // Handle window resize and constrain position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      if (rndRef.current) {
        const { x, y, width, height } = popupState;
        const maxX = Math.max(0, window.innerWidth - width);
        const maxY = Math.max(0, window.innerHeight - height);
        
        if (x > maxX || y > maxY || x < 0 || y < 0) {
          setPopupState(prev => ({
            ...prev,
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY)),
          }));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [popupState]);

  const handleCreateNote = () => {
    const newNote = saveNote({
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Note',
      content: '<p>Start writing your note...</p>',
    });
    
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
    setHasUnsavedChanges(false);
  };

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges && currentNote) {
      // Save current note before switching
      handleSaveNote(currentNote.content);
    }
    
    setCurrentNote(note);
    // updateLastOpened(note.id); // Commented out - rearrange functionality disabled
    setHasUnsavedChanges(false);
    setIsEditingTitle(false);
  };

  const handleSaveNote = (content: string) => {
    if (!currentNote) return;
    
    const updatedNote = saveNote({
      id: currentNote.id,
      title: currentNote.title,
      content,
    });
    
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    setCurrentNote(updatedNote);
    setHasUnsavedChanges(false);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    
    if (currentNote?.id === noteId) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      if (remainingNotes.length > 0) {
        setCurrentNote(remainingNotes[0]);
        // updateLastOpened(remainingNotes[0].id); // Commented out - rearrange functionality disabled
      } else {
        setCurrentNote(null);
      }
    }
    
    setShowDeleteConfirm(null);
  };

  const handleStartEditingTitle = () => {
    if (currentNote) {
      setEditingTitle(currentNote.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (!currentNote || !editingTitle.trim()) return;
    
    const trimmedTitle = editingTitle.trim().substring(0, 100);
    const updatedNote = saveNote({
      id: currentNote.id,
      title: trimmedTitle,
      content: currentNote.content,
    });
    
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    setCurrentNote(updatedNote);
    setIsEditingTitle(false);
  };

  const handleCancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditingTitle();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setPopupState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const handleToggleSidebar = () => {
    setPopupState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <Rnd
      ref={rndRef}
      size={{ width: popupState.width, height: popupState.isMinimized ? 60 : popupState.height }}
      position={{ x: popupState.x, y: popupState.y }}
      minWidth={MIN_SIZE.width}
      minHeight={popupState.isMinimized ? 60 : MIN_SIZE.height}
      maxWidth={typeof window !== 'undefined' ? window.innerWidth - 20 : 800}
      maxHeight={typeof window !== 'undefined' ? window.innerHeight - 20 : 600}
      enableResizing={{
        top: false,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onDrag={(e, d) => {
        // Real-time dragging - update position immediately
        if (typeof window === 'undefined') return;
        const maxX = Math.max(0, window.innerWidth - popupState.width);
        const maxY = Math.max(0, window.innerHeight - popupState.height);
        const constrainedX = Math.max(0, Math.min(d.x, maxX));
        const constrainedY = Math.max(0, Math.min(d.y, maxY));
        
        setPopupState(prev => ({ ...prev, x: constrainedX, y: constrainedY }));
      }}
      onDragStop={(e, d) => {
        // Final position constraint
        if (typeof window === 'undefined') return;
        const maxX = Math.max(0, window.innerWidth - popupState.width);
        const maxY = Math.max(0, window.innerHeight - popupState.height);
        const constrainedX = Math.max(0, Math.min(d.x, maxX));
        const constrainedY = Math.max(0, Math.min(d.y, maxY));
        
        setPopupState(prev => ({ ...prev, x: constrainedX, y: constrainedY }));
      }}
      onResize={(e, direction, ref, delta, position) => {
        // Real-time resizing - update size immediately
        if (typeof window === 'undefined') return;
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        const maxX = Math.max(0, window.innerWidth - newWidth);
        const maxY = Math.max(0, window.innerHeight - newHeight);
        const constrainedX = Math.max(0, Math.min(position.x, maxX));
        const constrainedY = Math.max(0, Math.min(position.y, maxY));
        
        setPopupState(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight,
          x: constrainedX,
          y: constrainedY,
        }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        // Final size constraint
        if (typeof window === 'undefined') return;
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        const maxX = Math.max(0, window.innerWidth - newWidth);
        const maxY = Math.max(0, window.innerHeight - newHeight);
        const constrainedX = Math.max(0, Math.min(position.x, maxX));
        const constrainedY = Math.max(0, Math.min(position.y, maxY));
        
        setPopupState(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight,
          x: constrainedX,
          y: constrainedY,
        }));
      }}
      dragHandleClassName="notes-header"
      className="notes-popup"
      style={{
        zIndex: 1000,
      }}
    >
      <div className="notes-header">
        <div className="notes-header-title">
          <StickyNote size={16} />
          <span>Notes</span>
          {hasUnsavedChanges && (
            <span className="text-orange-500 text-xs">•</span>
          )}
        </div>
        <div className="notes-title-section">
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="notes-title-input"
              maxLength={100}
              autoFocus
            />
          ) : (
            <div className="notes-title-container">
              <button
                onClick={handleStartEditingTitle}
                className="notes-title-button"
                title="Click to edit title"
              >
                {currentNote?.title || 'Untitled Note'}
              </button>
              <button
                onClick={handleStartEditingTitle}
                className="notes-edit-icon"
                title="Edit note title"
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>
        <div className="notes-header-controls">
          <button
            onClick={handleToggleSidebar}
            className="notes-control-btn"
            title={popupState.sidebarCollapsed ? "Show Notes List" : "Hide Notes List"}
          >
            {popupState.sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            onClick={handleMinimize}
            className="notes-control-btn"
            title={popupState.isMinimized ? "Expand" : "Minimize"}
          >
            {popupState.isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={handleClose}
            className="notes-control-btn"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!popupState.isMinimized && (
        <div className="notes-content">
          {!popupState.sidebarCollapsed && (
            <div className="notes-sidebar">
              <div className="notes-sidebar-header">
                <span className="notes-sidebar-title">Notes</span>
                <button
                  onClick={handleCreateNote}
                  className="notes-control-btn"
                  title="New Note"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="notes-list">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`notes-list-item ${currentNote?.id === note.id ? 'active' : ''}`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="notes-list-item-title">{note.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="notes-list-item-date">{formatDate(note.lastOpenedAt)}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(note.id);
                        }}
                        className="notes-control-btn"
                        title="Delete Note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <StickyNote size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No notes yet</p>
                    <button
                      onClick={handleCreateNote}
                      className="text-blue-600 hover:text-blue-800 text-xs mt-2"
                    >
                      Create your first note
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="notes-editor-container">
            {currentNote ? (
              <NotesEditor
                content={currentNote.content}
                onUpdate={(content) => {
                  setHasUnsavedChanges(true);
                  setCurrentNote(prev => prev ? { ...prev, content } : null);
                }}
                width={popupState.width - (popupState.sidebarCollapsed ? 0 : 200)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No note selected</p>
                  <p className="text-sm mb-4">Create a new note to get started</p>
                  <button
                    onClick={handleCreateNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Rnd>
  );
}
