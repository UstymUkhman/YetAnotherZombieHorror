<h1 class="title">Pause</h1>

<div class="resume">
  <Button text="Resume" on:click={() => { dispatch('close') }} />
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

.resume {
  margin: 5vw auto 0;
  display: table;
}
</style>
