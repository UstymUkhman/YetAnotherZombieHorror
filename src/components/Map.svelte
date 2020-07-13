<div>
  <canvas bind:this={map} style="transform: {canvasTransform};"></canvas>
</div>

<script lang="typescript">
type Vector3 = import('@three/math/Vector3').Vector3;

import { clone, min, max } from '@/utils/Array';
import { black } from '@scss/variables.scss';
import { onMount } from 'svelte';

const SCALE = 5;
const PADDING = 1;
const OFFSET = PADDING * SCALE / 2;

export let bounds: Array<Array<number>>;
export let position: Vector3;
export let scale: number;

let maxCoords: Array<number>;
let minCoords: Array<number>;

let canvasTransform: string;
let map: HTMLCanvasElement;

function setCoords (): void {
  minCoords = [
    Math.abs(min(bounds.map((coords: Array<number>) => coords[0]))) + PADDING,
    Math.abs(min(bounds.map((coords: Array<number>) => coords[1]))) + PADDING
  ];

  maxCoords = [
    max(bounds.map((coords: Array<number>) => coords[0])),
    max(bounds.map((coords: Array<number>) => coords[1]))
  ];
}

function getNormalizedBounds (): Array<Array<number>> {
  const scaleMapBounds = (coord: Array<number>): Array<number> => [coord[0] * SCALE, coord[1] * SCALE];
  const cBounds = clone(bounds).map(bound => scaleMapBounds(bound));

  for (let b = 0; b < cBounds.length; b++) {
    cBounds[b][0] += SCALE * minCoords[0];
    cBounds[b][1] += SCALE * minCoords[1];
  }

  const X = cBounds.map((coords: Array<number>) => coords[0]);
  const Z = cBounds.map((coords: Array<number>) => coords[1]);

  map.height = max(Z) + PADDING * 2;
  map.width = max(X) + PADDING * 2;

  return cBounds;
}

function drawBounds (): void {
  const nBounds = getNormalizedBounds();
  const context = map.getContext('2d') as CanvasRenderingContext2D;

  context.strokeStyle = black;
  context.lineWidth = 1;
  context.beginPath();

  context.clearRect(0, 0, map.width, map.height);
  context.moveTo(nBounds[0][0], nBounds[0][1]);

  for (let b = 1; b < nBounds.length; b++) {
    context.lineTo(nBounds[b][0], nBounds[b][1]);
  }

  context.closePath();
  context.stroke();
}

function centerPosition (): void {
  const x = (position.x - maxCoords[0]) * SCALE - OFFSET;
  const y = (position.z - maxCoords[1]) * SCALE - OFFSET;

  canvasTransform = `translate(${x}px, ${y}px) scale3d(-${scale}, -${scale}, 1)`;
}

onMount(() => {
  setCoords();
  drawBounds();
  centerPosition();
});
</script>

<style lang="scss">
@import '@scss/variables';

div {
  background-color: rgba($white, 0.25);
  box-shadow: 0px 0px 25px $black;
  backdrop-filter: blur(5px);

  box-sizing: content-box;
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
    position: absolute;
    display: block;
    margin: auto;

    left: 50%;
    top: 50%;
  }
}
</style>
