<div class="map">
  <div style="transform: scale3d({zoom}, {zoom}, 1) rotate({-playerRotation}deg);">
    <canvas bind:this={map} style="transform: {canvasTransform};" />
    <Player rotation={playerRotation} />

    {#if renderRifle}
      <MapRifle
        visible={visibleRifle}
        coords={rifleCoords}
        context={context}
      />
    {/if}
  </div>
</div>

<script lang="ts">
  import { getScaledCoords, pointInCircle, getAngleToRifle } from '@components/utils';
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  import type { Vector3 } from 'three/src/math/Vector3';
  import MapRifle from '@components/MapRifle.svelte';

  import { cloneBounds, max } from '@/utils/Array';
  import type { Coords, Bounds } from '@/types.d';
  import { createEventDispatcher } from 'svelte';
  import Player from '@components/Player.svelte';

  import { onMount, onDestroy } from 'svelte';
  import Limbo from '@/environment/Limbo';

  const dispatch = createEventDispatcher();

  const minCoords = Limbo.minCoords.map(
    coord => Math.abs(coord) + PADDING
  ) as unknown as Coords;

  let context: CanvasRenderingContext2D;
  const maxCoords = Limbo.maxCoords;

  export let playerPosition: Vector3;
  export let playerRotation: number;

  const bounds = Limbo.bounds;
  let canvasTransform: string;
  let map: HTMLCanvasElement;

  let visibleRifle: boolean;
  let renderRifle: boolean;
  let rifleCoords: Coords;

  export let radius: number;
  export let scale: number;
  export let zoom: number;

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

      dispatch('rifle', {
        visible: !pointInCircle(rifleCoords, scaledCoords, radius),
        angle: getAngleToRifle(scaledCoords, rifleCoords)
      });
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
    visibleRifle = false;

    setTimeout(() => {
      renderRifle = false;
      drawBounds();
    });
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
@use '@/variables' as var;

div.map {
  background-color: rgba(var.$white, 0.25);
  box-shadow: 0px 0px 25px var.$black;
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
