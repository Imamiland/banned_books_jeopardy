import { getBoardForGame } from '$lib/server/boards';
import { canViewBoard } from '$lib/utils/permissions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;

  const boardId = Number(params.boardId);
  const board = await getBoardForGame(boardId);
  if (!board) {
    redirect(303, '/');
  }

  if (!canViewBoard(user, board)) {
    redirect(303, '/');
  }

  return { board };
};
