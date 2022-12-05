<main>
  {#if menuScreen && !loading}
    <Menu
      on:update={({ detail }) => updating = detail}
      on:hide={() => appReady = false}
      on:start={onStart}
      ready={appReady}
      />
  {/if}

  {#if paused && !menuScreen}
    <Pause
      on:continue={() => paused = false}
      on:quit={onQuit}
    />
  {/if}

  {#if appReady && loading}
    <Await
      on:complete={() => loading = false}
      loading
    />
  {/if}

  {#if !updating}
    <Game
      on:quit={onQuit}
      running={!paused}
      raindrops={raindrops}
      on:ready={() => appReady = true}
      on:firstUpdate={() => {
        menuScreen = false;
        loading = false;
      }}
    />
  {/if}

  <Raindrops bind:this={raindrops} updating={updating} />
</main>

<script lang="ts">
  import { Await, Pause, Raindrops } from '@components/overlay/index';
  import Menu from '@components/menu/Screen.svelte';
  import { GameEvents } from '@/events/GameEvents';

  import Game from '@components/Game.svelte';
  import { onDestroy } from 'svelte';
  import Configs from '@/configs';

  let raindrops: Raindrops;
  let menuScreen = true;
  let appReady = false;

  let updating = false;
  let loading = true;
  let paused = true;

  const getAssetsPath = () => {
    let path = window.location.pathname;
    const base = Configs.basePath(true);

    path = path.slice(0, path.lastIndexOf('/'));
    return !base && `${path}/assets` || base;
  };

  function onStart (): void {
    setTimeout(() => paused = false, 500);
    loading = true;
  }

  function onQuit (): void {
    GameEvents.dispatch('Rain::Toggle', false);
    setTimeout(() => updating = false, 1e3);

    menuScreen = true;
    updating = true;
  }

  $: (update => update
    ? GameEvents.remove('Game::Pause')
    : GameEvents.add('Game::Pause', () => paused = true)
  )(updating);

  (() => {
    const assetsPath = getAssetsPath();
    const { style } = document.documentElement;

    const defaultCursor = `${assetsPath}/images/cursor/default.png`;
    const pointerCursor = `${assetsPath}/images/cursor/pointer.png`;

    style.setProperty('--default-cursor', `url("${defaultCursor}")`);
    style.setProperty('--pointer-cursor', `url("${pointerCursor}")`);
  })();

  !import.meta.hot && onDestroy(() =>
    GameEvents.remove('Game::Pause')
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

  @for $h from 1 through 3 {
    h#{$h} {
      @include mixin.font-size(#{6 - $h});
    }
  }

  main {
    @include mixin.absolute-size;
    @include mixin.cursor;

    overflow: hidden;
    display: block;

    padding: 0;
    margin: 0;
  }
</style>
