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
  import { playSound } from '$lib/utils/sounds';
  import CategoryHeader from './CategoryHeader.svelte';
  import QuestionTile from './QuestionTile.svelte';
  import Timer from '../Timer.svelte';

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

  // Modal state: the question currently open and whether its answer is shown
  let activeQuestion = $state<Question | null>(null);
  let answerRevealed = $state(false);

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

  // Open the question modal for a tile
  function handleTileClick(question: Question) {
    // Don't allow clicking already answered tiles
    if (gameState.revealedTiles.has(question.id)) {
      return;
    }

    gameState = setCurrentQuestion(gameState, question);
    activeQuestion = question;
    answerRevealed = false;
    playSound('tile-flip');
  }

  // Reveal the answer (triggered by timer expiry or the reveal button)
  function revealAnswer() {
    if (!activeQuestion || answerRevealed) {
      return;
    }
    answerRevealed = true;
    playSound('answer-reveal');
  }

  // Close the modal, mark the tile answered, and check for completion
  function closeModal() {
    if (!activeQuestion) {
      return;
    }

    const question = activeQuestion;
    activeQuestion = null;
    answerRevealed = false;

    gameState = revealTile(gameState, question.id);
    gameState = setCurrentQuestion(gameState, null);

    if (isGameComplete(gameState, board.categories.length * 5)) {
      playSound('board-complete');
    }
  }

  // Handle reset button
  function handleReset() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      resetGameState(board.id);
      gameState = initGameState(board.id);
      activeQuestion = null;
      answerRevealed = false;
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

  // Map question categoryId to its category name for the modal header
  let categoryNameById = $derived(new Map(board.categories.map((cat) => [cat.id, cat.name])));

  let activeCategoryName = $derived(
    activeQuestion ? (categoryNameById.get(activeQuestion.categoryId) ?? '') : ''
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

  <!-- Question / Answer Modal -->
  {#if activeQuestion}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="w-full max-w-3xl rounded-2xl bg-blue-900 p-8 text-center shadow-2xl ring-4 ring-yellow-400"
      >
        <p class="mb-2 text-sm font-semibold tracking-widest text-yellow-400 uppercase">
          {activeCategoryName} · ${activeQuestion.value}
        </p>

        {#if !answerRevealed}
          <p class="mb-6 text-3xl leading-snug font-bold text-white">
            {activeQuestion.question}
          </p>

          <Timer
            timeLimit={activeQuestion.timeLimit}
            onExpire={revealAnswer}
            autoStart
          />

          <button
            type="button"
            onclick={revealAnswer}
            class="mt-6 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-blue-950 shadow-lg transition-colors hover:bg-yellow-300"
          >
            Reveal Answer
          </button>
        {:else}
          <p class="mb-6 text-3xl leading-snug font-bold text-yellow-300">
            {activeQuestion.answer}
          </p>

          <button
            type="button"
            onclick={closeModal}
            class="rounded-lg bg-green-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-green-600"
          >
            Continue
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
