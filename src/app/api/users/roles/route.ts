import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, requirePermission } from '@/lib/auth';
import { UserRole, getAssignableRoles, canManageUser } from '@/lib/rbac';

// Get all users with their roles (admin/moderator only)
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { permission: 'VIEW_USERS' });

// Update user role
export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['USER', 'AUTHOR', 'EDITOR', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user can manage target user
    if (!canManageUser(user.role, targetUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage this user' },
        { status: 403 }
      );
    }

    // Check if user can assign this role
    const assignableRoles = getAssignableRoles(user.role);
    if (!assignableRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Cannot assign this role' },
        { status: 403 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { permission: 'MANAGE_USERS' });
