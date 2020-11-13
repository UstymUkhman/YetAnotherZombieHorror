<div class="container" >
  <div bind:this={aim} class="aim" class:running class:shooting />
</div>

<script lang="typescript">
  import { GameEvents } from '@/managers/GameEvents';
  import { onMount, onDestroy } from 'svelte';

  export let running: boolean;
  let aim: HTMLDivElement;
  let shooting = false;

  function onShoot (): void {
    setTimeout(() => shooting = false, 150);
    setTimeout(() => shooting = true);
    shooting = false;
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
    transition-property: transform, opacity;
    transition-timing-function: ease-out;
    transform-origin: center center;
    transition-duration: 250ms;

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

    &.running {
      transition-timing-function: ease-in;
      transform: scale(1.5);
      opacity: 0;
    }

    &.shooting {
      animation: shoot 150ms ease-out;
    }
  }
}

@keyframes shoot {
  0% {
    transform: scale(1);
  }

  33% {
    transform: scale(1.33);
  }

  100% {
    transform: scale(1);
  }
}
</style>
