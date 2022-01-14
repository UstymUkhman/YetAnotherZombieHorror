<div transition:fade>
  {#if assetsLoading || sceneLoading}
    <h1 class="progress">Loading...</h1>
  {/if}
</div>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { GameEvents } from '@/events/GameEvents';

  let assetsLoading = true;
  export let sceneLoading: boolean;
  const dispatch = createEventDispatcher();

  GameEvents.add('Loading::Complete', () => {
    GameEvents.remove('Loading::Complete', true);
    assetsLoading = false;
    dispatch('complete');
  }, true);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;
  @import "@/animations";

  div {
    @include mixin.center-size;
    background-color: var.$black;

    justify-content: center;
    align-items: center;
    display: flex;

    z-index: 1;
    padding: 0;
    margin: 0;

    h1.progress {
      text-align: center;
      @include mixin.center-size(100%, 5vw);
      animation: 2s linear infinite loading;
    }
  }
</style>
