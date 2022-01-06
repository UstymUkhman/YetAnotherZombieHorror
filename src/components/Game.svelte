<div>
  <canvas bind:this={scene} width={width} height={height} />

  {#if raindrops}
    <canvas bind:this={camera} width={width} height={height} />
  {/if}

  {#if app}
    <Interface on:firstDraw={onFirstDraw} />
  {/if}
</div>

<script lang="ts">
  import Interface from '@components/HUD/Interface.svelte';
  import { GameEvents } from '@/events/GameEvents';
  import Application from '@/managers/Application';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  import Viewport from '@/utils/Viewport';
  import Settings from '@/settings';

  let app: Application;
  export let running: boolean;

  let scene: HTMLCanvasElement;
  let camera: HTMLCanvasElement;

  const width = Viewport.size.width;
  const height = Viewport.size.height;

  const dispatch = createEventDispatcher();
  const raindrops = Settings.getEnvironmentValue('raindrops');

  function onFirstDraw (): void {
    dispatch('firstDraw');
    app.start();
  }

  onMount(() => {
    app = new Application(scene, camera);

    GameEvents.add('Game::LoopInit', () => {
      GameEvents.remove('Game::LoopInit', true);
      dispatch('ready');
    }, true);
  });

  !import.meta.hot && onDestroy(
    () => app.destroy()
  );

  $: (run => {
    if (app?.ready) app.pause = !run;
  })(running);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div,
  div > canvas {
    @include mixin.size(var(--width), var(--height));
    @include mixin.center-transform;

    aspect-ratio: var(--ratio);
    overflow: hidden;

    padding: 0;
    margin: 0;
  }

  div > canvas:nth-child(2) {
    transition: opacity 5s 500ms;
    pointer-events: none;
    opacity: 0;
  }
</style>
