<script lang="ts">
  import type { Proposal } from '$lib/voting';
  import { WSClientMessageTypes, type State } from '$lib/ws';
  import Button from '../Button.svelte';
  import DragAndDrop from '../DragAndDrop.svelte';

  export let state: State;
  export let ws: WebSocket | null;

  let ranking = [...state.proposals];
</script>

{#if !state.hasVoted}
  <h1 class="text-l text-center">Rank the proposals in order of preference</h1>
  <DragAndDrop bind:proposals={ranking} on:reorder={(event) => (ranking = event.detail)} />

  <Button
    on:click={() => {
      ws?.send(
        JSON.stringify({
          type: WSClientMessageTypes.VOTE,
          payload: JSON.stringify(ranking.map((proposal, i) => proposal.name))
        })
      );
    }}>Submit</Button
  >
{/if}

<div class="primary mt-3 mb-3 text-center text-4xl p-2 rounded">
  {state.voteCount} votes
</div>

{#if state.hasVoted}
  <h1>
    You have voted. Please wait for everyone to finish voting before ending the voting session.
  </h1>
  {#if state.isAdmin}
    <Button
      on:click={() => {
        ws?.send(
          JSON.stringify({
            type: WSClientMessageTypes.SHOW_RESULTS,
            payload: ''
          })
        );
      }}>End Voting</Button
    >
  {/if}
{/if}
