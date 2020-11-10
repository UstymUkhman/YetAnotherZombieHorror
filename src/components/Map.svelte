<div class="map">
  <div style="transform: scale3d({zoom}, {zoom}, 1) rotate({-playerRotation}deg);">
    <canvas bind:this={map} style="transform: {canvasTransform};" />
    <Player rotation={playerRotation} />
  </div>
</div>

<script lang="typescript">
  type Vector3 = import('@three/math/Vector3').Vector3;
  type Bounds = import('@/config').Config.Bounds;
  type Coords = import('@/config').Config.Coords;

  import { cloneBounds, max } from '@/utils/Array';
  import Player from '@components/Player.svelte';
  import Level0 from '@/environment/Level0';

  import { Color } from '@/utils/Color';
  import { onMount } from 'svelte';

  export let playerPosition: Vector3;
  export let playerRotation: number;

  const minCoords = Level0.minCoords.map(coord => Math.abs(coord) + PADDING);
  const maxCoords = Level0.maxCoords;
  const bounds = Level0.bounds;

  let canvasTransform: string;
  let map: HTMLCanvasElement;

  export let scale: number;
  export let zoom: number;

  const { BLACK } = Color;
  let offset: number;
  const PADDING = 1;

  function getNormalizedBounds (): Bounds {
    const scaleBounds = (coord: Coords): [number, number] => [coord[0] * scale, coord[1] * scale];
    const cBounds = cloneBounds(bounds).map(bound => scaleBounds(bound));

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
    const context = map.getContext('2d') as CanvasRenderingContext2D;

    context.strokeStyle = BLACK.toString();
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

  $: ((position) => {
    map && position && centerPosition();
  })(playerPosition);

  $: ((scale) => {
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
