<script lang="ts">
  import type { Proposal } from '$lib/voting';
  import { createEventDispatcher } from 'svelte';

  export let proposal: Proposal;
  export let hover = false;
</script>

<span
  class="flex justify-between items-center secondary pl-4 rounded mt-1 mb-1 h-10"
  class:is-active={hover}
  {...$$restProps}
>
  <div class="text-center text-l font-bold overflow-hidden" style="flex-basis: 80%">
    {proposal.name}
  </div>
  <slot />
</span>

<style>
  .is-active {
    background-color: var(--primary);
    color: var(--background);
  }
</style>
