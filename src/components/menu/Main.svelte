<div in:fade={{ duration: 100, delay: 500 }} out:fade>
  <menu style="{`
    transform: rotateY(12deg) rotateX(${rotation}deg);
    height: ${items.length * 10 + 10}%;
  `}">
    {#each items as item, i}
      <li on:mouseover={() => onMouseOver(i)}
          on:click={onClick}
          on:focus
      >
        <h3 class:active="{selected === i}">{item}</h3>
      </li>
    {/each}
  </menu>
</div>

<script lang="ts">
  import Configs from '@/configs';
  import onKeyEvent from './utils';
  import { mix } from '@/utils/Number';

  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const items = ['Play', 'Settings', 'Credits'];
  const dispatch = createEventDispatcher();
  Configs.APP && items.push('Exit');
  const last = items.length - 1;

  let rotation = -6;
  let selected = 0;

  function onMouseOver (index: number): void {
    selected = index;
    updateRotation();
  }

  function onKeyUp (event: KeyboardEvent): void {
    const key = onKeyEvent(event, selected, items.length);

    if (key === -1) onClick();
    else selected = key;

    updateRotation();
  }

  function updateRotation (): void {
    rotation = mix(-6, 6, selected / last);
  }

  function onClick (): void {
    switch (selected) {
      case 0:
        dispatch('play');
      break;

      case 1:
        dispatch('settings');
      break;

      case 2:
      break;

      case 3:
        window.exit();
      break;
    }
  }

  onMount(() =>
    document.addEventListener('keyup', onKeyUp, true)
  );

  onDestroy(() =>
    document.removeEventListener('keyup', onKeyUp, true)
  );
</script>

<style lang="scss">
  @use "./mixins" as menu;
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  div {
    @include mixin.size;

    perspective: 25vmax;
    perspective-origin: 0% 50%;

    menu {
      @include menu.list(h3);

      transition: transform 0.2s var.$ease-in-out-quad;
      transform-style: preserve-3d;
      transform-origin: 50% 50%;

      position: absolute;
      padding-left: 20%;
      margin: auto 0;

      width: 50%;
      bottom: 0;
      top: 0;

      li {
        transform-style: preserve-3d;

        h3 {
          transform-style: preserve-3d;
          transform-origin: 50% 50%;

          &.active {
            transform: translateX(1vw);
          }
        }
      }
    }
  }
</style>
