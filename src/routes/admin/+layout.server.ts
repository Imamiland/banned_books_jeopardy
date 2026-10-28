import { canCreateBoard } from '$lib/utils/permissions';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const user = locals.user;

  if (!user || !canCreateBoard(user)) {
    redirect(303, '/');
  }

  return { user };
}
