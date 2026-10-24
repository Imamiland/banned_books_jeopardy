import type { Role } from '$lib/utils/permissions';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
