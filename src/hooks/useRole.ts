'use client';

import { useState, useEffect } from 'react';
import { UserRole, hasPermission, hasMinimumRole, canManageUser } from '@/lib/rbac';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export function useRole() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/users/sync');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const hasPermissionCheck = (permission: keyof typeof import('@/lib/rbac').PERMISSIONS): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const hasMinimumRoleCheck = (minimumRole: UserRole): boolean => {
    if (!user) return false;
    return hasMinimumRole(user.role, minimumRole);
  };

  const canManageUserCheck = (targetUserRole: UserRole): boolean => {
    if (!user) return false;
    return canManageUser(user.role, targetUserRole);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEditor = user?.role === 'EDITOR' || isAdmin;
  const isModerator = user?.role === 'MODERATOR' || isEditor;
  const isAuthor = user?.role === 'AUTHOR' || isModerator;

  return {
    user,
    loading,
    hasPermission: hasPermissionCheck,
    hasMinimumRole: hasMinimumRoleCheck,
    canManageUser: canManageUserCheck,
    isAdmin,
    isEditor,
    isModerator,
    isAuthor,
    role: user?.role,
  };
}
