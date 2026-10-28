/**
 * Tests for game types
 * These tests validate type guards, mock data factories, and runtime type checking
 */

import { describe, expect, it, vi } from 'vitest';
import type {
  Board,
  Category,
  CategoryHeaderProps,
  GameBoardProps,
  GameState,
  Question,
  QuestionTileProps,
  TileState
} from './game';

describe('Game Types', () => {
  describe('Question', () => {
    it('should create a valid question object', () => {
      const question: Question = {
        id: 1,
        categoryId: 1,
        value: 100,
        question: 'This 1960 novel by Harper Lee features Scout Finch',
        answer: 'What is To Kill a Mockingbird?',
        timeLimit: 30,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(question.id).toBe(1);
      expect(question.value).toBe(100);
      expect(question.question).toContain('Harper Lee');
      expect(question.answer).toContain('To Kill a Mockingbird');
    });

    it('should accept valid Jeopardy values', () => {
      const validValues = [100, 200, 300, 400, 500];

      for (const value of validValues) {
        const question: Question = {
          id: 1,
          categoryId: 1,
          value,
          question: 'Test question',
          answer: 'Test answer',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(question.value).toBe(value);
      }
    });

    it('should accept valid order values (0-4)', () => {
      const validOrders = [0, 1, 2, 3, 4];

      for (const order of validOrders) {
        const question: Question = {
          id: 1,
          categoryId: 1,
          value: 100,
          question: 'Test question',
          answer: 'Test answer',
          timeLimit: 30,
          order,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(question.order).toBe(order);
      }
    });

    it('should handle Date objects for timestamps', () => {
      const now = new Date();
      const question: Question = {
        id: 1,
        categoryId: 1,
        value: 100,
        question: 'Test question',
        answer: 'Test answer',
        timeLimit: 30,
        order: 0,
        createdAt: now,
        updatedAt: now
      };

      expect(question.createdAt).toBeInstanceOf(Date);
      expect(question.updatedAt).toBeInstanceOf(Date);
      expect(question.createdAt.getTime()).toBe(now.getTime());
    });
  });

  describe('Category', () => {
    it('should create a valid category with questions', () => {
      const questions: Question[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        categoryId: 1,
        value: (i + 1) * 100,
        question: `Question ${i + 1}`,
        answer: `Answer ${i + 1}`,
        timeLimit: 30,
        order: i,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const category: Category = {
        id: 1,
        boardId: 1,
        name: 'Classic Novels',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions
      };

      expect(category.questions).toHaveLength(5);
      expect(category.questions[0].value).toBe(100);
      expect(category.questions[4].value).toBe(500);
    });

    it('should accept valid order values (0-4)', () => {
      const validOrders = [0, 1, 2, 3, 4];

      for (const order of validOrders) {
        const category: Category = {
          id: 1,
          boardId: 1,
          name: 'Test Category',
          order,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions: []
        };

        expect(category.order).toBe(order);
      }
    });

    it('should allow empty questions array', () => {
      const category: Category = {
        id: 1,
        boardId: 1,
        name: 'Empty Category',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: []
      };

      expect(category.questions).toHaveLength(0);
    });
  });

  describe('Board', () => {
    it('should create a valid board with categories', () => {
      const board: Board = {
        id: 1,
        title: 'Banned Books Trivia',
        description: 'Test your knowledge',
        createdBy: 'user-123',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      };

      expect(board.id).toBe(1);
      expect(board.title).toBe('Banned Books Trivia');
      expect(board.published).toBe(true);
    });

    it('should allow null description', () => {
      const board: Board = {
        id: 1,
        title: 'Test Board',
        description: null,
        createdBy: 'user-123',
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      };

      expect(board.description).toBeNull();
    });

    it('should contain 5 categories for a complete board', () => {
      const categories: Category[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        boardId: 1,
        name: `Category ${i + 1}`,
        order: i,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: []
      }));

      const board: Board = {
        id: 1,
        title: 'Complete Board',
        description: null,
        createdBy: 'user-123',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories
      };

      expect(board.categories).toHaveLength(5);
    });

    it('should handle published and draft states', () => {
      const publishedBoard: Board = {
        id: 1,
        title: 'Published',
        description: null,
        createdBy: 'user-123',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      };

      const draftBoard: Board = {
        id: 2,
        title: 'Draft',
        description: null,
        createdBy: 'user-123',
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      };

      expect(publishedBoard.published).toBe(true);
      expect(draftBoard.published).toBe(false);
    });
  });

  describe('TileState', () => {
    it('should accept valid tile states', () => {
      const validStates: TileState[] = ['unplayed', 'playing', 'answered'];

      for (const state of validStates) {
        const tileState: TileState = state;
        expect(['unplayed', 'playing', 'answered']).toContain(tileState);
      }
    });

    it('should be used in state transitions', () => {
      // Simulate state transition
      let state: TileState = 'unplayed';
      expect(state).toBe('unplayed');

      state = 'playing';
      expect(state).toBe('playing');

      state = 'answered';
      expect(state).toBe('answered');
    });
  });

  describe('GameState', () => {
    it('should create initial game state', () => {
      const gameState: GameState = {
        boardId: 1,
        revealedTiles: new Set(),
        currentQuestion: null,
        startedAt: null
      };

      expect(gameState.boardId).toBe(1);
      expect(gameState.revealedTiles.size).toBe(0);
      expect(gameState.currentQuestion).toBeNull();
      expect(gameState.startedAt).toBeNull();
    });

    it('should track revealed tiles using Set', () => {
      const gameState: GameState = {
        boardId: 1,
        revealedTiles: new Set([1, 2, 3]),
        currentQuestion: null,
        startedAt: null
      };

      expect(gameState.revealedTiles.has(1)).toBe(true);
      expect(gameState.revealedTiles.has(2)).toBe(true);
      expect(gameState.revealedTiles.has(3)).toBe(true);
      expect(gameState.revealedTiles.has(4)).toBe(false);
      expect(gameState.revealedTiles.size).toBe(3);
    });

    it('should track current question being played', () => {
      const question: Question = {
        id: 5,
        categoryId: 1,
        value: 300,
        question: 'Current question',
        answer: 'Current answer',
        timeLimit: 30,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const gameState: GameState = {
        boardId: 1,
        revealedTiles: new Set(),
        currentQuestion: question,
        startedAt: new Date()
      };

      expect(gameState.currentQuestion).not.toBeNull();
      expect(gameState.currentQuestion?.id).toBe(5);
      expect(gameState.currentQuestion?.value).toBe(300);
    });

    it('should track game start time', () => {
      const startTime = new Date();
      const gameState: GameState = {
        boardId: 1,
        revealedTiles: new Set(),
        currentQuestion: null,
        startedAt: startTime
      };

      expect(gameState.startedAt).toBeInstanceOf(Date);
      expect(gameState.startedAt?.getTime()).toBe(startTime.getTime());
    });
  });

  describe('Component Props Interfaces', () => {
    describe('QuestionTileProps', () => {
      it('should define required props', () => {
        const question: Question = {
          id: 1,
          categoryId: 1,
          value: 100,
          question: 'Test',
          answer: 'Test',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const props: QuestionTileProps = {
          question,
          state: 'unplayed'
        };

        expect(props.question).toBe(question);
        expect(props.state).toBe('unplayed');
        expect(props.onclick).toBeUndefined();
      });

      it('should accept optional onclick handler', () => {
        const question: Question = {
          id: 1,
          categoryId: 1,
          value: 100,
          question: 'Test',
          answer: 'Test',
          timeLimit: 30,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const clickHandler = vi.fn();

        const props: QuestionTileProps = {
          question,
          state: 'playing',
          onclick: clickHandler
        };

        expect(props.onclick).toBe(clickHandler);
      });
    });

    describe('CategoryHeaderProps', () => {
      it('should define category prop', () => {
        const category: Category = {
          id: 1,
          boardId: 1,
          name: 'Test Category',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions: []
        };

        const props: CategoryHeaderProps = {
          category
        };

        expect(props.category).toBe(category);
      });
    });

    describe('GameBoardProps', () => {
      it('should define board prop', () => {
        const board: Board = {
          id: 1,
          title: 'Test Board',
          description: null,
          createdBy: 'user-123',
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          categories: []
        };

        const props: GameBoardProps = {
          board
        };

        expect(props.board).toBe(board);
      });
    });
  });

  describe('Type Relationships', () => {
    it('should maintain foreign key relationships', () => {
      const boardId = 1;
      const categoryId = 10;

      const category: Category = {
        id: categoryId,
        boardId,
        name: 'Test',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: []
      };

      const question: Question = {
        id: 100,
        categoryId: category.id,
        value: 100,
        question: 'Test',
        answer: 'Test',
        timeLimit: 30,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(category.boardId).toBe(boardId);
      expect(question.categoryId).toBe(categoryId);
    });

    it('should support nested data structure', () => {
      const question: Question = {
        id: 1,
        categoryId: 1,
        value: 100,
        question: 'Q',
        answer: 'A',
        timeLimit: 30,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const category: Category = {
        id: 1,
        boardId: 1,
        name: 'Cat',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [question]
      };

      const board: Board = {
        id: 1,
        title: 'Board',
        description: null,
        createdBy: 'user',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: [category]
      };

      // Verify nested structure
      expect(board.categories[0].questions[0].value).toBe(100);
    });
  });

  describe('Type Guards and Validation Helpers', () => {
    it('should validate Jeopardy question values', () => {
      const validValues = new Set([100, 200, 300, 400, 500]);
      const isValidValue = (value: number) => validValues.has(value);

      expect(isValidValue(100)).toBe(true);
      expect(isValidValue(200)).toBe(true);
      expect(isValidValue(500)).toBe(true);
      expect(isValidValue(150)).toBe(false);
      expect(isValidValue(1000)).toBe(false);
    });

    it('should validate order range (0-4)', () => {
      const isValidOrder = (order: number) => order >= 0 && order <= 4;

      expect(isValidOrder(0)).toBe(true);
      expect(isValidOrder(2)).toBe(true);
      expect(isValidOrder(4)).toBe(true);
      expect(isValidOrder(-1)).toBe(false);
      expect(isValidOrder(5)).toBe(false);
    });

    it('should validate tile state transitions', () => {
      const validTransitions: Record<TileState, TileState[]> = {
        unplayed: ['playing'],
        playing: ['answered'],
        answered: []
      };

      const isValidTransition = (from: TileState, to: TileState) => {
        return validTransitions[from].includes(to);
      };

      // Valid transitions
      expect(isValidTransition('unplayed', 'playing')).toBe(true);
      expect(isValidTransition('playing', 'answered')).toBe(true);

      // Invalid transitions
      expect(isValidTransition('unplayed', 'answered')).toBe(false);
      expect(isValidTransition('answered', 'playing')).toBe(false);
      expect(isValidTransition('answered', 'unplayed')).toBe(false);
    });

    it('should check if board is complete (25 questions)', () => {
      function isCompleteBoard(board: Board): boolean {
        if (board.categories.length !== 5) {
          return false;
        }
        for (const cat of board.categories) {
          if (cat.questions.length !== 5) {
            return false;
          }
        }
        return true;
      }

      // Incomplete board
      const incompleteBoard: Board = {
        id: 1,
        title: 'Incomplete',
        description: null,
        createdBy: 'user',
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      };

      expect(isCompleteBoard(incompleteBoard)).toBe(false);

      // Complete board - build categories
      const categories: Category[] = [];
      for (let i = 0; i < 5; i++) {
        const questions: Question[] = [];
        for (let j = 0; j < 5; j++) {
          questions.push({
            id: i * 5 + j + 1,
            categoryId: i + 1,
            value: (j + 1) * 100,
            question: 'Q',
            answer: 'A',
            timeLimit: 30,
            order: j,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        categories.push({
          id: i + 1,
          boardId: 1,
          name: `Cat ${i}`,
          order: i,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions
        });
      }

      const completeBoard: Board = {
        ...incompleteBoard,
        categories
      };

      expect(isCompleteBoard(completeBoard)).toBe(true);
    });
  });
});
