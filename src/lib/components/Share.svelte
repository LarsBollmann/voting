<script lang="ts">
  import ContentCopy from '~icons/mdi/content-copy';
  import QrCodeIcon from '~icons/mdi/qrcode';
  import QrCode from './QRCode.svelte';
  import { onMount } from 'svelte';

  let url = '';
  onMount(() => {
    url = window.location.href;
  });
  let showQrCode = false;
</script>

<span class={'flex' + ($$restProps.class ? ' ' + $$restProps.class : '')}>
  <input type="text" value={url} disabled class="w-full h-full text-s" /><button
    class="primary rounded p-2 ml-0.5 h-full"
    on:click={() => navigator.clipboard.writeText(url)}><ContentCopy /></button
  >
  <button on:click={() => (showQrCode = !showQrCode)} class="primary rounded p-2 ml-0.5 h-full"
    ><QrCodeIcon /></button
  >
</span>

{#if showQrCode}
  <QrCode width={200} class="m-3" />
{/if}
