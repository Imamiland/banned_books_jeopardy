import { getBoardWithContent, updateBoardFromForm } from '$lib/server/boards';
import { canEditBoard } from '$lib/utils/permissions';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    redirect(303, '/');
  }

  const boardId = Number(params.id);
  const board = await getBoardWithContent(boardId);
  if (!board) {
    redirect(303, '/');
  }

  if (!canEditBoard(user, board)) {
    redirect(303, '/');
  }

  return { user, board };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const user = locals.user;
    if (!user) {
      redirect(303, '/');
    }

    const boardId = Number(params.id);
    const board = await getBoardWithContent(boardId);
    if (!board || !canEditBoard(user, board)) {
      redirect(303, '/');
    }

    const formData = await request.formData();
    await updateBoardFromForm(formData, boardId, user);
    redirect(303, `/admin/boards/${boardId}/edit`);
  }
};
