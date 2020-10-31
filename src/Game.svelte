<main bind:this={main}>
  {#if Config.APP}
    <Close />
  {/if}

  {#if loading}
    <Loader on:loaded={onLoad} />
  {:else}
    {#if game.pause}
      <Pause on:start={() => togglePause(false)} />
    {:else}
      <Map
        playerRotation={location.rotation}
        playerPosition={location.position}
        scale={scale} zoom={1}
      />
    {/if}
  {/if}
</main>

<script lang="typescript">
  import { GameEvents } from '@/managers/GameEvents';
  import Close from '@components/CloseButton.svelte';
  import Loader from '@components/Loader.svelte';
  import Pause from '@components/Pause.svelte';

  import { onMount, onDestroy } from 'svelte';
  import GameLoop from '@/managers/GameLoop';
  import Map from '@components/Map.svelte';
  import { Config } from '@/config';

  let main: HTMLElement;
  let loading = true;
  let scale: number;
  let raf: number;

  const game = new GameLoop();
  let location = game.playerLocation;

  window.addEventListener('resize', updateScale);
  GameEvents.add('pause', event => togglePause(event.data as boolean));

  function togglePause (paused: boolean): void {
    if (game.pause !== paused) {
      paused
        ? cancelAnimationFrame(raf)
        : updateGameLoop();

      game.pause = paused;
    }
  }

  function updateGameLoop (): void {
    raf = requestAnimationFrame(updateGameLoop);
    location = game.playerLocation;
    game.update();
  }

  function updateScale (): void {
    scale = window.innerWidth / 175;
  }

  function onLoad (): void {
    loading = false;
  }

  onMount(() => {
    main.prepend(game.scene);
    updateScale();
  });

  onDestroy(() => {
    togglePause(true);
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
