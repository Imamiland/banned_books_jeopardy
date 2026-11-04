/**
 * Game types for the Jeopardy board
 */

export interface Board {
  id: number;
  title: string;
  description: string | null;
  createdBy: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
}

export interface Category {
  id: number;
  boardId: number;
  name: string;
  order: number; // 0-4 for display order
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
}

export interface Question {
  id: number;
  categoryId: number;
  value: number; // 100, 200, 300, 400, 500
  question: string; // The "answer" in Jeopardy format
  answer: string; // The "question" in Jeopardy format
  timeLimit: number; // seconds (default: 30)
  order: number; // 0-4 for display order
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client-side game state for tracking tile states
 */
export type TileState = 'unplayed' | 'playing' | 'answered';

export interface GameState {
  boardId: number;
  revealedTiles: Set<number>; // Set of question IDs that have been answered
  currentQuestion: Question | null;
  startedAt: Date | null;
}

export interface QuestionTileProps {
  question: Question;
  state: TileState;
  onclick?: () => void;
}

export interface CategoryHeaderProps {
  category: Category;
}

export interface GameBoardProps {
  board: Board;
}
