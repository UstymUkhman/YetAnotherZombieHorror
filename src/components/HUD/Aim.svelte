<div class="container" >
  <div class="aim" class:hide class:shooting />
</div>

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import { onMount, onDestroy } from 'svelte';

  export let hide: boolean;
  let shooting = false;

  function onShoot (): void {
    setTimeout(() => shooting = false, 150);
    setTimeout(() => shooting = true);
    shooting = false;
  }

  onMount(() =>
    GameEvents.add('Player::Shoot', onShoot, true)
  );

  onDestroy(() =>
    GameEvents.remove('Player::Shoot', true)
  );
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;
  @import "@/animations";

  div.container {
    @include mixin.center-size(15px);
    padding: 0;

    div.aim {
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

      &.shooting {
        animation: 150ms ease-out shoot;
      }

      &.hide {
        transition-timing-function: ease-in;
        transform: scale(1.5);
        opacity: 0;
      }
    }
  }
</style>
