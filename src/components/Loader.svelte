<div class="screen" transition:fade>
  {#if loading}
    <h1 class="progress">Loading...</h1>
  {/if}

  {#if !loading}
    <Button text="Play" on:click={() => dispatch('start')} />
  {/if}
</div>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import Button from '@components/Button.svelte';
  import { GameEvents } from '@/events/GameEvents';

  const dispatch = createEventDispatcher();
  let loading = true;

  function onComplete (): void {
    GameEvents.remove('Loading::Complete', true);
    loading = false;
  }

  GameEvents.add('Loading::Complete', onComplete, true);
</script>

<style lang="scss">
@use '@/variables' as var;

div.screen {
  background-color: var.$black;
  justify-content: center;

  align-items: center;
  position: absolute;
  display: flex;

  height: 100%;
  width: 100%;

  z-index: 1;
  padding: 0;
  margin: 0;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

  h1.progress {
    position: absolute;
    line-height: 5vw;

    display: block;
    width: 25.75vw;

    margin: auto;
    height: 5vw;

    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
  }

  :global(button) {
    transform: translateX(-50%);
    position: absolute;

    display: block;
    margin: auto;

    bottom: 0;
    left: 50%;
    top: 0;
  }
}
</style>
