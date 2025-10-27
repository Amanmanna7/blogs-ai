'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import NotesPopup from './NotesPopup';
import AuthRequiredPopup from './AuthRequiredPopup';
import '@/styles/notes.css';

interface NotesManagerProps {
  className?: string;
}

export default function NotesManager({ className = '' }: NotesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  const handleToggleNotes = () => {
    // Wait for auth to load
    if (!isLoaded) return;
    
    // Check if user is signed in
    if (!isSignedIn) {
      setShowAuthPopup(true);
      return;
    }
    
    // User is signed in, open notes
    setIsOpen(!isOpen);
  };

  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleToggleNotes}
        className={`notes-fab ${className}`}
        title="Take Notes"
        aria-label="Open Notes"
        disabled={!isLoaded}
      >
        <StickyNote size={24} />
      </button>

      {/* Notes Popup - Only show for authenticated users */}
      {isSignedIn && (
        <NotesPopup
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Auth Required Popup - Show for non-authenticated users */}
      <AuthRequiredPopup
        isOpen={showAuthPopup}
        onClose={handleCloseAuthPopup}
        redirectUrl={window.location.href}
      />
    </>
  );
}
