<h1>You Are Dead</h1>

<div>
  <Button text="Restart" on:click={() => { dispatch('restart') }} />
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '@/ui/Button';

  const dispatch = createEventDispatcher();
</script>

<style>
h1 {
  display: table;
}

div {
  margin: 5vw auto 0;
  display: table;
}
</style>
