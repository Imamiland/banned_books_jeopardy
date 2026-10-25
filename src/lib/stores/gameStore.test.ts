import type { GameState, Question } from '$lib/types/game';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initGameState,
  isGameComplete,
  resetGameState,
  revealTile,
  saveGameState,
  setCurrentQuestion
} from './gameStore';

function makeQuestion(id: number): Question {
  return {
    id,
    categoryId: 1,
    value: 100,
    question: 'Q',
    answer: 'A',
    timeLimit: 30,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function makeState(
  boardId: number,
  revealed: number[] = [],
  current: Question | null = null
): GameState {
  return {
    boardId,
    revealedTiles: new Set(revealed),
    currentQuestion: current,
    startedAt: new Date()
  };
}

describe('gameStore', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    });
  });

  describe('initGameState', () => {
    it('creates a fresh state when no saved data exists', () => {
      const state = initGameState(1);
      expect(state.boardId).toBe(1);
      expect(state.revealedTiles.size).toBe(0);
      expect(state.currentQuestion).toBeNull();
      expect(state.startedAt).toBeNull();
    });

    it('restores state from localStorage', () => {
      const saved = {
        boardId: 2,
        revealedTiles: [1, 2, 3],
        currentQuestion: null,
        startedAt: new Date('2025-01-01T00:00:00Z').toISOString()
      };
      store['game-state-2'] = JSON.stringify(saved);

      const state = initGameState(2);
      expect(state.boardId).toBe(2);
      expect(state.revealedTiles.size).toBe(3);
      expect(state.revealedTiles.has(1)).toBe(true);
      expect(state.revealedTiles.has(4)).toBe(false);
      expect(state.startedAt).toBeInstanceOf(Date);
    });

    it('throws on malformed JSON', () => {
      store['game-state-1'] = 'not-json';
      expect(() => initGameState(1)).toThrow();
    });
  });

  describe('saveGameState', () => {
    it('serializes Set to array and Date to ISO string', () => {
      const state = makeState(1, [10, 20]);
      saveGameState(state);

      const raw = store['game-state-1'];
      expect(raw).toBeDefined();
      const parsed = JSON.parse(raw!);
      expect(parsed.boardId).toBe(1);
      expect(parsed.revealedTiles).toEqual([10, 20]);
      expect(typeof parsed.startedAt).toBe('string');
    });
  });

  describe('revealTile', () => {
    it('adds a question id to revealedTiles and saves', () => {
      const state = makeState(1, [1]);
      const newState = revealTile(state, 2);

      expect(newState.revealedTiles.has(2)).toBe(true);
      expect(newState.revealedTiles.size).toBe(2);
      expect(state.revealedTiles.size).toBe(1);
      expect(store['game-state-1']).toBeDefined();
    });

    it('does not duplicate an already-revealed tile', () => {
      const state = makeState(1, [1, 2]);
      const newState = revealTile(state, 1);
      expect(newState.revealedTiles.size).toBe(2);
    });
  });

  describe('setCurrentQuestion', () => {
    it('sets currentQuestion and saves', () => {
      const state = makeState(1);
      const q = makeQuestion(5);
      const newState = setCurrentQuestion(state, q);

      expect(newState.currentQuestion).toEqual(q);
      expect(state.currentQuestion).toBeNull();
      expect(store['game-state-1']).toBeDefined();
    });
  });

  describe('resetGameState', () => {
    it('removes the localStorage key', () => {
      store['game-state-1'] = 'data';
      resetGameState(1);
      expect(store['game-state-1']).toBeUndefined();
    });
  });

  describe('isGameComplete', () => {
    it('returns false when tiles remain', () => {
      const state = makeState(1, [1, 2]);
      expect(isGameComplete(state, 5)).toBe(false);
    });

    it('returns true when all tiles are revealed', () => {
      const state = makeState(1, [1, 2, 3, 4, 5]);
      expect(isGameComplete(state, 5)).toBe(true);
    });
  });
});
