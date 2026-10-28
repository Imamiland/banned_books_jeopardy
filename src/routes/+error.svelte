<script lang="ts">
  let { data } = $props();
  const { error, status } = data;
</script>

<svelte:head>
  <title>{status} — Banned Books Jeopardy</title>
</svelte:head>

<main class="bg-jeopardy-blue flex min-h-screen items-center justify-center text-white">
  <div class="max-w-md px-4 text-center">
    <h1 class="text-jeopardy-gold mb-4 text-6xl font-bold">{status}</h1>
    <p class="mb-6 text-xl text-gray-300">{error.message}</p>
    <a
      href="/"
      class="bg-jeopardy-gold text-jeopardy-blue inline-block rounded px-6 py-2 font-semibold transition-colors hover:bg-yellow-300"
    >
      Back to Home
    </a>
  </div>
</main>
