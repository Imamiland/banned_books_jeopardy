import { getSessionUser } from '$lib/server/auth/auth0';
import { deleteBoard } from '$lib/server/boards';
import { canDeleteBoard, type Board } from '$lib/utils/permissions';
import { json } from '@sveltejs/kit';

export async function DELETE({ request, params, locals }) {
  const user = getSessionUser(request) ?? locals.user;

  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const boardId = Number(params.id);

  const target: Board = { id: boardId, createdBy: '', published: false };
  if (!canDeleteBoard(user, target)) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteBoard(boardId);
  return json({ success: true });
}
