import { clearSession } from '$lib/server/auth/auth0';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  clearSession(cookies);
  redirect(303, '/');
};
