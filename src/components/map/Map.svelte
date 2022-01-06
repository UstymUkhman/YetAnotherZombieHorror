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
  import type { LevelCoords, LevelBounds } from '@/scenes/types';
  import { GameEvents, GameEvent } from '@/events/GameEvents';

  import MapRifle from '@components/map/MapRifle.svelte';
  import type { Vector3 } from 'three/src/math/Vector3';

  import Player from '@components/map/Player.svelte';
  import { cloneBounds, max } from '@/utils/Array';
  import LevelScene from '@/scenes/LevelScene';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  const minCoords = LevelScene.minCoords.map(
    coord => Math.abs(coord) + PADDING
  ) as unknown as LevelCoords;

  const dispatch = createEventDispatcher();

  let context: CanvasRenderingContext2D;
  const maxCoords = LevelScene.maxCoords;

  export let playerPosition: Vector3;
  export let playerRotation: number;

  const bounds = LevelScene.bounds;
  let rifleCoords: LevelCoords;
  let canvasTransform: string;
  let map: HTMLCanvasElement;

  let visibleRifle: boolean;
  let renderRifle: boolean;

  export let radius: number;
  export let scale: number;
  export let zoom: number;

  let offset: number;
  const PADDING = 1;

  function spawnRifle (event: GameEvent): void {
    const coords = event.data as LevelCoords;
    rifleCoords = getScaledCoords(coords, minCoords, scale);

    visibleRifle = true;
    renderRifle = true;
  }

  function getNormalizedBounds (): LevelBounds {
    const cBounds = cloneBounds(bounds).map(bound => getScaledCoords(bound, minCoords, scale));

    map.height = max(cBounds.map((coords: LevelCoords) => coords[1])) + PADDING * 2;
    map.width = max(cBounds.map((coords: LevelCoords) => coords[0])) + PADDING * 2;

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

  GameEvents.add('Rifle::Spawn', spawnRifle, true);
  GameEvents.add('Rifle::Pick', pickRifle, true);

  onMount(drawBounds);

  onDestroy(() => {
    GameEvents.remove('Rifle::Spawn', true);
    GameEvents.remove('Rifle::Pick', true);
  });

  $: (position => {
    map && position && centerPosition();
  })(playerPosition);

  $: (scale => {
    if (!map || !scale) return;
    offset = PADDING * scale / 2;
    drawBounds();
  })(scale);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div.map {
    @include mixin.size(10vw);

    /* stylelint-disable-next-line color-function-notation */
    background-color: rgba(var.$white, 0.25);
    box-shadow: 0px 0px 25px var.$black;
    backdrop-filter: blur(5px);

    transform-origin: 50% 50%;
    box-sizing: content-box;
    border-radius: 50%;

    position: absolute;
    overflow: hidden;
    display: block;

    bottom: 2vw;
    right: 2vw;

    div {
      @include mixin.size(20vw);

      transform-origin: 50% 50%;
      box-sizing: content-box;
      border-radius: 50%;

      position: absolute;
      overflow: hidden;
      display: block;

      left: -5vw;
      top: -5vw;
    }

    canvas {
      @include mixin.center-transform;
      transform: none;
    }
  }
</style>
