'use client';

import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { UserRole } from '@/lib/rbac';

interface RoleGuardProps {
  children: ReactNode;
  permission?: keyof typeof import('@/lib/rbac').PERMISSIONS;
  minimumRole?: UserRole;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function RoleGuard({ 
  children, 
  permission, 
  minimumRole, 
  fallback = null, 
  requireAuth = true 
}: RoleGuardProps) {
  const { user, loading, hasPermission, hasMinimumRole } = useRole();

  // Show loading state
  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
  }

  // Check authentication
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  // Check permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check minimum role
  if (minimumRole && !hasMinimumRole(minimumRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard minimumRole="ADMIN" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function EditorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard minimumRole="EDITOR" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ModeratorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard minimumRole="MODERATOR" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AuthorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard minimumRole="AUTHOR" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
