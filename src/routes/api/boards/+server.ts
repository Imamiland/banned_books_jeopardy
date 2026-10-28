import { getSessionUser } from '$lib/server/auth/auth0';
import { db } from '$lib/server/db/index';
import { boards, users } from '$lib/server/db/schema';
import { canCreateBoard } from '$lib/utils/permissions';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const published = await db.select().from(boards).where(eq(boards.published, true));
  return json(published);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = getSessionUser(request) ?? locals.user;
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canCreateBoard(user)) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, published } = body as {
    title: string;
    description?: string;
    published?: boolean;
  };

  if (!title) {
    return json({ error: 'Title is required' }, { status: 400 });
  }

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
    .onConflictDoNothing();

  const [created] = await db
    .insert(boards)
    .values({
      title,
      description: description ?? null,
      createdBy: user.id,
      published: published ?? false
    })
    .returning();

  return json(created, { status: 201 });
};
