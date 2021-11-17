<div id="game">
  <canvas width={width} height={height} bind:this={scene} />

  {#if raindrops}
    <canvas width={width} height={height} bind:this={camera} />
  {/if}

  {#if app}
    <Interface on:firstDraw={() => {
      dispatch('firstDraw');
      app.start();
    }} />
  {/if}
</div>

<script lang="ts">
  import Interface from '@components/HUD/Interface.svelte';
  import Application from '@/managers/Application';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  import Viewport from '@/utils/Viewport';
  import Configs from '@/configs';

  let app: Application;
  export let running: boolean;

  let scene: HTMLCanvasElement;
  let camera: HTMLCanvasElement;

  const width = Viewport.size.width;
  const height = Viewport.size.height;

  const { raindrops } = Configs.Settings;
  const dispatch = createEventDispatcher();

  onMount(() => {
    app = new Application(scene, camera);
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
@use "@/variables" as var;

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
