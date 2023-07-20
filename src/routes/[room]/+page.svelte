<script lang="ts">
  import LobbyScreen from '$lib/components/screens/LobbyScreen.svelte';
  import ProposalScreen from '$lib/components/screens/ProposalScreen.svelte';
  import ResultScreen from '$lib/components/screens/ResultScreen.svelte';
  import VotingScreen from '$lib/components/screens/VotingScreen.svelte';

  import { WSServerMessageTypes, WSClientMessageTypes, type Screen, type State } from '$lib/ws';
  import { onMount, onDestroy, setContext } from 'svelte';

  export let data;

  let state = data.state;

  let ws: WebSocket | null = null;

  let wsError: string | null = null;

  const ping = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: WSClientMessageTypes.PING,
          payload: null
        })
      );
    }
    setTimeout(() => {
      ping();
    }, 1000 * 30);
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/websocket?room=${state.roomId}`);

    ws.onclose = () => {
      ws = null;
      connectWebSocket();
    };

    ws.addEventListener('message', (event) => {
      let message = JSON.parse(event.data);
      switch (message.type) {
        case WSServerMessageTypes.SEND_STATE:
          const payload = JSON.parse(message.payload) as State;
          state = payload;
          wsError = null;
          break;
        case WSServerMessageTypes.ERROR:
          wsError = message.payload;
          break;
      }
    });

    ping();
  };

  onMount(() => {
    connectWebSocket();
  });

  onDestroy(() => {
    if (ws) {
      ws.close();
    }
  });
</script>

<div class="m-3 flex flex-col items-center">
  {#if wsError}
    <div class="text-red-500">{wsError}</div>
  {:else if !ws || ws.readyState !== WebSocket.OPEN}
    <div class="text-gray-500">Connecting...</div>
  {:else}
    {#if state.screen == 'lobby'}
      <LobbyScreen bind:ws bind:state />
    {/if}

    {#if state.screen == 'proposing'}
      <ProposalScreen bind:ws bind:state />
    {/if}

    {#if state.screen == 'voting'}
      <VotingScreen bind:ws bind:state />
    {/if}

    {#if state.screen == 'results'}
      <ResultScreen bind:ws bind:state />
    {/if}
  {/if}
</div>
