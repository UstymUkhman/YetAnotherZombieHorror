<main id="game">
  <canvas width={`${width}px`} height={`${height}px`} bind:this={scene}></canvas>
  <canvas width={`${width}px`} height={`${height}px`} bind:this={raindrops}></canvas>
</main>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Application from '@/Application';
  import Viewport from '@/utils/Viewport';

  let app: Application;
  let scene: HTMLCanvasElement;
  let raindrops: HTMLCanvasElement;

  const width = Viewport.size.width;
  const height = Viewport.size.height;

  onMount(() => {
    app = new Application(scene, raindrops);
  });

  !import.meta.hot && onDestroy(() => {
    app.destroy();
  });
</script>

<style lang="scss" global>
@use '@/variables' as var;

h1,
h2,
h3,
h4 {
  font-family: 'FaceYourFears', sans-serif;
  letter-spacing: normal;
  line-height: normal;

  position: relative;
  color: var.$red;
  display: block;

  padding: 0;
  margin: 0;
}

p,
h5,
h6,
span,
strong,
button {
  font-family: 'DrawingBlood', sans-serif;
  letter-spacing: 0.2rem;
  line-height: normal;

  position: relative;
  color: var.$grey;
  display: block;

  padding: 0;
  margin: 0;
}

h1 {
  text-transform: uppercase;
  letter-spacing: 0.5rem;

  line-height: 5vw;
  font-size: 5vw;
}

h2 {
  letter-spacing: 0.4rem;
  line-height: 4vw;
  font-size: 4vw;
}

h3 {
  letter-spacing: 0.3rem;
  line-height: 3vw;
  font-size: 3vw;
}

main,
main > canvas {
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

main > canvas:nth-child(2) {
  pointer-events: none;
}
</style>
