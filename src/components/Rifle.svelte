<script lang="typescript">
  import { PI, easeOutSine } from '@/utils/Number';
  export let context: CanvasRenderingContext2D;
  import type { Coords } from '@/types.d';

  export let visible: boolean;
  export let coords: Coords;

  const RADIUS = 5.0;
  const FRAME = 1.0 / 60.0;
  const MAX_RADIUS = RADIUS * 2.0;

  const RIFLE_RGB = '34, 34, 34';
  const CIRC = RADIUS * Math.PI;
  const CIRC2 = CIRC * 2.0;

  let circ, start = 0.0;
  let frame = 0.0;

  function spawnRifle (): void {
    clearRifle();
    const [x, y] = coords;

    frame = requestAnimationFrame(spawnRifle);
    context.fillStyle = `rgb(${RIFLE_RGB})`;

    context.beginPath();
    context.arc(x, y, RADIUS, 0.0, PI.m2);

    context.closePath();
    context.fill();

    context.lineWidth = 1.0;
    context.beginPath();

    circ = start += FRAME;
    circ = easeOutSine(circ - (circ >> 0));

    context.strokeStyle = `rgba(${RIFLE_RGB}, ${1.0 - circ})`;

    const radius = RADIUS + circ * MAX_RADIUS;
    context.arc(x, y, radius, 0.0, PI.m2);

    context.closePath();
    context.stroke();
  }

  function pickRifle (): void {
    cancelAnimationFrame(frame);
    clearRifle();
  }

  function clearRifle (): void {
    const [x, y] = coords;
    context.clearRect(x - CIRC, y - CIRC, CIRC2, CIRC2);
  }

  $: (visible => {
    if (!coords) return;
    visible ? spawnRifle() : pickRifle();
  })(visible);
</script>
