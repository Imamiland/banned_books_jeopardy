/**
 * Game state store for tracking revealed tiles and current question
 * Uses localStorage for persistence across page refreshes
 */

import type { GameState, Question } from '$lib/types/game';

/**
 * Initialize game state from localStorage or create new state
 */
export function initGameState(boardId: number): GameState {
  const key = `game-state-${boardId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      boardId,
      revealedTiles: new Set(parsed.revealedTiles || []),
      currentQuestion: parsed.currentQuestion || null,
      startedAt: parsed.startedAt ? new Date(parsed.startedAt) : null
    };
  }

  return {
    boardId,
    revealedTiles: new Set(),
    currentQuestion: null,
    startedAt: null
  };
}

/**
 * Save game state to localStorage
 */
export function saveGameState(state: GameState): void {
  const key = `game-state-${state.boardId}`;
  const data = {
    boardId: state.boardId,
    revealedTiles: Array.from(state.revealedTiles),
    currentQuestion: state.currentQuestion,
    startedAt: state.startedAt?.toISOString()
  };

  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Mark a question as revealed
 */
export function revealTile(state: GameState, questionId: number): GameState {
  const newState = {
    ...state,
    revealedTiles: new Set(state.revealedTiles).add(questionId)
  };

  saveGameState(newState);
  return newState;
}

/**
 * Set the current question being played
 */
export function setCurrentQuestion(state: GameState, question: Question | null): GameState {
  const newState = {
    ...state,
    currentQuestion: question
  };

  saveGameState(newState);
  return newState;
}

/**
 * Reset game state (clear all progress)
 */
export function resetGameState(boardId: number): void {
  const key = `game-state-${boardId}`;
  localStorage.removeItem(key);
}

/**
 * Check if all tiles have been revealed
 */
export function isGameComplete(state: GameState, totalQuestions: number): boolean {
  return state.revealedTiles.size === totalQuestions;
}
