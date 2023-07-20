<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center justify-center">
  <h1 class="text-4xl text-center">Error {$page.status}</h1>
  <h3>{$page.error?.message}</h3>
  <button on:click={() => goto('/')} class="primary rounded p-2">Back</button>
</div>
