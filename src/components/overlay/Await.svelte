<div transition:fade>
  {#if loading}
    <h1>Loading...</h1>
  {/if}

  {#if updating}
    <h1>Saving...</h1>
  {/if}
</div>

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let updating = false;
  export let loading = false;

  loading && GameEvents.add('Loading::Complete', () => {
    GameEvents.remove('Loading::Complete', true);
    dispatch('complete');
  }, true);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div {
    margin: 0;
    padding: 0;
    z-index: 1;

    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;

    @include mixin.absolute-size;
    background-color: rgba(var.$black, 0.8);

    h1 {
      padding: 2.5vw 2.5vw 1.75vw;
      @include mixin.size(auto);

      position: relative;
      margin: auto;
    }
  }
</style>
