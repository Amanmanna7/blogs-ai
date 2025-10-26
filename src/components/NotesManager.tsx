'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import NotesPopup from './NotesPopup';
import '@/styles/notes.css';

interface NotesManagerProps {
  className?: string;
}

export default function NotesManager({ className = '' }: NotesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleNotes = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleToggleNotes}
        className={`notes-fab ${className}`}
        title="Take Notes"
        aria-label="Open Notes"
      >
        <StickyNote size={24} />
      </button>

      {/* Notes Popup */}
      <NotesPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
