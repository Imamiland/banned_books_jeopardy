<script lang="ts">
  import {
    initGameState,
    isGameComplete,
    resetGameState,
    revealTile,
    setCurrentQuestion
  } from '$lib/stores/gameStore';
  import type { Board, GameState, Question, TileState } from '$lib/types/game';
  import { onMount } from 'svelte';
  import CategoryHeader from './CategoryHeader.svelte';
  import QuestionTile from './QuestionTile.svelte';

  interface Props {
    board: Board;
  }

  let { board }: Props = $props();

  // Game state using $state rune (Svelte 5)
  let gameState = $state<GameState>({
    boardId: board.id,
    revealedTiles: new Set(),
    currentQuestion: null,
    startedAt: null
  });

  // Initialize game state from localStorage on mount
  onMount(() => {
    gameState = initGameState(board.id);
  });

  // Get tile state for a question
  function getTileState(question: Question): TileState {
    if (gameState.revealedTiles.has(question.id)) {
      return 'answered';
    }
    if (gameState.currentQuestion?.id === question.id) {
      return 'playing';
    }
    return 'unplayed';
  }

  // Handle tile click
  function handleTileClick(question: Question) {
    // Don't allow clicking already answered tiles
    if (gameState.revealedTiles.has(question.id)) {
      return;
    }

    // Set as current question (will trigger "playing" state)
    gameState = setCurrentQuestion(gameState, question);

    // TODO: Start timer, play sounds, show question modal
    // For now, we'll just reveal after a delay to simulate gameplay
    setTimeout(() => {
      gameState = revealTile(gameState, question.id);
      gameState = setCurrentQuestion(gameState, null);

      // Check if game is complete
      if (isGameComplete(gameState, board.categories.length * 5)) {
        // TODO: Play completion sound, show celebration
        console.log('Game complete!');
      }
    }, 3000); // 3 second delay to simulate question display
  }

  // Handle reset button
  function handleReset() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      resetGameState(board.id);
      gameState = initGameState(board.id);
    }
  }

  // Sort categories and questions by order
  let sortedCategories = $derived(
    [...board.categories]
      .sort((a, b) => a.order - b.order)
      .map((cat) => ({
        ...cat,
        questions: [...cat.questions].sort((a, b) => a.order - b.order)
      }))
  );
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 p-8">
  <div class="mx-auto max-w-7xl">
    <!-- Board Title -->
    <div class="mb-8 text-center">
      <h1 class="mb-2 text-5xl font-bold tracking-wide text-yellow-400 uppercase">
        {board.title}
      </h1>
      {#if board.description}
        <p class="text-lg text-white opacity-90">{board.description}</p>
      {/if}
    </div>

    <!-- Game Board Grid -->
    <div class="mb-8 grid grid-cols-5 gap-4">
      {#each sortedCategories as category (category.id)}
        <!-- Category Column -->
        <div class="flex flex-col gap-4">
          <!-- Category Header -->
          <CategoryHeader {category} />

          <!-- Question Tiles -->
          {#each category.questions as question (question.id)}
            <QuestionTile
              {question}
              state={getTileState(question)}
              onclick={() => handleTileClick(question)}
            />
          {/each}
        </div>
      {/each}
    </div>

    <!-- Game Controls -->
    <div class="flex justify-center gap-4">
      <button
        type="button"
        onclick={handleReset}
        class="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
      >
        Reset Game
      </button>

      <div class="rounded-lg bg-blue-800 px-6 py-3 font-semibold text-yellow-400 shadow-lg">
        Progress: {gameState.revealedTiles.size} / {board.categories.length * 5}
      </div>
    </div>
  </div>
</div>
