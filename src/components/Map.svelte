<canvas bind:this={map}></canvas>

<script lang="typescript">
import { clone, min, max } from '@/utils/Array';
import { black } from '@/scss/variables.scss';
import { onMount } from 'svelte';

let map: HTMLCanvasElement;
export let bounds: Array<Array<number>>;

function getNormalizedBounds (): Array<Array<number>> {
  let X = bounds.map((coords: Array<number>) => coords[0]);
  let Z = bounds.map((coords: Array<number>) => coords[1]);

  const cBounds = clone(bounds);
  const minX = Math.abs(min(X));
  const minZ = Math.abs(min(Z));

  for (let b = 0; b < cBounds.length; b++) {
    cBounds[b][0] += minX;
    cBounds[b][1] += minZ;
  }

  X = cBounds.map((coords: Array<number>) => coords[0]);
  Z = cBounds.map((coords: Array<number>) => coords[1]);

  map.height = max(Z) + 1;
  map.width = max(X) + 1;

  return cBounds;
}

function drawBounds (): void {
  const nBounds = getNormalizedBounds();
  const context = map.getContext('2d') as CanvasRenderingContext2D;

  context.strokeStyle = black;
  context.lineWidth = 2;
  context.beginPath();

  context.clearRect(0, 0, map.width, map.height);
  context.moveTo(nBounds[0][0], nBounds[0][1]);

  for (let b = 1; b < nBounds.length; b++) {
    context.lineTo(nBounds[b][0], nBounds[b][1]);
  }

  context.closePath();
  context.stroke();
}

onMount(drawBounds);
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
