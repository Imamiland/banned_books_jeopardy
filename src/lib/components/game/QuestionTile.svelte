<script lang="ts">
  import type { Question, TileState } from '$lib/types/game';

  interface Props {
    question: Question;
    state: TileState;
    onclick?: () => void;
  }

  let { question, state, onclick }: Props = $props();

  // Compute display text based on tile state
  let displayText = $derived(() => {
    if (state === 'unplayed') {
      return `$${question.value}`;
    }
    if (state === 'playing') {
      return question.question;
    }
    // state === 'answered'
    return question.answer;
  });

  // Compute CSS classes based on state
  let tileClasses = $derived(() => {
    const base =
      'flex items-center justify-center p-4 border-2 border-yellow-400 rounded-lg transition-all duration-300 cursor-pointer min-h-[120px]';

    if (state === 'unplayed') {
      return `${base} bg-blue-600 hover:bg-blue-500 text-yellow-400 text-4xl font-bold shadow-lg hover:shadow-xl hover:scale-105`;
    }

    if (state === 'playing') {
      return `${base} bg-blue-800 text-white text-xl font-semibold animate-pulse`;
    }

    // answered
    return `${base} bg-gray-700 text-gray-400 cursor-not-allowed opacity-60`;
  });
</script>

<button
  type="button"
  class={tileClasses()}
  onclick={state === 'answered' ? undefined : onclick}
  disabled={state === 'answered'}
  aria-label={state === 'unplayed' ? `${question.value} point question` : displayText()}
>
  <span class={state === 'playing' ? 'text-center' : ''}>
    {displayText()}
  </span>
</button>

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
