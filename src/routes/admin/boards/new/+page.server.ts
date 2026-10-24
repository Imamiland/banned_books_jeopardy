import { createBoardFromForm } from '$lib/server/boards';
import { canCreateBoard } from '$lib/utils/permissions';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user || !canCreateBoard(user)) {
    redirect(303, '/');
  }

  return { user };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user;
    if (!user || !canCreateBoard(user)) {
      redirect(303, '/');
    }

    const formData = await request.formData();
    const boardId = await createBoardFromForm(formData, user);
    redirect(303, `/admin/boards/${boardId}/edit`);
  }
};
