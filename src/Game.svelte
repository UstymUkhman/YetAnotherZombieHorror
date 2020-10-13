<main bind:this={main}>
  {#if Settings.APP}<Close />{/if}

  {#if loading}<Loader />{/if}

  <Map
    playerRotation={location.rotation.y}
    playerPosition={location.position}
    scale={scale} zoom={1}
  />
</main>

<script lang="typescript">
  import { onMount, onDestroy } from 'svelte';
  import Close from '@components/CloseButton';

  import GameLoop from '@/managers/GameLoop';
  import Loader from '@components/Loader';

  import { Settings } from '@/settings';
  import Map from '@components/Map';

  let main: HTMLElement;
  let loading = true;
  let scale: number;

  const game = new GameLoop();
  const location = game.playerLocation;

  window.addEventListener('resize', updateScale);

  function updateScale () {
    scale = window.innerWidth / 175;
  }

  onMount(() => {
    main.prepend(game.scene);
    game.pause = false;
    updateScale();
  });

  onDestroy(() => {
    game.pause = true;
    game.destroy();
  });
</script>

<style lang="scss" global>
@import '@scss/variables';
@import '@scss/fonts';

html,
body {
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

  background-color: $black;
  letter-spacing: normal;
  line-height: normal;
  user-select: none;
  overflow: hidden;
  color: $red;

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
strong {
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
  font-size: 5vw;
}

h2 {
  letter-spacing: 0.4rem;
  font-size: 4vw;
}

h3 {
  letter-spacing: 0.3rem;
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
