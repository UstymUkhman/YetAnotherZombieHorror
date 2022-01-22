<main>
  {#if menuScreen && !loading}
    <Menu
      ready={appReady}
      on:hide={() => appReady = false}
      on:update={({ detail }) => updating = detail}

      on:start={() => {
        loading = true;
        paused = false;
      }}
    />
  {/if}

  {#if paused && !menuScreen}
    <Pause on:continue={() => paused = false} />
  {/if}

  {#if appReady && loading}
    <Await
      on:complete={() => loading = false}
      loading
    />
  {/if}

  {#if !updating}
    <Game
      running={!paused}
      on:ready={() => appReady = true}
      on:firstDraw={() => {
        menuScreen = false;
        loading = false;
      }}
    />
  {/if}
</main>

<script lang="ts">
  import { Await, Pause } from '@components/overlay/index';
  import Menu from '@components/menu/Screen.svelte';
  import { GameEvents } from '@/events/GameEvents';
  import Game from '@components/Game.svelte';
  import { onDestroy } from 'svelte';

  let menuScreen = true;
  let updating = false;
  let appReady = false;
  let loading = true;
  let paused = true;

  onDestroy(() =>
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

  @for $h from 1 through 3 {
    h#{$h} {
      @include mixin.font-size(#{6 - $h});
    }
  }

  main {
    @include mixin.absolute-size;
    overflow: hidden;
    display: block;

    padding: 0;
    margin: 0;
  }
</style>
