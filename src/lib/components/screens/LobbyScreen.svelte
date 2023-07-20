<script lang="ts">
  import Button from '../Button.svelte';
  import { WSClientMessageTypes, type WSClientMessage, type State } from '$lib/ws';
  import QrCode from '../QRCode.svelte';
  import Share from '../Share.svelte';

  export let ws: WebSocket | null = null;
  export let state: State;

  const startProposing = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WSClientMessageTypes.START_PROPOSING,
          payload: ''
        } as WSClientMessage)
      );
    }
  };
</script>

<div class="flex flex-col items-center mb-10">
  <h1 class="text-4xl">Lobby</h1>
  <h3 class="text-xl w-full rounded p-3 text-center">Room ID: {state.roomId}</h3>
  <Share class="h-10 mb-2" />
  <h3 class="text-xl">{state.userCount} connected</h3>
</div>

{#if state.isAdmin}
  <Button on:click={startProposing}>Start Proposing</Button>
{/if}
