import { dev } from '$app/environment';

export function mockAuthEnabled(env: Record<string, string | undefined>): boolean {
  return dev && env.ALLOW_MOCK_AUTH === 'true';
}
