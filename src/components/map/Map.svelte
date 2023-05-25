<div class="map">
  <div style="transform: scale3d({zoom}, {zoom}, 1) rotate({-playerRotation}deg);">
    <canvas bind:this={map} style="transform: {canvasTransform};" />
    <Player rotation={playerRotation} />
  </div>
</div>

<script lang="ts">
  import { getScaledCoords, pointInCircle, getAngleToRifle } from '@/components/map/utils';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { LevelCoords, LevelBounds } from '@/scenes/types';
  import { PI, DELTA_FRAME, easeOutSine } from '@/utils/Number';
  import { GameEvents, GameEvent } from '@/events/GameEvents';

  import type { Vector3 } from 'three/src/math/Vector3';
  import Player from '@/components/map/Player.svelte';
  import { cloneBounds, max } from '@/utils/Array';
  import LevelScene from '@/scenes/LevelScene';
  import RAF from '@/managers/RAF';

  const minCoords = LevelScene.minCoords.map(
    (coord: number) => Math.abs(coord) + BOUNDS_PADDING
  ) as unknown as LevelCoords;

  const dispatch = createEventDispatcher();
  const maxCoords = LevelScene.maxCoords;
  let context: CanvasRenderingContext2D;

  export let enemies: Array<Vector3>;
  export let playerPosition: Vector3;
  export let playerRotation: number;

  let normalizedBounds: LevelBounds;
  const bounds = LevelScene.bounds;

  let rifleCoords: LevelCoords;
  let canvasTransform: string;
  let map: HTMLCanvasElement;
  let positionOffset: number;

  let rifleStartFrame = 0.0;
  let rifleCircAnim: number;
  let visibleRifle: boolean;

  export let radius: number;
  export let scale: number;
  export let zoom: number;

  const RIFLE_RADIUS = 5.0;
  const BOUNDS_PADDING = 1.0;

  const RIFLE_CIRC = RIFLE_RADIUS * Math.PI;
  const RIFLE_DOUBLE_CIRC = RIFLE_CIRC * 2.0;
  const MAX_RIFLE_RADIUS = RIFLE_RADIUS * 2.0;

  function getNormalizedBounds (): LevelBounds {
    const cBounds = cloneBounds(bounds).map((bound: LevelCoords) =>
      getScaledCoords(bound, minCoords, scale)
    );

    map.height = max(
      cBounds.map((coords: LevelCoords) => coords[1])
    ) + BOUNDS_PADDING * 2.0;

    map.width = max(
      cBounds.map((coords: LevelCoords) => coords[0])
    ) + BOUNDS_PADDING * 2.0;

    return cBounds;
  }

  function spawnRifle (event: GameEvent): void {
    rifleCoords = getScaledCoords(
      event.data as LevelCoords,
      minCoords,
      scale
    );

    visibleRifle = true;
  }

  function centerPosition (): void {
    const px = playerPosition.x, pz = playerPosition.z;

    const x = (px - maxCoords[0]) * scale - positionOffset;
    const y = (pz - maxCoords[1]) * scale - positionOffset;

    if (visibleRifle) {
      const scaledCoords = getScaledCoords([px, pz], minCoords, scale);

      dispatch('rifle', {
        visible: !pointInCircle(rifleCoords, scaledCoords, radius),
        angle: getAngleToRifle(scaledCoords, rifleCoords)
      });
    }

    canvasTransform = `translate(${x}px, ${y}px) scale3d(-1, -1, 1)`;
  }

  function drawEnemies (): void {
    for (let e = enemies.length; e--; ) {
      const [x, y] = getScaledCoords(
        [enemies[e].x, enemies[e].z],
        minCoords,
        scale
      );

      context.beginPath();
      context.fillStyle = '#8A0707';
      context.arc(x, y, 4.0, 0.0, PI.m2);

      context.closePath();
      context.fill();
    }
  }

  function drawBounds (): void {
    context.strokeStyle = '#000';
    context.lineWidth = 2.0;
    context.beginPath();

    context.clearRect(0, 0, map.width, map.height);
    context.moveTo(normalizedBounds[0][0], normalizedBounds[0][1]);

    for (let b = 1; b < normalizedBounds.length; b++)
      context.lineTo(normalizedBounds[b][0], normalizedBounds[b][1]);

    context.closePath();
    context.stroke();
  }

  function drawRifle (): void {
    if (!visibleRifle) return;
    const [x, y] = rifleCoords;
    context.fillStyle = '#FFF';

    context.clearRect(
      x - RIFLE_CIRC,
      y - RIFLE_CIRC,
      RIFLE_DOUBLE_CIRC,
      RIFLE_DOUBLE_CIRC
    );

    context.beginPath();
    context.arc(x, y, RIFLE_RADIUS, 0.0, PI.m2);

    context.closePath();
    context.fill();

    context.lineWidth = 1.0;
    context.beginPath();

    rifleCircAnim = rifleStartFrame += DELTA_FRAME;
    rifleCircAnim = easeOutSine(rifleCircAnim - (rifleCircAnim | 0));
    context.strokeStyle = `rgba(255, 255, 255, ${1.0 - rifleCircAnim})`;

    const radius = RIFLE_RADIUS + rifleCircAnim * MAX_RIFLE_RADIUS;
    context.arc(x, y, radius, 0.0, PI.m2);

    context.closePath();
    context.stroke();
  }

  function draw (): void {
    drawBounds();
    drawEnemies();
    drawRifle();
  }

  GameEvents.add('Rifle::Spawn', spawnRifle, true);

  GameEvents.add('Rifle::Pick', () => {
    rifleStartFrame = 0.0;
    visibleRifle = false;
  }, true);

  onMount(() => {
    context = map.getContext('2d') as CanvasRenderingContext2D;
    normalizedBounds = getNormalizedBounds();
    RAF.add(draw);
  });

  onDestroy(() => {
    GameEvents.remove('Rifle::Spawn', true);
    GameEvents.remove('Rifle::Pick', true);
    RAF.remove(draw);
  });

  $: (position => {
    map && position && centerPosition();
  })(playerPosition);

  $: (scale => {
    if (!map || !scale) return;
    positionOffset = BOUNDS_PADDING * scale / 2;
  })(scale);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div.map {
    @include mixin.size(10vw);

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
      transform: rotate(180deg);
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
