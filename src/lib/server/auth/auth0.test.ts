import type { AuthUser } from '$lib/types/auth';
import type { Cookies } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import {
  clearSession,
  clearSessionCookie,
  createSessionCookie,
  getSessionUser,
  mockUser,
  setSession
} from './auth0';

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'auth0|user1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'creator',
    ...overrides
  };
}

describe('auth0 mock', () => {
  describe('mockUser', () => {
    it('returns an administrator user', () => {
      const user = mockUser('administrator');
      expect(user.role).toBe('administrator');
      expect(user.id).toBe('mock-administrator');
      expect(user.email).toBe('administrator@example.com');
    });

    it('returns a creator user', () => {
      const user = mockUser('creator');
      expect(user.role).toBe('creator');
      expect(user.id).toBe('mock-creator');
    });

    it('returns a player user', () => {
      const user = mockUser('player');
      expect(user.role).toBe('player');
      expect(user.id).toBe('mock-player');
    });
  });

  describe('getSessionUser', () => {
    it('returns null when no cookie is present', () => {
      const request = new Request('http://localhost:5173/');
      expect(getSessionUser(request)).toBeNull();
    });

    it('returns null for malformed cookie data', () => {
      const request = new Request('http://localhost:5173/', {
        headers: { cookie: 'session=not-base64' }
      });
      expect(getSessionUser(request)).toBeNull();
    });

    it('returns null for invalid JSON in cookie', () => {
      const bad = btoa('not-json');
      const request = new Request('http://localhost:5173/', {
        headers: { cookie: `session=${bad}` }
      });
      expect(getSessionUser(request)).toBeNull();
    });

    it('returns the user from a valid cookie', () => {
      const user = makeUser();
      const cookie = createSessionCookie(user);
      const request = new Request('http://localhost:5173/', {
        headers: { cookie }
      });
      const result = getSessionUser(request);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('auth0|user1');
      expect(result!.role).toBe('creator');
    });
  });

  describe('createSessionCookie', () => {
    it('produces a Set-Cookie string with the session name', () => {
      const cookie = createSessionCookie(makeUser());
      expect(cookie).toContain('session=');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Max-Age=604800');
    });
  });

  describe('clearSessionCookie', () => {
    it('produces an expired cookie', () => {
      const cookie = clearSessionCookie();
      expect(cookie).toContain('session=');
      expect(cookie).toContain('Max-Age=0');
    });
  });

  describe('setSession / clearSession', () => {
    it('setSession calls cookies.set with the session cookie', () => {
      const set = vi.fn();
      const cookies = { set, delete: vi.fn() } as unknown as Cookies;
      setSession(cookies, makeUser());
      expect(set).toHaveBeenCalledWith('session', expect.any(String), expect.any(Object));
    });

    it('clearSession calls cookies.delete', () => {
      const deleteFn = vi.fn();
      const cookies = { set: vi.fn(), delete: deleteFn } as unknown as Cookies;
      clearSession(cookies);
      expect(deleteFn).toHaveBeenCalledWith('session', expect.any(Object));
    });
  });
});
