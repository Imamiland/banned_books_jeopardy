// Game state management using localStorage for persistence
// This ensures game progress is maintained across page refreshes

import { writable } from 'svelte/store';

export interface GameState {
  boardId: number;
  revealedTiles: number[]; // Array of question IDs that have been revealed
  currentQuestion: number | null; // Currently active question ID
  startedAt: number; // Timestamp when game started
  completedAt?: number; // Timestamp when game completed
  score?: number; // Optional scoring (not currently used)
}

function createGameStateStore() {
  const { subscribe, set, update } = writable<GameState | null>(null);

  return {
    subscribe,

    /**
     * Initialize game state for a board
     * Loads existing state from localStorage or creates new state
     * @param boardId - The ID of the board to initialize
     */
    init: (boardId: number) => {
      const key = `game-state-${boardId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        try {
          const state = JSON.parse(saved) as GameState;
          set(state);
          console.log('Loaded saved game state:', state);
        } catch (err) {
          console.error('Failed to parse saved game state:', err);
          // Create new state if parsing fails
          const newState: GameState = {
            boardId,
            revealedTiles: [],
            currentQuestion: null,
            startedAt: Date.now()
          };
          set(newState);
          localStorage.setItem(key, JSON.stringify(newState));
        }
      } else {
        const newState: GameState = {
          boardId,
          revealedTiles: [],
          currentQuestion: null,
          startedAt: Date.now()
        };
        set(newState);
        localStorage.setItem(key, JSON.stringify(newState));
        console.log('Created new game state:', newState);
      }
    },

    /**
     * Mark a tile/question as revealed
     * @param questionId - The ID of the question to reveal
     */
    revealTile: (questionId: number) => {
      update((state) => {
        if (!state) return state;

        // Don't add duplicate
        if (state.revealedTiles.includes(questionId)) {
          return state;
        }

        const newState: GameState = {
          ...state,
          revealedTiles: [...state.revealedTiles, questionId],
          currentQuestion: questionId
        };

        // Persist to localStorage
        const key = `game-state-${state.boardId}`;
        localStorage.setItem(key, JSON.stringify(newState));

        return newState;
      });
    },

    /**
     * Set the currently active question
     * @param questionId - The ID of the current question, or null for none
     */
    setCurrentQuestion: (questionId: number | null) => {
      update((state) => {
        if (!state) return state;

        const newState: GameState = {
          ...state,
          currentQuestion: questionId
        };

        const key = `game-state-${state.boardId}`;
        localStorage.setItem(key, JSON.stringify(newState));

        return newState;
      });
    },

    /**
     * Mark the game as completed
     */
    complete: () => {
      update((state) => {
        if (!state) return state;

        const newState: GameState = {
          ...state,
          completedAt: Date.now(),
          currentQuestion: null
        };

        const key = `game-state-${state.boardId}`;
        localStorage.setItem(key, JSON.stringify(newState));

        return newState;
      });
    },

    /**
     * Get current game state (for checking revealed tiles etc)
     * @returns Current game state or null
     */
    getState: (): GameState | null => {
      let state: GameState | null = null;
      const unsubscribe = subscribe((s: GameState | null) => {
        state = s;
      });
      unsubscribe();
      return state;
    },

    /**
     * Reset game state for a board
     * Clears localStorage and resets store
     * @param boardId - The ID of the board to reset
     */
    reset: (boardId: number) => {
      const key = `game-state-${boardId}`;
      localStorage.removeItem(key);
      set(null);
      console.log('Game state reset for board:', boardId);
    },

    /**
     * Clear all game states from localStorage
     * Useful for development/debugging
     */
    clearAll: () => {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('game-state-')) {
          localStorage.removeItem(key);
        }
      });
      set(null);
      console.log('All game states cleared');
    }
  };
}

export const gameState = createGameStateStore();
