import { goto } from '$app/navigation';
import type { AuthUser } from '$lib/types/auth';

let user = $state<AuthUser | null>(null);

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
  goto('/auth/callback');
}

export function logout(): void {
  goto('/auth/logout');
}
