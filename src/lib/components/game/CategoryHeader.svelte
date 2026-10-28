<script lang="ts">
  import type { Category } from '$lib/types/game';

  interface Props {
    category: Category;
  }

  let { category }: Props = $props();
</script>

<div
  class="flex min-h-[100px] items-center justify-center rounded-lg border-2 border-yellow-400 bg-blue-800 p-4"
>
  <h2 class="text-center text-2xl font-bold tracking-wide text-yellow-400 uppercase">
    {category.name}
  </h2>
</div>
