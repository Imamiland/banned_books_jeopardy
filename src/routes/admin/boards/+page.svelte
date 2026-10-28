<script lang="ts">
  import AdminNav from '$lib/components/AdminNav.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Admin Boards — Banned Books Jeopardy</title>
</svelte:head>

<AdminNav />

<main class="mx-auto max-w-4xl px-4 py-8">
  <h1 class="text-jeopardy-gold mb-6 text-3xl font-bold">All Boards</h1>

  {#if form?.error}
    <div class="mb-4 rounded border border-red-500 bg-red-900/50 p-3 text-red-200">
      {form.error}
    </div>
  {/if}

  {#if data.boards.length === 0}
    <p class="text-gray-400">
      No boards yet. <a
        href="/admin/boards/new"
        class="text-jeopardy-gold underline">Create one</a
      >.
    </p>
  {:else}
    <div class="grid gap-4">
      {#each data.boards as board (board.id)}
        <div
          class="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4"
        >
          <div>
            <h2 class="text-xl font-semibold text-white">{board.title}</h2>
            {#if board.description}
              <p class="mt-1 text-sm text-gray-400">{board.description}</p>
            {/if}
            <span
              class="mt-2 inline-block rounded px-2 py-1 text-xs {board.published
                ? 'bg-green-900 text-green-300'
                : 'bg-yellow-900 text-yellow-300'}"
            >
              {board.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div class="flex gap-2">
            <a
              href="/admin/boards/{board.id}/edit"
              class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Edit
            </a>
            {#if data.user?.role === 'administrator'}
              <form
                method="POST"
                action="?/default"
                class="inline"
              >
                <input
                  type="hidden"
                  name="boardId"
                  value={board.id}
                />
                <button
                  type="submit"
                  class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  onclick={(e) => {
                    if (!confirm(`Delete "${board.title}"? This cannot be undone.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>
