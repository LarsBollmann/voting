<script lang="ts">
  import type { Proposal } from '$lib/voting';
  import ProposalItem from '../ProposalItem.svelte';
  import { WSClientMessageTypes, type WSClientMessage, type State } from '$lib/ws';
  import Button from '../Button.svelte';

  export let ws: WebSocket | null;
  export let state: State;

  const addProposal = (proposal: string) => {
    console.log(ws);
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WSClientMessageTypes.ADD_PROPOSAL,
          payload: proposal
        } as WSClientMessage)
      );
    }
  };
</script>

<input
  class="w-full p-2 border border-gray-300 rounded"
  type="text"
  on:keypress={(event) => {
    if (event.key === 'Enter') {
      if (event.target instanceof HTMLInputElement) {
        addProposal(event.target.value);
        event.target.value = '';
      }
    }
  }}
  placeholder="Enter an Item"
/>
<div class="flex flex-col w-full mt-3 mb-12">
  {#each state.proposals as proposal (proposal.name)}
    <ProposalItem {proposal}>
      {#if proposal.canDelete}
        <button
          class="primary"
          on:click={() => {
            if (ws) {
              ws.send(
                JSON.stringify({
                  type: WSClientMessageTypes.REMOVE_PROPOSAL,
                  payload: proposal.name
                })
              );
            }
          }}>X</button
        >
      {/if}
    </ProposalItem>
  {/each}
</div>

{#if state.isAdmin}
  <Button
    on:click={() =>
      ws?.send(
        JSON.stringify({
          type: WSClientMessageTypes.START_VOTING,
          payload: ''
        })
      )}>Start Voting</Button
  >
{/if}
