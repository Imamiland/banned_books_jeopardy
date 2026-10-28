import { db } from '$lib/server/db/index';
import { boards } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const published = await db
    .select()
    .from(boards)
    .where(eq(boards.published, true))
    .orderBy(desc(boards.createdAt));

  return { boards: published, user: locals.user };
};
