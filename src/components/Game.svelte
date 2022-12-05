<canvas bind:this={scene} width={width} height={height} />

{#if app}
  <Interface on:start={onStart} on:firstUpdate />
{/if}

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type Raindrops from '@components/overlay/Raindrops.svelte';
  import Interface from '@components/HUD/Interface.svelte';

  import { GameEvents } from '@/events/GameEvents';
  import Application from '@/managers/Application';
  import Viewport from '@/utils/Viewport';

  let app: Application;
  export let running: boolean;
  let scene: HTMLCanvasElement;
  export let raindrops: Raindrops;

  const width = Viewport.size.width;
  const height = Viewport.size.height;
  const dispatch = createEventDispatcher();

  function onStart (): void {
    app.start(raindrops.$$.ctx[0] as HTMLCanvasElement);
  }

  onMount(() => {
    app = new Application(scene);

    GameEvents.add('Game::LoopInit', () => {
      GameEvents.add('Game::Quit', () => dispatch('quit'), true);
      GameEvents.remove('Game::LoopInit', true);
      dispatch('ready');
    }, true);
  });

  onDestroy(() => {
    GameEvents.remove('Game::Quit', true);
    app.dispose();
  });

  $: (run => {
    if (app?.ready) app.pause = !run;
  })(running);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  canvas {
    @include mixin.size(var(--width), var(--height));
    @include mixin.center-transform;

    aspect-ratio: var(--ratio);
    pointer-events: none;
    overflow: hidden;

    padding: 0;
    margin: 0;
  }
</style>
