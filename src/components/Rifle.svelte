<script lang="typescript">
  export let context: CanvasRenderingContext2D;
  import type { Coords } from '@/types.d';
  import { PI } from '@/utils/Number';

  export let visible: boolean;
  export let coords: Coords;

  const RADIUS = 5.0;
  const CIRC = RADIUS * Math.PI;
  const CIRC2 = CIRC / 2.0;

  function spawnRifle (): void {
    const x = coords[0], y = coords[1];

    context.fillStyle = '#222';
    context.beginPath();

    context.arc(x, y, RADIUS, 0.0, PI.m2);

    context.closePath();
    context.fill();
  }

  function pickRifle (): void {
    const x = coords[0] - CIRC2, y = coords[1] - CIRC2;
    context.clearRect(x, y, CIRC, CIRC);
  }

  $: (visible => {
    if (!coords) return;
    visible ? spawnRifle() : pickRifle();
  })(visible);
</script>
