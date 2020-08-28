<div>
  <canvas bind:this={map} style="transform: {canvasTransform};"></canvas>
  <Player rotation={rotation} />
</div>

<script lang="typescript">
  type Vector3 = import('@three/math/Vector3').Vector3;
  import { clone, min, max } from '@/utils/Array';
  import { black } from '@scss/variables.scss';
  import Player from '@components/Player';

  export let bounds: Array<Array<number>>;
  export let playerPosition: Vector3;
  export let playerRotation: number;

  let maxCoords: Array<number>;
  let minCoords: Array<number>;

  let canvasTransform: string;
  let map: HTMLCanvasElement;

  export let scale: number;
  export let zoom: number;
  let rotation: number;
  let offset: number;
  const PADDING = 1;

  function getNormalizedBounds (): Array<Array<number>> {
    const scaleMapBounds = (coord: Array<number>): Array<number> => [coord[0] * scale, coord[1] * scale];
    const cBounds = clone(bounds).map(bound => scaleMapBounds(bound));

    for (let b = 0; b < cBounds.length; b++) {
      cBounds[b][0] += scale * minCoords[0];
      cBounds[b][1] += scale * minCoords[1];
    }

    const X = cBounds.map((coords: Array<number>) => coords[0]);
    const Z = cBounds.map((coords: Array<number>) => coords[1]);

    map.height = max(Z) + PADDING * 2;
    map.width = max(X) + PADDING * 2;

    return cBounds;
  }

  function centerPosition (): void {
    const x = (playerPosition.x - maxCoords[0]) * scale - offset;
    const y = (playerPosition.z - maxCoords[1]) * scale - offset;

    canvasTransform = `translate(${x}px, ${y}px) scale3d(-${zoom}, -${zoom}, 1)`;
  }

  function drawBounds (): void {
    const nBounds = getNormalizedBounds();
    const context = map.getContext('2d') as CanvasRenderingContext2D;

    context.strokeStyle = black;
    context.lineWidth = 1;
    context.beginPath();

    context.clearRect(0, 0, map.width, map.height);
    context.moveTo(nBounds[0][0], nBounds[0][1]);

    for (let b = 1; b < nBounds.length; b++) {
      context.lineTo(nBounds[b][0], nBounds[b][1]);
    }

    context.closePath();
    context.stroke();
  }

  (function (): void {
    minCoords = [
      Math.abs(min(bounds.map((coords: Array<number>) => coords[0]))) + PADDING,
      Math.abs(min(bounds.map((coords: Array<number>) => coords[1]))) + PADDING
    ];

    maxCoords = [
      max(bounds.map((coords: Array<number>) => coords[0])),
      max(bounds.map((coords: Array<number>) => coords[1]))
    ];
  })();

  $: rotation = playerRotation;

  $: ((scale) => {
    if (!map || !scale) return;
    offset = PADDING * scale / 2;

    drawBounds();
    centerPosition();
  })(scale);
</script>

<style lang="scss">
@import '@scss/variables';

div {
  background-color: rgba($white, 0.25);
  box-shadow: 0px 0px 25px $black;
  backdrop-filter: blur(5px);

  box-sizing: content-box;
  border-radius: 50%;

  position: absolute;
  overflow: hidden;
  display: block;

  height: 10vw;
  width: 10vw;

  padding: 2vw;
  bottom: 2vw;
  right: 2vw;

  canvas {
    position: absolute;
    display: block;
    margin: auto;

    left: 50%;
    top: 50%;
  }
}
</style>
