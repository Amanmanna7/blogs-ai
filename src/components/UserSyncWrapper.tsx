'use client';

import { useUserSync } from '@/hooks/useUserSync';

interface UserSyncWrapperProps {
  children: React.ReactNode;
}

export function UserSyncWrapper({ children }: UserSyncWrapperProps) {
  // This hook will automatically sync the user when they sign in
  useUserSync();

  return <>{children}</>;
}
