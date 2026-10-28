import { deleteBoard } from '$lib/server/boards';
import { db } from '$lib/server/db';
import { boards } from '$lib/server/db/schema';
import { canDeleteBoard, canViewBoard, type Board } from '$lib/utils/permissions';
import { fail, redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

export async function load({ locals }) {
  const user = locals.user;

  if (!user) {
    redirect(303, '/');
  }

  const allBoards = await db.select().from(boards).orderBy(desc(boards.createdAt));
  const visibleBoards = allBoards.filter((board) => canViewBoard(user, board));

  return { boards: visibleBoards, user };
}

export const actions = {
  async default({ request, locals }) {
    const user = locals.user;

    if (!user) {
      redirect(303, '/');
    }

    const formData = await request.formData();
    const boardId = Number(formData.get('boardId'));

    const target: Board = { id: boardId, createdBy: '', published: false };
    if (!canDeleteBoard(user, target)) {
      return fail(403, { error: 'You do not have permission to delete this board.' });
    }

    await deleteBoard(boardId);
    redirect(303, '/admin/boards');
  }
};
