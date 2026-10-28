import type { AuthUser } from '$lib/types/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBoardForm } from './boards';

function makeUser(role: 'administrator' | 'creator' | 'player' = 'creator'): AuthUser {
  return {
    id: `user-${role}`,
    email: `${role}@example.com`,
    name: role,
    role
  };
}

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set('title', 'Test Board');
  fd.set('description', 'A test board');
  fd.set('published', 'on');
  for (let i = 0; i < 5; i++) {
    fd.set(`category-${i}-name`, `Category ${i + 1}`);
    for (let j = 0; j < 5; j++) {
      fd.set(`question-${i}-${j}-question`, `Q${i}-${j}`);
      fd.set(`question-${i}-${j}-answer`, `A${i}-${j}`);
      fd.set(`question-${i}-${j}-timeLimit`, '30');
    }
  }
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v);
  }
  return fd;
}

describe('parseBoardForm', () => {
  it('parses a complete form into BoardFormData', () => {
    const data = parseBoardForm(makeFormData());
    expect(data.title).toBe('Test Board');
    expect(data.description).toBe('A test board');
    expect(data.published).toBe(true);
    expect(data.categories).toHaveLength(5);
    expect(data.categories[0].name).toBe('Category 1');
    expect(data.categories[0].questions).toHaveLength(5);
    expect(data.categories[0].questions[0].question).toBe('Q0-0');
    expect(data.categories[0].questions[0].answer).toBe('A0-0');
    expect(data.categories[0].questions[0].timeLimit).toBe(30);
  });

  it('defaults timeLimit to 30 when missing', () => {
    const fd = makeFormData();
    fd.delete('question-0-0-timeLimit');
    const data = parseBoardForm(fd);
    expect(data.categories[0].questions[0].timeLimit).toBe(30);
  });

  it('defaults published to false when missing', () => {
    const fd = makeFormData();
    fd.delete('published');
    const data = parseBoardForm(fd);
    expect(data.published).toBe(false);
  });

  it('treats "false" string as false', () => {
    const data = parseBoardForm(makeFormData({ published: 'false' }));
    expect(data.published).toBe(false);
  });
});

describe('createBoardFromForm', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('inserts user, board, categories, and questions', async () => {
    const insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        onConflictDoNothing: vi.fn().mockResolvedValue(undefined)
      })
    });
    const update = vi.fn();
    const select = vi.fn();
    const deleteFn = vi.fn();

    vi.doMock('$lib/server/db/index', () => ({
      db: {
        insert,
        update,
        select,
        delete: deleteFn
      }
    }));

    const { createBoardFromForm: create } = await import('./boards');
    const user = makeUser('creator');
    const id = await create(makeFormData(), user);

    expect(id).toBe(1);
    expect(insert).toHaveBeenCalledTimes(32); // 1 user + 1 board + 5 categories + 25 questions
  });
});

describe('updateBoardFromForm', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('updates the board and re-inserts categories', async () => {
    const insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        onConflictDoNothing: vi.fn().mockResolvedValue(undefined)
      })
    });
    const updateMock = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined)
      })
    });
    const selectResult = [{ id: 10, boardId: 1, name: 'Old', order: 0 }];
    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(selectResult)
      })
    });
    const deleteFn = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined)
    });

    vi.doMock('$lib/server/db/index', () => ({
      db: {
        insert,
        update: updateMock,
        select,
        delete: deleteFn
      }
    }));

    const { updateBoardFromForm: updateBoard } = await import('./boards');
    const user = makeUser('creator');
    await updateBoard(makeFormData(), 1, user);

    expect(updateMock).toHaveBeenCalled();
    expect(deleteFn).toHaveBeenCalled();
  });
});

describe('getBoardWithContent', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns null when board not found', async () => {
    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    });
    vi.doMock('$lib/server/db/index', () => ({
      db: { select }
    }));

    const { getBoardWithContent: get } = await import('./boards');
    const result = await get(999);
    expect(result).toBeNull();
  });
});
