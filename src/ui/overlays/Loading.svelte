{#if !loaded}
  <h3 class="title" transition:fade="{{ duration: 250 }}">
    <span>Loading...</span>
    <span class="progress">{ loading }%</span>
  </h3>
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
.title {
  transform: translate(-50%, -50%);
  letter-spacing: 1px;
  position: absolute;
  font-size: 1.5vw;
  width: 11.25vw;

  color: #ffffff;
  display: table;
  margin: auto;

  left: 50%;
  top: 50%;
}

.progress {
  position: absolute;
  right: 0;
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
