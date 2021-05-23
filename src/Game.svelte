<main bind:this={main}>
  {#if Config.APP}
    <Close />
  {/if}

  {#if loading}
    <Loader on:loaded={() => loading = false} />
  {:else}
    {#if game.pause || !lastFrameDelta}
      <Pause on:start={() => togglePause(false)} />
    {:else}
      <Aim hide={running || aiming} />

      <Map
        playerRotation={player.rotation}
        playerPosition={player.position}
        radius={mapRadius / zoomScale}
        scale={scale} zoom={zoomScale}
        on:rifle={updateRifleAngle}
      />

      {#if visibleRifle}
        <BorderRifle
          playerRotation={player.rotation}
          angle={rifleAngle}
        />
      {/if}
    {/if}
  {/if}
</main>

<script lang="typescript">
import BorderRifle from '@components/BorderRifle.svelte';
import { GameEvents } from '@/managers/GameEvents';
import Close from '@components/CloseButton.svelte';

import Loader from '@components/Loader.svelte';
import Pause from '@components/Pause.svelte';
import { onMount, onDestroy } from 'svelte';
import GameLoop from '@/managers/GameLoop';
import { Elastic } from '@/utils/Elastic';

import type { Location } from '@/types.d';
import Aim from '@components/Aim.svelte';
import Map from '@components/Map.svelte';
import { Config } from '@/config';

const zoom = new Elastic.Number(0);
const game = new GameLoop();

let visibleRifle = false;
let rifleAngle: number;
let main: HTMLElement;
let player: Location;

let zoomScale: number;
let mapRadius: number;

let running = false;
let loading = true;
let aiming = false;

let scale: number;
let raf: number;

let lastFrameDelta = 0;
const FPS = 60, INT = 1e3 / 60;
const FMT = INT * (60 / FPS) - INT / 2;

function togglePause (paused: boolean): void {
  if (game.pause !== paused) {
    paused
      ? cancelAnimationFrame(raf)
      : requestAnimationFrame(update);

    game.pause = paused;
  }
}

function update (delta: number): void {
  if (delta - lastFrameDelta < FMT) {
    raf = requestAnimationFrame(update);
    return;
  }

  raf = requestAnimationFrame(update);
  player = game.playerLocation;
  lastFrameDelta = delta;

  zoomScale = Math.round(
    (1 - zoom.value) * 1e5 + Number.EPSILON
  ) / 1e5;

  zoom.update();
  game.update();
}

function updateRifleAngle (event: CustomEvent): void {
  visibleRifle = event.detail.visible;
  rifleAngle = event.detail.angle;
}

function updateScale (): void {
  mapRadius = window.innerWidth / 17.25;
  scale = window.innerWidth / 175;
}

GameEvents.add('game:pause', event => togglePause(event.data as boolean));
window.addEventListener('resize', updateScale);

GameEvents.add('player:run', event => {
  running = event.data as boolean;
  zoom.set(~~running * 0.5);
});

GameEvents.add('player:aim', event => {
  aiming = event.data as boolean;
});

onMount(() => {
  main.prepend(game.scene);
  updateScale();
});

onDestroy(() => {
  GameEvents.remove('player:run');
  GameEvents.remove('player:aim');
  GameEvents.remove('pause');
  cancelAnimationFrame(raf);

  togglePause(true);
  game.destroy();
});
</script>

<style lang="scss" global>
@import '@/variables';

html,
body {
  -webkit-text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-overflow-scrolling: none;
  -webkit-touch-callout: none;

  font-family: 'DrawingBlood', sans-serif;
  text-rendering: optimizeLegibility;
  font-variant-ligatures: none;
  backface-visibility: hidden;
  background-color: $black;
  text-size-adjust: 100%;

  letter-spacing: normal;
  line-height: normal;
  user-select: none;
  appearance: none;
  overflow: hidden;

  font-weight: normal;
  font-kerning: none;
  font-style: normal;
  font-size: 1rem;
  color: $red;

  max-height: 100%;
  min-height: 100%;

  max-width: 100%;
  min-width: 100%;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

h1,
h2,
h3,
h4 {
  font-family: 'FaceYourFears', sans-serif;
  letter-spacing: normal;
  line-height: normal;

  position: relative;
  display: block;
  color: $red;

  padding: 0;
  margin: 0;
}

p,
h5,
h6,
span,
strong,
button {
  font-family: 'DrawingBlood', sans-serif;
  letter-spacing: 0.2rem;
  line-height: normal;

  position: relative;
  display: block;
  color: $grey;

  padding: 0;
  margin: 0;
}

h1 {
  text-transform: uppercase;
  letter-spacing: 0.5rem;

  line-height: 5vw;
  font-size: 5vw;
}

h2 {
  letter-spacing: 0.4rem;
  line-height: 4vw;
  font-size: 4vw;
}

h3 {
  letter-spacing: 0.3rem;
  line-height: 3vw;
  font-size: 3vw;
}

body > canvas {
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}
</style>
