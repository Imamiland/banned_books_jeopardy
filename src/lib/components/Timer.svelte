<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playSound, stopSound } from '$lib/utils/sounds';

  interface Props {
    timeLimit?: number;
    onExpire?: () => void;
    autoStart?: boolean;
  }

  let { timeLimit = 30, onExpire, autoStart = true }: Props = $props();

  let timeRemaining = $state(timeLimit);
  let isRunning = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (isRunning) return;

    isRunning = true;
    timeRemaining = timeLimit;
    playSound('timer-tick', true);

    intervalId = setInterval(() => {
      timeRemaining--;

      if (timeRemaining <= 0) {
        stop();
        stopSound('timer-tick');
        playSound('timer-expire');
        onExpire?.();
      }
    }, 1000);
  }

  function stop() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    stopSound('timer-tick');
  }

  function reset() {
    stop();
    timeRemaining = timeLimit;
  }

  onMount(() => {
    if (autoStart) {
      start();
    }
  });

  onDestroy(() => {
    stop();
  });

  // Expose methods for parent components
  export function startTimer() {
    start();
  }

  export function stopTimer() {
    stop();
  }

  export function resetTimer() {
    reset();
  }
</script>

<div class="timer flex flex-col items-center justify-center">
  <div
    class="timer-display text-6xl font-bold"
    class:text-red-500={timeRemaining <= 5}
    class:text-yellow-500={timeRemaining > 5 && timeRemaining <= 10}
    class:text-white={timeRemaining > 10}
  >
    {timeRemaining}s
  </div>

  <div class="timer-controls mt-4 flex gap-2">
    {#if !isRunning}
      <button
        onclick={start}
        class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Start
      </button>
    {:else}
      <button
        onclick={stop}
        class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Stop
      </button>
    {/if}

    <button
      onclick={reset}
      class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
    >
      Reset
    </button>
  </div>
</div>

<style>
  .timer {
    padding: 2rem;
    border-radius: 1rem;
    background: rgba(0, 0, 0, 0.5);
  }

  .timer-display {
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 10px currentColor;
  }
</style>
