<script lang="ts">
  import { PI, DELTA_FRAME, easeOutSine } from '@/utils/Number';
  import type { LevelCoords } from '@/scenes/types';

  export let context: CanvasRenderingContext2D;
  import { onDestroy } from 'svelte';
  import RAF from '@/managers/RAF';

  export let coords: LevelCoords;
  export let visible: boolean;

  const RADIUS = 5.0;
  const MAX_RADIUS = RADIUS * 2.0;

  const RIFLE_RGB = '255, 255, 255';
  const CIRC = RADIUS * Math.PI;

  const CIRC2 = CIRC * 2.0;
  let circ, start = 0.0;

  function spawnRifle (): void {
    const [x, y] = coords;

    context.clearRect(x - CIRC, y - CIRC, CIRC2, CIRC2);
    context.fillStyle = `rgb(${RIFLE_RGB})`;

    context.beginPath();
    context.arc(x, y, RADIUS, 0.0, PI.m2);

    context.closePath();
    context.fill();

    context.lineWidth = 1.0;
    context.beginPath();

    circ = start += DELTA_FRAME;
    circ = easeOutSine(circ - (circ | 0));

    context.strokeStyle = `rgba(${RIFLE_RGB}, ${1.0 - circ})`;

    const radius = RADIUS + circ * MAX_RADIUS;
    context.arc(x, y, radius, 0.0, PI.m2);

    context.closePath();
    context.stroke();
  }

  function pickRifle (): void {
    RAF.remove(spawnRifle);
  }

  onDestroy(pickRifle);

  $: (visible => {
    if (!coords) return;
    visible ? RAF.add(spawnRifle) : pickRifle();
  })(visible);
</script>
