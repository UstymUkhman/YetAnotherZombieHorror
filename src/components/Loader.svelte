<div class="screen" transition:fade>
  <div class="progress">
    <h1>Loading...</h1>
    <h1>{Math.floor(progress * 100)}%</h1>
  </div>
</div>

<script lang="typescript">
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  import { createEventDispatcher } from 'svelte';

  import { fade } from 'svelte/transition';
  import { clamp } from '@/utils/Number';

  const dispatch = createEventDispatcher();
  const assets = new Map();

  type ProgressData = {
    progress: number
    uuid: string
  };

  let progress = 0;
  let loaded = 0;
  let total = 0;

  function onStart (event: GameEvent): void {
    assets.set(event.data, 0);
  }

  function onProgress (event: GameEvent): void {
    const loading = event.data as ProgressData;

    assets.set(loading.uuid, loading.progress);
    assets.forEach(load => total += load);

    total /= assets.size * 100;
    progress = clamp(total, progress, 0.99);
  }

  function onLoad (event: GameEvent): void {
    assets.set(event.data, 100);

    if (assets.size === ++loaded) {
      setTimeout(() => dispatch('loaded'), 500);
      GameEvents.remove('start:loading');
      GameEvents.remove('end:loading');
      GameEvents.remove('is:loading');
      progress = 1;
    }
  }

  GameEvents.add('start:loading', onStart);
  GameEvents.add('is:loading', onProgress);
  GameEvents.add('end:loading', onLoad);
</script>

<style lang="scss">
@import '@scss/variables';

div.screen {
  background-color: $black;
  justify-content: center;

  align-items: center;
  position: absolute;
  display: flex;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

  div.progress {
    justify-content: space-between;
    align-content: center;
    align-items: center;

    position: absolute;
    line-height: 5vw;
    display: flex;

    margin: auto;
    height: 5vw;
    width: 40vw;

    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
  }
}
</style>
