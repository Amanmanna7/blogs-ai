// Define UserRole type locally until Prisma client is regenerated
export type UserRole = 'USER' | 'AUTHOR' | 'EDITOR' | 'MODERATOR' | 'ADMIN';

// Role hierarchy - higher number means more permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  AUTHOR: 2,
  EDITOR: 3,
  MODERATOR: 4,
  ADMIN: 5,
};

// Permission definitions
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: ['ADMIN', 'MODERATOR'],
  VIEW_USERS: ['ADMIN', 'MODERATOR', 'EDITOR'],
  
  // Content management
  CREATE_CONTENT: ['ADMIN', 'EDITOR', 'AUTHOR'],
  EDIT_OWN_CONTENT: ['ADMIN', 'EDITOR', 'AUTHOR', 'USER'],
  EDIT_ANY_CONTENT: ['ADMIN', 'EDITOR'],
  DELETE_OWN_CONTENT: ['ADMIN', 'EDITOR', 'AUTHOR'],
  DELETE_ANY_CONTENT: ['ADMIN', 'EDITOR'],
  PUBLISH_CONTENT: ['ADMIN', 'EDITOR'],
  
  // Blog management
  MANAGE_BLOGS: ['ADMIN', 'EDITOR'],
  VIEW_ALL_BLOGS: ['ADMIN', 'EDITOR', 'MODERATOR'],
  VIEW_OWN_BLOGS: ['ADMIN', 'EDITOR', 'AUTHOR', 'USER'],
  
  // System management
  MANAGE_SYSTEM: ['ADMIN'],
  VIEW_ANALYTICS: ['ADMIN', 'EDITOR'],
  MANAGE_CATEGORIES: ['ADMIN', 'EDITOR'],
  
  // Moderation
  MODERATE_CONTENT: ['ADMIN', 'MODERATOR'],
  MANAGE_COMMENTS: ['ADMIN', 'MODERATOR', 'EDITOR'],
} as const;

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(userRole);
}

// Check if user has minimum role level
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Check if user can access specific role
export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  // Only admins can access admin features
  if (targetRole === 'ADMIN') {
    return userRole === 'ADMIN';
  }
  
  // Users can access roles at or below their level
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    USER: 'User',
    AUTHOR: 'Author',
    EDITOR: 'Editor',
    MODERATOR: 'Moderator',
    ADMIN: 'Administrator',
  };
  return displayNames[role];
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    USER: 'Basic user with limited access',
    AUTHOR: 'Can create and manage their own content',
    EDITOR: 'Can edit and manage all content',
    MODERATOR: 'Can moderate content and users',
    ADMIN: 'Full system access and management',
  };
  return descriptions[role];
}

// Get available roles for a user to assign
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ['USER', 'AUTHOR', 'EDITOR', 'MODERATOR', 'ADMIN'];
  
  // Only admins can assign all roles
  if (userRole === 'ADMIN') {
    return allRoles;
  }
  
  // Others can only assign roles below their level
  return allRoles.filter(role => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[userRole]);
}

// Check if user can manage another user
export function canManageUser(managerRole: UserRole, targetUserRole: UserRole): boolean {
  // Can't manage users with same or higher role
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetUserRole];
}
