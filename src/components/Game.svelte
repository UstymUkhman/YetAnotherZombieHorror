<div id="game">
  <canvas width={`${width}px`} height={`${height}px`} bind:this={scene}></canvas>
  <canvas width={`${width}px`} height={`${height}px`} bind:this={raindrops}></canvas>

  {#if app}
    <Interface on:firstDraw={app.start.bind(app)} />
  {/if}
</div>

<script lang="ts">
  import Interface from '@components/HUD/Interface.svelte';
  import Application from '@/managers/Application';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import Viewport from '@/utils/Viewport';

  let app: Application;
  export let running: boolean;

  let scene: HTMLCanvasElement;
  let raindrops: HTMLCanvasElement;

  const width = Viewport.size.width;
  const height = Viewport.size.height;

  const dispatch = createEventDispatcher();

  onMount(() => {
    app = new Application(scene, raindrops);
    dispatch('ready');
  });

  !import.meta.hot && onDestroy(
    () => app.destroy()
  );

  $: (run => {
    if (app?.ready) app.pause = !run;
  })(running);
</script>

<style lang="scss">
@use '@/variables' as var;

div#game,
div#game > canvas {
  transform: translate(-50%, -50%);
  aspect-ratio: var(--ratio);

  height: var(--height);
  width: var(--width);

  position: absolute;
  overflow: hidden;
  display: block;

  padding: 0;
  margin: 0;

  left: 50%;
  top: 50%;
}

div#game > canvas:nth-child(2) {
  transition: opacity 5s 500ms;
  pointer-events: none;
  opacity: 0;
}
</style>
