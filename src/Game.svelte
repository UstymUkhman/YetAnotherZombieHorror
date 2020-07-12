<main bind:this={game}>
  {#if Settings.APP}
    <Close />
  {/if}

  <Map bounds={Settings.Level0.bounds} />
</main>

<script lang="typescript">
import Close from '@components/CloseButton';
import Level0 from '@/environment/Level0';

import { Settings } from '@/settings';
import Map from '@components/Map';
import { onMount } from 'svelte';

let game: HTMLElement;
const level = new Level0();

onMount(() => { game.prepend(level.canvas); });
</script>

<style lang="scss">
@import 'src/scss/fonts';
@import 'src/scss/variables';

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

:global(h1, h2, h3, h4) {
  font-family: 'FaceYourFears', sans-serif;
  letter-spacing: normal;
  line-height: normal;

  position: relative;
  display: block;
  color: $red;

  padding: 0;
  margin: 0;
}

:global(h5, h6, strong, span, p) {
  font-family: 'DrawingBlood', sans-serif;
  letter-spacing: 0.2rem;
  line-height: normal;

  position: relative;
  display: block;
  color: $grey;

  padding: 0;
  margin: 0;
}

:global(h1) {
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  font-size: 5vw;
}

:global(h2) {
  letter-spacing: 0.4rem;
  font-size: 4vw;
}

:global(h3) {
  letter-spacing: 0.3rem;
  font-size: 3vw;
}

:global(body > canvas) {
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
