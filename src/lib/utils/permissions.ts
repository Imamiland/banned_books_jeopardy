// Permission checks for role-based access control (RBAC)

export type Role = 'administrator' | 'creator' | 'player';

export interface User {
  id: string;
  role: Role;
}

export interface Board {
  id: number;
  createdBy: string;
  published: boolean;
}

/**
 * Check if a user can view a specific board
 * - Anyone can view published boards
 * - Authenticated users can view their own unpublished boards
 * - Administrators can view any board
 */
export function canViewBoard(user: User | null, board: Board): boolean {
  // Anyone can view published boards
  if (board.published) return true;

  // Must be authenticated to view unpublished boards
  if (!user) return false;

  // Admins can view any board
  if (user.role === 'administrator') return true;

  // Creators can view their own boards
  if (user.role === 'creator' && board.createdBy === user.id) return true;

  return false;
}

/**
 * Check if a user can edit a specific board
 * - Administrators can edit any board
 * - Creators can edit their own boards
 * - Players cannot edit any board
 */
export function canEditBoard(user: User | null, board: Board): boolean {
  if (!user) return false;

  // Admins can edit any board
  if (user.role === 'administrator') return true;

  // Creators can edit their own boards
  if (user.role === 'creator' && board.createdBy === user.id) return true;

  return false;
}

/**
 * Check if a user can delete a specific board
 * - Only administrators can delete boards
 */
export function canDeleteBoard(user: User | null, board: Board): boolean {
  if (!user) return false;

  // Only admins can delete boards
  return user.role === 'administrator';
}

/**
 * Check if a user can create a new board
 * - Administrators and creators can create boards
 * - Players cannot create boards
 */
export function canCreateBoard(user: User | null): boolean {
  if (!user) return false;

  return user.role === 'administrator' || user.role === 'creator';
}

/**
 * Check if a user can manage users (view, edit roles, delete)
 * - Only administrators can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return user?.role === 'administrator';
}

/**
 * Check if a user can publish a board
 * - Administrators can publish any board
 * - Creators can publish their own boards
 */
export function canPublishBoard(user: User | null, board: Board): boolean {
  // Use canEditBoard as the base check since publishing requires edit permissions
  return canEditBoard(user, board);
}
