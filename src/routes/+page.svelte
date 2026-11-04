<script lang="ts">
  import AdminNav from '$lib/components/AdminNav.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<AdminNav user={data.user} />

<main class="mx-auto max-w-4xl px-6 py-10">
  <header class="mb-8 text-center">
    <h1 class="text-4xl font-bold tracking-wide text-yellow-400 uppercase">
      Banned Books Jeopardy
    </h1>
    <p class="mt-2 text-white opacity-75">
      Test your knowledge of frequently challenged and banned books
    </p>
  </header>

  {#if data.boards.length === 0}
    <p class="text-center text-white opacity-75">No published boards yet. Log in to create one.</p>
  {:else}
    <ul class="grid gap-4">
      {#each data.boards as board (board.id)}
        <li>
          <a
            href="/game/{board.id}"
            class="block border border-yellow-400 bg-blue-900 p-5 transition hover:bg-blue-800"
          >
            <h2 class="text-2xl font-bold text-yellow-400">{board.title}</h2>
            {#if board.description}
              <p class="mt-1 text-white opacity-75">{board.description}</p>
            {/if}
            <span class="mt-2 inline-block text-sm font-semibold text-white opacity-75">
              Play →
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</main>
