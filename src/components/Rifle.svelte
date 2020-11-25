<script lang="typescript">
  import { getScaledCoords, pointInCircle } from '@components/utils';
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  type Vector3 = import('@three/math/Vector3').Vector3;

  import type { Coords } from '@/types';
  import { PI } from '@/utils/Number';
  import { onDestroy } from 'svelte';

  export let context: CanvasRenderingContext2D;

  GameEvents.add('rifle:spawn', spawnRifle);
  GameEvents.add('rifle:pick', pickRifle);

  let lastRifleCoords: Coords = [0.0, 0.0];
  const rifleCoords: Coords = [0.0, 0.0];

  export let minCoords: Coords;
  export let player: Vector3;
  let visibleRifle = false;

  export let scale: number;
  export let zoom: number;

  const RADIUS = 5.0;
  const MAP_RADIUS = 90.0;
  const CIRC = RADIUS * Math.PI;
  const CIRC2 = CIRC / 2.0;

  function setRifleCoords (coords: Coords): void {
    coords = getScaledCoords(coords, minCoords, scale);

    rifleCoords[0] = coords[0];
    rifleCoords[1] = coords[1];

    drawRifle();
  }

  function spawnRifle (event: GameEvent): void {
    lastRifleCoords = event.data as Coords;
    setRifleCoords(lastRifleCoords);

    visibleRifle = true;
    drawRifle();
  }

  function onBorder (): boolean {
    const coords = getScaledCoords([player.x, player.z], minCoords, scale);
    return !pointInCircle(rifleCoords, coords, MAP_RADIUS / zoom);
  }

  function drawRifle (): void {
    if (!visibleRifle) return;

    const x = rifleCoords[0], y = rifleCoords[1];
    context.fillStyle = '#222';

    context.beginPath();
    context.arc(x, y, RADIUS, 0.0, PI.m2);

    context.closePath();
    context.fill();
  }

  function pickRifle (): void {
    const x = rifleCoords[0] - CIRC2, y = rifleCoords[1] - CIRC2;
    context.clearRect(x, y, CIRC, CIRC);
    visibleRifle = false;
  }

  onDestroy(() => {
    GameEvents.remove('rifle:spawn');
    GameEvents.remove('rifle:pick');
  });

  $: (scale => {
    if (!context || !scale || !visibleRifle) return;
    setRifleCoords(lastRifleCoords);
  })(scale);
</script>
