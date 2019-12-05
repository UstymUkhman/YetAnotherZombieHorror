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
.title {
  text-transform: uppercase;
  letter-spacing: 3px;

  margin: 8vw auto 0;
  color: #ffffff;

  font-size: 2vw;
  display: table;
}

.resume {
  margin: 250px auto 0;
  display: table;
}
</style>
