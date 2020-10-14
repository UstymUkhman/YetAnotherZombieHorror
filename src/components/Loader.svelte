<h1>{Math.floor(progress * 100)}</h1>

<script lang="typescript">
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  import { createEventDispatcher } from 'svelte';
  import { clamp } from '@/utils/Number';

  const dispatch = createEventDispatcher();
  const assets = new Map();

  type ProgressData = {
    progress: number,
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
      GameEvents.remove('start:loading');
      GameEvents.remove('end:loading');
      GameEvents.remove('is:loading');

      dispatch('loaded');
      progress = 1;
    }
  }

  GameEvents.add('start:loading', onStart);
  GameEvents.add('is:loading', onProgress);
  GameEvents.add('end:loading', onLoad);
</script>

<style lang="scss">
@import '@scss/variables';

h1 {
  text-align: center;
  position: absolute;

  display: block;
  width: 100%;

  top: 45%;
}
</style>
