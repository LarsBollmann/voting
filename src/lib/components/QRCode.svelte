<script lang="ts">
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  export let width: number = 100;

  onMount(() => {
    const canvas = document.getElementById('canvas');
    const url = window.location.href;

    if (canvas) {
      QRCode.toCanvas(
        canvas,
        url,
        {
          width: width,
          margin: 2
        },
        function (error) {
          if (error) console.error(error);
        }
      );
    }
  });
</script>

<canvas id="canvas" {...$$restProps} />
