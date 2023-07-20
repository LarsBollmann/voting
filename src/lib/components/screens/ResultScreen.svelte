<script lang="ts">
  import { WSClientMessageTypes, type State } from '$lib/ws';
  import Button from '../Button.svelte';

  export let state: State;
  export let ws: WebSocket | null;
</script>

<h1>Results</h1>
<h2>Winner: {state.winner}</h2>

{#if state.isAdmin}
  <Button
    on:click={() => {
      ws?.send(
        JSON.stringify({
          type: WSClientMessageTypes.RESET,
          payload: ''
        })
      );
    }}>Reset</Button
  >
{/if}
