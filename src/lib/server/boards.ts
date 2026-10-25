import { CATEGORY_COUNT, QUESTION_COUNT, VALUES } from '$lib/constants';
import { db } from '$lib/server/db/index';
import { boards, categories, questions, users } from '$lib/server/db/schema';
import type { AuthUser } from '$lib/types/auth';
import type { Board } from '$lib/types/game';
import { eq } from 'drizzle-orm';

export interface BoardFormData {
  title: string;
  description: string;
  published: boolean;
  categories: {
    name: string;
    questions: {
      question: string;
      answer: string;
      timeLimit: number;
    }[];
  }[];
}

export interface BoardWithContent {
  id: number;
  title: string;
  description: string | null;
  published: boolean;
  createdBy: string;
  categories: {
    name: string;
    questions: {
      value: number;
      question: string;
      answer: string;
      timeLimit: number;
    }[];
  }[];
}

function emptyFormData(): BoardFormData {
  return {
    title: '',
    description: '',
    published: false,
    categories: Array.from({ length: CATEGORY_COUNT }, () => ({
      name: '',
      questions: Array.from({ length: QUESTION_COUNT }, () => ({
        question: '',
        answer: '',
        timeLimit: 30
      }))
    }))
  };
}

export function parseBoardForm(formData: FormData): BoardFormData {
  const data = emptyFormData();

  data.title = (formData.get('title') as string | null) ?? '';
  data.description = (formData.get('description') as string | null) ?? '';
  data.published = formData.get('published') === 'on';

  for (let i = 0; i < CATEGORY_COUNT; i++) {
    data.categories[i].name = (formData.get(`category-${i}-name`) as string | null) ?? '';
    for (let j = 0; j < QUESTION_COUNT; j++) {
      data.categories[i].questions[j].question =
        (formData.get(`question-${i}-${j}-question`) as string | null) ?? '';
      data.categories[i].questions[j].answer =
        (formData.get(`question-${i}-${j}-answer`) as string | null) ?? '';
      const rawTimeLimit = formData.get(`question-${i}-${j}-timeLimit`);
      const timeLimit = rawTimeLimit === null || rawTimeLimit === '' ? NaN : Number(rawTimeLimit);
      data.categories[i].questions[j].timeLimit = Number.isFinite(timeLimit) ? timeLimit : 30;
    }
  }

  return data;
}

export async function upsertUser(user: AuthUser): Promise<void> {
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
    .onConflictDoNothing();
}

export async function createBoardFromForm(formData: FormData, user: AuthUser): Promise<number> {
  const data = parseBoardForm(formData);
  await upsertUser(user);

  const [board] = await db
    .insert(boards)
    .values({
      title: data.title,
      description: data.description || null,
      createdBy: user.id,
      published: data.published
    })
    .returning();

  for (let i = 0; i < CATEGORY_COUNT; i++) {
    const [category] = await db
      .insert(categories)
      .values({
        boardId: board.id,
        name: data.categories[i].name,
        order: i
      })
      .returning();

    for (let j = 0; j < QUESTION_COUNT; j++) {
      const q = data.categories[i].questions[j];
      await db.insert(questions).values({
        categoryId: category.id,
        value: VALUES[j],
        question: q.question,
        answer: q.answer,
        timeLimit: q.timeLimit,
        order: j
      });
    }
  }

  return board.id;
}

export async function updateBoardFromForm(
  formData: FormData,
  boardId: number,
  user: AuthUser
): Promise<void> {
  const data = parseBoardForm(formData);
  await upsertUser(user);

  await db
    .update(boards)
    .set({
      title: data.title,
      description: data.description || null,
      published: data.published,
      updatedAt: new Date()
    })
    .where(eq(boards.id, boardId));

  const existing = await db.select().from(categories).where(eq(categories.boardId, boardId));
  for (const category of existing) {
    await db.delete(categories).where(eq(categories.id, category.id));
  }

  for (let i = 0; i < CATEGORY_COUNT; i++) {
    const [category] = await db
      .insert(categories)
      .values({
        boardId,
        name: data.categories[i].name,
        order: i
      })
      .returning();

    for (let j = 0; j < QUESTION_COUNT; j++) {
      const q = data.categories[i].questions[j];
      await db.insert(questions).values({
        categoryId: category.id,
        value: VALUES[j],
        question: q.question,
        answer: q.answer,
        timeLimit: q.timeLimit,
        order: j
      });
    }
  }
}

export async function getBoardForGame(boardId: number): Promise<Board | null> {
  const [board] = await db.select().from(boards).where(eq(boards.id, boardId));
  if (!board) return null;

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.boardId, boardId))
    .orderBy(categories.order);

  const result: Board = {
    id: board.id,
    title: board.title,
    description: board.description,
    createdBy: board.createdBy,
    published: board.published,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    categories: []
  };

  for (const cat of cats) {
    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, cat.id))
      .orderBy(questions.order);

    result.categories.push({
      id: cat.id,
      boardId: cat.boardId,
      name: cat.name,
      order: cat.order,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      questions: qs.map((q) => ({
        id: q.id,
        categoryId: q.categoryId,
        value: q.value,
        question: q.question,
        answer: q.answer,
        timeLimit: q.timeLimit,
        order: q.order,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      }))
    });
  }

  return result;
}

export async function getBoardWithContent(boardId: number): Promise<BoardWithContent | null> {
  const [board] = await db.select().from(boards).where(eq(boards.id, boardId));
  if (!board) return null;

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.boardId, boardId))
    .orderBy(categories.order);

  const result: BoardWithContent = {
    id: board.id,
    title: board.title,
    description: board.description,
    published: board.published,
    createdBy: board.createdBy,
    categories: []
  };

  for (const cat of cats) {
    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, cat.id))
      .orderBy(questions.order);

    result.categories.push({
      name: cat.name,
      questions: qs.map((q) => ({
        value: q.value,
        question: q.question,
        answer: q.answer,
        timeLimit: q.timeLimit
      }))
    });
  }

  return result;
}
