// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthUser } from '$lib/types/auth';

declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
    }
  }
}

export {};
