<script lang="ts">
  import type { Proposal } from '$lib/voting';
  import ProposalItem from './ProposalItem.svelte';
  import IconArrowUpBold from '~icons/mdi/arrow-up-bold';
  import IconArrowDownBold from '~icons/mdi/arrow-down-bold';
  import { createEventDispatcher } from 'svelte';

  import { quintOut } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  const dispatch = createEventDispatcher();

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
      };
    }
  });

  export let proposals: Proposal[];

  let hovering: boolean | null | number = false;

  const drop = (event: DragEvent, target: number) => {
    console.log('drop', target);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
      const start = parseInt(event.dataTransfer.getData('text/plain'));
      const newProposalList = proposals;

      if (start < target) {
        newProposalList.splice(target + 1, 0, newProposalList[start]);
        newProposalList.splice(start, 1);
      } else {
        newProposalList.splice(target, 0, newProposalList[start]);
        newProposalList.splice(start + 1, 1);
      }
      dispatch('reorder', newProposalList);
      hovering = null;
    }
  };

  const dragstart = (event: DragEvent, i: number) => {
    console.log('dragstart', i);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.dropEffect = 'move';
      const start = i;
      event.dataTransfer.setData('text/plain', start.toString());
    }
  };
</script>

<div class="w-full">
  {#each proposals as proposal, index (proposal.name)}
    <div
      in:receive={{ key: proposal.name }}
      out:send={{ key: proposal.name }}
      animate:flip={{ duration: 150 }}
      class="my-2"
      draggable="true"
      role="button"
      tabindex="0"
      on:dragstart={(event) => dragstart(event, index)}
      on:drop|preventDefault={(event) => drop(event, index)}
      on:dragover|preventDefault={() => (hovering = index)}
      on:dragenter={() => (hovering = index)}
    >
      <ProposalItem {proposal} hover={hovering === index}>
        <div class="flex">
          <button
            class="text-3xl"
            on:click={() => {
              // Move one up
              if (index > 0) {
                const newProposalList = proposals;
                newProposalList.splice(index - 1, 0, newProposalList[index]);
                newProposalList.splice(index + 1, 1);
                proposals = newProposalList;
              }
            }}
          >
            <IconArrowUpBold />
          </button>
          <button
            class="text-3xl"
            on:click={() => {
              // Move one down
              if (index < proposals.length - 1) {
                const newProposalList = proposals;
                newProposalList.splice(index + 2, 0, newProposalList[index]);
                newProposalList.splice(index, 1);
                proposals = newProposalList;
              }
            }}
          >
            <IconArrowDownBold />
          </button>
        </div>
      </ProposalItem>
    </div>
  {/each}
</div>
