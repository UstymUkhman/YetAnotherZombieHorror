<main id="game">
  {#if !ready}
    <Overlay>
      <Loading {loading} {loaded} on:close={startGame} />
    </Overlay>
  {:else}
    <HUD visible={!paused} />
  {/if}

  {#if paused}
    <Overlay>
      <Pause on:close={togglePause} />
    </Overlay>
  {/if}
</main>

<script>
  import Loading from '@/ui/overlays/Loading';
  import Pause from '@/ui/overlays/Pause';
  import HUD from '@/ui/overlays/HUD';
  import Overlay from '@/ui/Overlay';

  import Events from '@/managers/Events';
  import Game from '@/managers/Game';

  import { onDestroy } from 'svelte';
  import { onMount } from 'svelte';

  Events.add('loading', event => loading = event.data);
  Events.add('pause', togglePause);

  Events.add('loaded', event => {
    Events.remove('loading');
    Events.remove('loaded');

    loading = 100;
    loaded = true;
    game.init();
  });

  const game = new Game();
  game.paused = true;

  let loaded = false;
  let loading = 0;

  let paused = false;
  let ready = false;

  function togglePause (event) {
    paused = !!event.data;
    game.paused = paused;

    if (!paused) {
      game.start();
    }
  }

  function startGame (event) {
    paused = false;
    ready = true;
    game.start();
  }

  onDestroy(() => { Events.remove('pause'); });
  onMount(() => { game.loadAssets(); });
</script>

<style>
@font-face {
  src: url('../assets/fonts/FaceYourFears.ttf') format('truetype');
  font-family: 'FaceYourFears';
  font-stretch: normal;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  src: url('../assets/fonts/DrawingBlood.ttf') format('truetype');
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
  font-kerning: none;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;

  background-color: #000000;
  letter-spacing: normal;
  line-height: normal;
  overflow: hidden;
  color: #ffffff;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

:global(canvas) {
  transition: opacity 0.5s;
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
</style>
