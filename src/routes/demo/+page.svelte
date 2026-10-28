<script lang="ts">
  import GameBoard from '$lib/components/game/GameBoard.svelte';
  import { mockBoard } from '$lib/data/mockBoard';
</script>

<GameBoard board={mockBoard} />
