<script lang="ts">
  import AdminNav from '$lib/components/AdminNav.svelte';
  import BoardEditor from '$lib/components/BoardEditor.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, formAction }: { data: PageData; formAction: ActionData } = $props();
</script>

<AdminNav user={data.user} />

<h1 class="px-8 pt-6 text-3xl font-bold text-yellow-400">Edit Board</h1>

<form
  method="post"
  action={formAction}
>
  <BoardEditor initial={data.board} />
  <div class="mx-auto max-w-5xl px-8 pb-8">
    <button
      type="submit"
      class="rounded bg-yellow-400 px-6 py-3 font-bold text-blue-900 hover:bg-yellow-300"
    >
      Save Changes
    </button>
  </div>
</form>
