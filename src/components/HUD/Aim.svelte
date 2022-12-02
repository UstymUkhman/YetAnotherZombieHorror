<div class="container">
  <div
    bind:this={aim}
    class:shooting
    class:black
    class:hide
    class:red
  />
</div>

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import { onDestroy } from 'svelte';

  export let black = false;
  export let hide: boolean;

  let aim: HTMLDivElement;
  let shooting = false;
  let red = false;

  function onShoot (): void {
    setTimeout(() => {
      void aim.offsetWidth;
      shooting = false;
    }, 150);

    setTimeout(() => shooting = true);
    shooting = false;
  }

  GameEvents.add('Player::Shoot', onShoot, !black);

  GameEvents.add('Weapon::Aim', event =>
    red = event.data
  , !black);

  onDestroy(() => {
    GameEvents.remove('Player::Shoot', true);
    GameEvents.remove('Weapon::Aim', true);
  });
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;
  @import "@/animations";

  div.container {
    @include mixin.center-size(15px);

    padding: 0;
    z-index: 1;

    > div:first-child {
      @include mixin.absolute-size;

      transition-property: transform, opacity;
      transition-timing-function: ease-out;
      transform-origin: center center;
      transition-duration: 250ms;

      border: 2px solid var.$white;
      border-radius: 50%;
      display: block;

      left: -2px;
      top: -2px;

      padding: 0;
      margin: 0;

      &.hide {
        transition-timing-function: ease-in;
        transform: scale(1.5);
        opacity: 0;
      }

      &.shooting {
        animation: 150ms ease-out shoot;
      }

      &.black {
        border-color: var.$black;
      }

      &.red {
        border-color: var.$red;
      }
    }
  }
</style>
