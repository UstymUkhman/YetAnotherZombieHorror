<div class="map">
  <div style="transform: scale3d({zoom}, {zoom}, 1) rotate({-playerRotation}deg);">
    <canvas bind:this={map} style="transform: {canvasTransform};" />
    <Rifle context={context} minCoords={minCoords} scale={scale} />
    <Player rotation={playerRotation} />
  </div>
</div>

<script lang="typescript">
  type Vector3 = import('@three/math/Vector3').Vector3;
  import { cloneBounds, max } from '@/utils/Array';

  import Player from '@components/Player.svelte';
  import type { Coords, Bounds } from '@/types';
  import Rifle from '@components/Rifle.svelte';

  import Level0 from '@/environment/Level0';
  import { onMount } from 'svelte';

  export let context: CanvasRenderingContext2D;

  const minCoords = Level0.minCoords.map(
    coord => Math.abs(coord) + PADDING
  );

  const maxCoords = Level0.maxCoords;
  const bounds = Level0.bounds;

  export let playerPosition: Vector3;
  export let playerRotation: number;

  let canvasTransform: string;
  let map: HTMLCanvasElement;

  export let scale: number;
  export let zoom: number;

  let offset: number;
  const PADDING = 1;

  function getNormalizedBounds (): Bounds {
    const scaleBounds = (coord: Coords): [number, number] => [coord[0] * scale, coord[1] * scale];
    const cBounds = cloneBounds(bounds).map((bound: Coords) => scaleBounds(bound));

    for (let b = 0; b < cBounds.length; b++) {
      cBounds[b][0] += scale * minCoords[0];
      cBounds[b][1] += scale * minCoords[1];
    }

    map.height = max(cBounds.map((coords: Coords) => coords[1])) + PADDING * 2;
    map.width = max(cBounds.map((coords: Coords) => coords[0])) + PADDING * 2;

    return cBounds;
  }

  function centerPosition (): void {
    const x = (playerPosition.x - maxCoords[0]) * scale - offset;
    const y = (playerPosition.z - maxCoords[1]) * scale - offset;

    canvasTransform = `translate(${x}px, ${y}px) scale3d(-1, -1, 1)`;
  }

  function drawBounds (): void {
    const nBounds = getNormalizedBounds();
    context = map.getContext('2d')!;

    context.strokeStyle = '#000';
    context.lineWidth = 2.0;
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

  $: (position => {
    map && position && centerPosition();
  })(playerPosition);

  $: (scale => {
    if (!map || !scale) return;
    offset = PADDING * scale / 2;

    drawBounds();
    centerPosition();
  })(scale);
</script>

<style lang="scss">
@import '@scss/variables';

div.map {
  background-color: rgba($white, 0.25);
  box-shadow: 0px 0px 25px $black;
  backdrop-filter: blur(5px);

  transform-origin: 50% 50%;
  box-sizing: content-box;
  border-radius: 50%;

  position: absolute;
  overflow: hidden;
  display: block;

  height: 10vw;
  width: 10vw;

  bottom: 2vw;
  right: 2vw;

  div {
    transform-origin: 50% 50%;
    box-sizing: content-box;
    border-radius: 50%;

    position: absolute;
    overflow: hidden;
    display: block;

    height: 20vw;
    width: 20vw;

    left: -5vw;
    top: -5vw;
  }

  canvas {
    position: absolute;
    display: block;
    margin: auto;

    left: 50%;
    top: 50%;
  }
}
</style>
