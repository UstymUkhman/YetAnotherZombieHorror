<div>
  <h1>{Math.floor(lastProgress * 100)}</h1>
</div>

<script lang="typescript">
  import { GameEvents, GameEvent } from '@/managers/GameEvents';
  import { clamp } from '@/utils/Number';

  const assets = new Map();
  let totalProgress = 0;
  let lastProgress = 0;
  let loadedAssets = 0;

  function onStart (event: GameEvent): void {
    assets.set(event.data, 0);
  }

  function onProgress (event: GameEvent): void {
    const { uuid, progress } = event.data;

    assets.set(uuid, progress);
    assets.forEach(load => totalProgress += load);

    totalProgress /= assets.size * 100;
    lastProgress = clamp(totalProgress, lastProgress, 0.99);
  }

  function onLoad (event: GameEvent): void {
    assets.set(event.data, 100);
    loadedAssets++;
  }

  GameEvents.add('start:loading', onStart);
  GameEvents.add('is:loading', onProgress);
  GameEvents.add('end:loading', onLoad);
</script>

<style lang="scss">
@import '@scss/variables';

div {
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

  h1 {
    text-align: center;
    position: absolute;

    display: block;
    width: 100%;

    top: 45%;
  }
}
</style>
