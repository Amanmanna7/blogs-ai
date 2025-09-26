import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole, hasPermission, hasMinimumRole } from '@/lib/rbac';
import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: UserRole;
}

// Get current authenticated user with role
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkUserId: user.clerkUserId!,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: (user as any).role || 'USER',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has permission
export async function checkPermission(permission: keyof typeof import('@/lib/rbac').PERMISSIONS): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return hasPermission(user.role, permission);
}

// Check if user has minimum role
export async function checkMinimumRole(minimumRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return hasMinimumRole(user.role, minimumRole);
}

// Require authentication
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Require specific permission
export async function requirePermission(permission: keyof typeof import('@/lib/rbac').PERMISSIONS): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!hasPermission(user.role, permission)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

// Require minimum role
export async function requireMinimumRole(minimumRole: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!hasMinimumRole(user.role, minimumRole)) {
    throw new Error('Insufficient role level');
  }
  
  return user;
}

// Middleware helper for API routes
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options?: {
    permission?: keyof typeof import('@/lib/rbac').PERMISSIONS;
    minimumRole?: UserRole;
  }
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      let user: AuthenticatedUser;
      
      if (options?.permission) {
        user = await requirePermission(options.permission);
      } else if (options?.minimumRole) {
        user = await requireMinimumRole(options.minimumRole);
      } else {
        user = await requireAuth();
      }
      
      return await handler(req, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication failed' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
