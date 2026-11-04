<script lang="ts">
  import AdminNav from '$lib/components/AdminNav.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>Users — Banned Books Jeopardy</title>
</svelte:head>

<AdminNav />

<main class="mx-auto max-w-4xl px-4 py-8">
  <h1 class="text-jeopardy-gold mb-6 text-3xl font-bold">Users</h1>

  {#if data.users.length === 0}
    <p class="text-gray-400">No users registered yet.</p>
  {:else}
    <table class="w-full text-left text-sm">
      <thead class="border-b border-gray-700 text-gray-400">
        <tr>
          <th class="py-2 pr-4">Name</th>
          <th class="py-2 pr-4">Email</th>
          <th class="py-2 pr-4">Role</th>
          <th class="py-2">Created</th>
        </tr>
      </thead>
      <tbody>
        {#each data.users as u (u.id)}
          <tr class="border-b border-gray-800">
            <td class="py-2 pr-4 text-white">{u.name ?? '—'}</td>
            <td class="py-2 pr-4 text-gray-300">{u.email}</td>
            <td class="py-2 pr-4">
              <span class="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-200">{u.role}</span>
            </td>
            <td class="py-2 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
