<div>
  <canvas bind:this={map}></canvas>
</div>

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

  map.height = max(Z) + 2;
  map.width = max(X) + 2;

  return cBounds;
}

function drawBounds (): void {
  const nBounds = getNormalizedBounds();
  const context = map.getContext('2d') as CanvasRenderingContext2D;

  context.strokeStyle = black;
  context.lineWidth = 1;
  context.beginPath();

  context.clearRect(0, 0, map.width, map.height);
  context.moveTo(nBounds[0][0] + 1, nBounds[0][1] + 1);

  for (let b = 1; b < nBounds.length; b++) {
    context.lineTo(nBounds[b][0] + 1, nBounds[b][1] + 1);
  }

  context.closePath();
  context.stroke();
}

onMount(drawBounds);
</script>

<style lang="scss">
@import 'src/scss/variables';

div {
  background-color: rgba($white, 0.25);
  box-shadow: 0px 0px 25px $black;
  backdrop-filter: blur(5px);

  border: solid 3px $black;
  border-radius: 50%;

  position: absolute;
  overflow: hidden;
  display: block;

  height: 10vw;
  width: 10vw;

  padding: 2vw;
  bottom: 1vw;
  left: 1vw;

  canvas {
    transform: scale3d(-2, -2, 1) translateY(-12%);

    position: absolute;
    display: block;
    margin: auto;

    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
  }
}
</style>
