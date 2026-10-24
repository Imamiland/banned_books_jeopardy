<script lang="ts">
  import { login, logout } from '$lib/stores/auth';
  import type { AuthUser } from '$lib/types/auth';

  interface Props {
    user?: AuthUser | null;
  }

  let { user = null }: Props = $props();
</script>

<nav class="flex items-center justify-between border-b border-yellow-400 bg-blue-900 px-6 py-3">
  <a
    href="/"
    class="text-xl font-bold tracking-wide text-yellow-400 uppercase"
  >
    Banned Books Jeopardy
  </a>

  <div class="flex items-center gap-4">
    {#if user}
      <a
        href="/admin/boards/new"
        class="font-semibold text-white hover:text-yellow-400"
      >
        New Board
      </a>
      <span class="text-sm text-white opacity-75">{user.name} ({user.role})</span>
      <button
        type="button"
        onclick={logout}
        class="font-semibold text-white hover:text-yellow-400"
      >
        Log out
      </button>
    {:else}
      <button
        type="button"
        onclick={login}
        class="font-semibold text-yellow-400 hover:text-white"
      >
        Log in
      </button>
    {/if}
  </div>
</nav>
