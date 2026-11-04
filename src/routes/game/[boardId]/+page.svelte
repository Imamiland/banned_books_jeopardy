<script lang="ts">
  import GameBoard from '$lib/components/game/GameBoard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<GameBoard board={data.board} />
