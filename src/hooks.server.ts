import { getSessionUser } from '$lib/server/auth/auth0';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = getSessionUser(event.request);
  return resolve(event);
};
