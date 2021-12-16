<main>
  {#if paused && !menuScreen && !loading}
    <Pause on:continue={() => paused = false} />
  {/if}

  {#if menuScreen && !showLoader}
    <MainMenu
      on:start={() => {
        showLoader = true;
        loading = true;
        paused = false;
      }}
    />
  {/if}

  {#if appReady && showLoader}
    <Loader
      sceneLoading={loading}
      on:complete={() => {
        showLoader = false;
        loading = false;
      }}
    />
  {/if}

  <Game
    running={!paused}
    on:ready={() => appReady = true}

    on:firstDraw={() => {
      menuScreen = false;
      showLoader = false;
      loading = false;
    }}
  />
</main>

<script lang="ts">
  import MainMenu from '@components/menu/MainMenu.svelte';
  import { GameEvents } from '@/events/GameEvents';
  import Loader from '@components/Loader.svelte';

  import Pause from '@components/Pause.svelte';
  import Game from '@components/Game.svelte';
  import { onDestroy } from 'svelte';

  let menuScreen = true;
  let showLoader = true;

  let appReady = false;
  let loading = true;
  let paused = true;

  !import.meta.hot && onDestroy(() =>
    GameEvents.remove('Game::Pause')
  );

  GameEvents.add('Game::Pause', () =>
    paused = true
  );
</script>

<style lang="scss" global>
@use "@/variables" as var;
@use "@/mixins" as mixin;

h1,
h2,
h3,
h4 {
  font-family: FaceYourFears, sans-serif;
  letter-spacing: normal;
  line-height: normal;

  position: relative;
  color: var.$red;
  display: block;

  padding: 0;
  margin: 0;
}

p,
h5,
h6,
span,
strong,
button {
  font-family: DrawingBlood, sans-serif;
  letter-spacing: 0.2rem;
  line-height: normal;

  position: relative;
  color: var.$grey;
  display: block;

  padding: 0;
  margin: 0;
}

h1 {
  @include mixin.font-size(5);
  text-transform: uppercase;
}

h2 {
  @include mixin.font-size(4);
}

h3 {
  @include mixin.font-size(3);
}

main {
  @include mixin.absolute-size;
  overflow: hidden;
  display: block;

  padding: 0;
  margin: 0;
}
</style>
