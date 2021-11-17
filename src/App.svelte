<main>
  {#if paused && !loading}
    <Pause on:continue={() => paused = false} />
  {/if}

  {#if appReady && showLoader}
    <Loader
      sceneLoading={loading}
      on:complete={() => loading = false}

      on:start={()=> {
        loading = true;
        paused = false;
      }}
    />
  {/if}

  <Game
    running={!paused}
    on:ready={() => appReady = true}

    on:firstDraw={() => {
      showLoader = false;
      loading = false;
    }}
  />
</main>

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import Loader from '@components/Loader.svelte';

  import Pause from '@components/Pause.svelte';
  import Game from '@components/Game.svelte';
  import { onDestroy } from 'svelte';

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

main {
  position: absolute;
  overflow: hidden;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;
}
</style>
