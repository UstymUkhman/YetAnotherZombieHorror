<canvas bind:this={map}></canvas>

<script lang="typescript">
import { onMount } from 'svelte';

let map: HTMLCanvasElement;
export let bounds;

function drawBounds (): void {
  const context: CanvasRenderingContext2D = map.getContext('2d');
  context.clearRect(0, 0, context.width, context.height);
  context.moveTo(bounds[0][0], bounds[0][1]);

  context.strokeStyle = '#000000';
  context.lineWidth = 1;
  context.beginPath();

  for (let b = 1; b < bounds.length; b++) {    
    context.lineTo(bounds[b][0], bounds[b][1]);
  }

  context.closePath();
  context.stroke();
}

onMount(() => {

});
</script>

<style lang="scss">
canvas {
  background-color: transparent;
  transform: scale3d(-1, -1, 1);

  position: absolute;
  display: block;

  bottom: 1vw;
  left: 1vw;
}
</style>
