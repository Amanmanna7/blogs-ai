'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    
    if (isLoaded && user) {
      
      // Sync user with database
      fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
      })
      .catch(error => {
        console.error('Error syncing user:', error);
      });
    }
  }, [isLoaded, user]);

  return { user, isLoaded };
}
