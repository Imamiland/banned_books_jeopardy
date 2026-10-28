import { goto } from '$app/navigation';
import type { AuthUser } from '$lib/types/auth';

let user: AuthUser | null = null;

export function setUser(next: AuthUser | null): void {
  user = next;
}

export function getUser(): AuthUser | null {
  return user;
}

export function isAuthenticated(): boolean {
  return user !== null;
}

export function login(): void {
  goto('/auth/login');
}

export function logout(): void {
  goto('/auth/logout');
}
