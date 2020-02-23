{#if !loaded}
  <div class="loading" transition:fade="{{ duration: 250 }}">
    <h3>Loading...</h3>
    <h3>{ loading }%</h3>
  </div>
{/if}

{#if loaded}
  <div class="start" transition:fade="{{ duration: 250, delay: 250 }}">
    <Button text="Start" on:click={() => { dispatch('close') }} />
  </div>
{/if}

<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '@/ui/Button';

  const dispatch = createEventDispatcher();

  export let loading;
  export let loaded;
</script>

<style>
.loading {
  transform: translate(-50%, -50%);
  justify-content: space-between;
  position: absolute;

  min-width: 24vw;
  display: flex;
  margin: auto;

  left: 50%;
  top: 50%;
}

.start {
  transform: translate(-50%, -50%);
  position: absolute;
  display: block;
  margin: auto;

  left: 50%;
  top: 50%;
}
</style>
