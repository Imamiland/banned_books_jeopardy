import { mockUser, setSession } from '$lib/server/auth/auth0';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
  const role = (url.searchParams.get('role') ?? 'player') as 'administrator' | 'creator' | 'player';
  setSession(cookies, mockUser(role));
  redirect(303, '/');
};
