<main id="game">
  {#if !ready}
    <Overlay duration={250}>
      <Loading {loading} {loaded} on:close={startGame} />
    </Overlay>
  {:else}
    <HUD visible={!paused && !dead} />
  {/if}

  {#if paused}
    <Overlay duration={250}>
      <Pause on:close={togglePause} />
    </Overlay>
  {/if}

  {#if dead}
    <Overlay inDuration={1000} inDelay={4000} outDuration={250}>
      <Dead on:restart={restartGame} />
    </Overlay>
  {/if}
</main>

<script>
  import Loading from '@/ui/overlays/Loading';
  import Pause from '@/ui/overlays/Pause';
  import Dead from '@/ui/overlays/Dead';
  import HUD from '@/ui/overlays/HUD';
  import Overlay from '@/ui/Overlay';

  import Events from '@/managers/Events';
  import Music from '@/managers/Music';
  import Game from '@/managers/Game';

  import { onDestroy } from 'svelte';
  import { onMount } from 'svelte';

  Events.add('loading', event => loading = event.data);
  Events.add('death', () => dead = true);
  Events.add('pause', togglePause);

  Events.add('loaded', event => {
    setTimeout(() => { loaded = true; }, 1500);
    Events.remove('loading');
    Events.remove('loaded');

    loading = 100;
    game.init();
  });

  const game = new Game();
  game.paused = true;

  let loaded = false;
  let loading = 0;

  let paused = false;
  let ready = false;
  let dead = false;

  function startGame (event) {
    Music.toggle(true);
    paused = false;
    ready = true;
    game.start();
  }

  function togglePause (event) {
    if (dead) return;

    paused = !!event.data;
    Music.toggle(!paused);
    game.paused = paused;

    if (!paused) {
      game.start();
    }
  }

  function restartGame (event) {
    paused = false;
    dead = false;

    Music.reset();
    game.restart();
  }

  onMount(() => { game.loadAssets(); });

  onDestroy(() => {
    Events.remove('pause');
    Events.remove('death');
  });
</script>

<style>
@font-face {
  src: url('./fonts/FaceYourFears.ttf') format('truetype');
  font-family: 'FaceYourFears';
  font-stretch: normal;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  src: url('./fonts/DrawingBlood.ttf') format('truetype');
  font-family: 'DrawingBlood';
  font-stretch: normal;
  font-weight: normal;
  font-style: normal;
}

:global(html, body) {
  -webkit-text-rendering: optimizeLegibility;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

  font-variant-ligatures: none;
  text-size-adjust: 100%;
  font-weight: normal;
  font-kerning: none;
  font-style: normal;

  background-color: #000000;
  letter-spacing: normal;
  line-height: normal;
  user-select: none;
  overflow: hidden;
  color: #8a0707;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

:global(h1, h2, h3, h4) {
  font-family: 'FaceYourFears', sans-serif;
  letter-spacing: normal;
  line-height: normal;

  position: relative;
  color: #8a0707;
  display: block;

  padding: 0;
  margin: 0;
}

:global(h5, h5, strong, span, p) {
  font-family: 'DrawingBlood', sans-serif;
  letter-spacing: 0.2rem;
  line-height: normal;

  position: relative;
  color: #e6e6e6;
  display: block;

  padding: 0;
  margin: 0;
}

:global(h1) {
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  font-size: 5vw;
}

:global(h3) {
  letter-spacing: 0.3rem;
  font-size: 3vw;
}

:global(body > canvas) {
  transition: opacity 1s ease-in 1s;
  position: absolute;
  display: block;
  opacity: 0;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}
</style>
