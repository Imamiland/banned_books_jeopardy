import type { AuthUser } from '$lib/types/auth';
import type { Role } from '$lib/utils/permissions';

const SESSION_COOKIE = 'session';
const MAX_AGE = 60 * 60 * 24 * 7;

function encodeSession(user: AuthUser): string {
  return btoa(JSON.stringify(user));
}

function decodeSession(value: string): AuthUser | null {
  try {
    return JSON.parse(atob(value)) as AuthUser;
  } catch {
    return null;
  }
}

export function getSessionUser(request: Request): AuthUser | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;

  return decodeSession(decodeURIComponent(match[1]));
}

export function createSessionCookie(user: AuthUser): string {
  const value = encodeURIComponent(encodeSession(user));
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function mockUser(role: Role = 'player'): AuthUser {
  const names: Record<Role, string> = {
    administrator: 'Admin',
    creator: 'Creator',
    player: 'Player'
  };

  return {
    id: `mock-${role}`,
    email: `${role}@example.com`,
    name: names[role],
    role
  };
}
