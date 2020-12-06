<div class="map">
  <div style="transform: scale3d({zoom}, {zoom}, 1) rotate({-playerRotation}deg);">
    <canvas bind:this={map} style="transform: {canvasTransform};" />
    <Player rotation={playerRotation} />

    {#if renderRifle}
      <Rifle
        visible={visibleRifle}
        coords={rifleCoords}
        context={context}
      />
    {/if}
  </div>
</div>

<script lang="typescript">
  import { getScaledCoords, pointInCircle } from '@components/utils';
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  type Vector3 = import('@three/math/Vector3').Vector3;

  import { cloneBounds, max } from '@/utils/Array';
  import type { Coords, Bounds } from '@/types.d';
  import Player from '@components/Player.svelte';

  import Rifle from '@components/Rifle.svelte';
  import { onMount, onDestroy } from 'svelte';
  import Level0 from '@/environment/Level0';

  const minCoords = Level0.minCoords.map(
    coord => Math.abs(coord) + PADDING
  ) as unknown as Coords;

  let context: CanvasRenderingContext2D;
  const maxCoords = Level0.maxCoords;

  export let playerPosition: Vector3;
  export let playerRotation: number;

  const bounds = Level0.bounds;
  let canvasTransform: string;
  let map: HTMLCanvasElement;

  let visibleRifle: boolean;
  let renderRifle: boolean;
  let rifleCoords: Coords;

  export let scale: number;
  export let zoom: number;

  const MAP_RADIUS = 90;
  let offset: number;
  const PADDING = 1;

  function spawnRifle (event: GameEvent): void {
    rifleCoords = getScaledCoords(event.data as Coords, minCoords, scale);

    visibleRifle = true;
    renderRifle = true;
  }

  function getNormalizedBounds (): Bounds {
    const cBounds = cloneBounds(bounds).map(bound => getScaledCoords(bound, minCoords, scale));

    map.height = max(cBounds.map((coords: Coords) => coords[1])) + PADDING * 2;
    map.width = max(cBounds.map((coords: Coords) => coords[0])) + PADDING * 2;

    return cBounds;
  }

  function centerPosition (): void {
    const px = playerPosition.x, pz = playerPosition.z;

    const x = (px - maxCoords[0]) * scale - offset;
    const y = (pz - maxCoords[1]) * scale - offset;

    if (visibleRifle) {
      const scaledCoords = getScaledCoords([px, pz], minCoords, scale);
      console.log('Rifle on map: ', pointInCircle(rifleCoords, scaledCoords, MAP_RADIUS / zoom));
    }

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

  function pickRifle (): void {
    setTimeout(() => renderRifle = false);
    visibleRifle = false;
  }

  GameEvents.add('rifle:spawn', spawnRifle);
  GameEvents.add('rifle:pick', pickRifle);

  onMount(drawBounds);

  onDestroy(() => {
    GameEvents.remove('rifle:spawn');
    GameEvents.remove('rifle:pick');
  });

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
@import '@/variables';

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
