<script lang="typescript">
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  import type { Coords } from '@/types';
  import { PI } from '@/utils/Number';
  import { onDestroy } from 'svelte';

  export let context: CanvasRenderingContext2D;
  export let minCoords: Coords;

  GameEvents.add('rifle:spawn', spawnRifle);
  GameEvents.add('rifle:pick', pickRifle);

  let lastRifleCoords: Coords = [0.0, 0.0];
  const rifleCoords: Coords = [0.0, 0.0];

  let visibleRifle = false;
  export let scale: number;

  const RADIUS = 5.0;
  const CIRC = RADIUS * Math.PI;
  const CIRC2 = CIRC / 2.0;

  function setRifleCoords (coords: Coords): void {
    let xCoord = coords[0] * scale;
    let yCoord = coords[1] * scale;

    xCoord += scale * minCoords[0];
    yCoord += scale * minCoords[1];

    rifleCoords[0] = xCoord;
    rifleCoords[1] = yCoord;

    drawRifle();
  }

  function spawnRifle (event: GameEvent): void {
    lastRifleCoords = event.data as Coords;
    setRifleCoords(lastRifleCoords);

    visibleRifle = true;
    drawRifle();
  }

  function drawRifle (): void {
    const x = rifleCoords[0], y = rifleCoords[1];
    context.fillStyle = '#222';

    if (visibleRifle) {
      context.beginPath();
      context.arc(x, y, RADIUS, 0.0, PI.m2);

      context.closePath();
      context.fill();
    }
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
