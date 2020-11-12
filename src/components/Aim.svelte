<div class="container">
  <div class="aim" class:shooting />
</div>

<script lang="typescript">
  import { GameEvents } from '@/managers/GameEvents';
  import { onMount, onDestroy } from 'svelte';

  let shooting = false;

  function onShoot (): void {
    setTimeout(() => { shooting = false; }, 50);
    shooting = true;
  }

  onMount(() => {
    GameEvents.add('player:shoot', onShoot);
  });

  onDestroy(() => {
    GameEvents.remove('player:shoot');
  });
</script>

<style lang="scss">
@import '@scss/variables';

div.container {
  position: absolute;
  display: block;
  margin: auto;

  height: 15px;
  width: 15px;
  padding: 0;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

  div.aim {
    transition-timing-function: ease-out;
    transform-origin: center center;
    transition-property: transform;
    transition-duration: 100ms;

    border: 2px solid $white;
    border-radius: 50%;

    position: absolute;
    display: block;

    height: 100%;
    width: 100%;

    left: -2px;
    top: -2px;

    padding: 0;
    margin: 0;

    &.shooting {
      transition-duration: 50ms;
      transform: scale(1.33);
    }
  }
}
</style>
