import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { canManageUsers } from '$lib/utils/permissions';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const user = locals.user;

  if (!user || !canManageUsers(user)) {
    redirect(303, '/');
  }

  const allUsers = await db.select().from(users);

  return { users: allUsers, user };
}
