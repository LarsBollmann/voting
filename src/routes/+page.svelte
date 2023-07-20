<script lang="ts">
  import { goto } from '$app/navigation';

  let room_id = '';

  const createRoom = async () => {
    const response = await fetch('/api/createRoom', {
      method: 'POST'
    });
    const roomId = await response.text();

    goto(`/${roomId}`);
  };
</script>

<div class="flex flex-col justify-center items-center gap-3">
  <span class="mt-3"
    ><input
      type="text"
      placeholder="Room ID"
      value={room_id}
      maxlength="5"
      on:keypress={(event) => {
        if (event.key === 'Enter') {
          goto(`/${room_id}`);
        }
      }}
      on:input={(inp) => (room_id = inp.currentTarget.value.toUpperCase())}
    /><button on:click={() => goto(`/${room_id}`)} class="primary">Join</button></span
  >
  <button on:click={createRoom} class="primary">Create Room</button>
</div>
