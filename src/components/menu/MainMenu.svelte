<div class="screen" in:fade={{ delay: 500 }} out:fade>
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
  import { mix } from '@/utils/Number';
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const keys = ['ArrowUp', 'ArrowDown', 'Enter'];
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
    event.stopPropagation();
    event.preventDefault();
    const key = event.key;

    if (!keys.includes(key)) return;
    else if (key === 'Enter') onClick();
    else selected = updateSelected(key);

    updateRotation();
  }

  function updateSelected (key: string): number {
    const next = +(key === 'ArrowDown') * 2 - 1;

    return Math.abs(
      (items.length + selected + next) % items.length
    );
  }

  function updateRotation (): void {
    rotation = mix(-6, 6, selected / last);
  }

  function onClick () {
    switch (selected) {
      case 0:
        dispatch('start');
      break;

      case 1:
      case 2:
      break;

      case 3:
        window.exit();
      break;
    }
  }

  onMount(() =>
    document.addEventListener('keyup', onKeyUp, false)
  );

  onDestroy(() =>
    document.removeEventListener('keyup', onKeyUp, true)
  );
</script>

<style lang="scss">
@use "@/mixins" as mixin;
@use "@/variables" as var;

div {
  @include mixin.center-size;
  background-color: var.$black;

  perspective-origin: 0% 50%;
  perspective: 25vmax;

  z-index: 1;
  padding: 0;

  menu {
    transition: transform 0.2s var.$ease-in-out-quad;
    justify-content: space-between;
    transform-style: preserve-3d;

    align-content: space-between;
    transform-origin: 50% 50%;

    align-items: flex-start;
    flex-direction: column;

    position: absolute;
    padding: 0 0 0 15%;

    list-style: none;
    margin: auto 0;
    display: flex;

    width: 50%;
    bottom: 0;
    top: 0;

    li {
      width: 100%;
      cursor: pointer;
      transform-style: preserve-3d;

      h3 {
        transition: transform 0.4s var.$ease-in-out-quad, color 0.2s;
        transform-style: preserve-3d;

        transform-origin: 50% 50%;
        pointer-events: none;

        &.active {
          color: rgba(var.$white, 0.8);
          transform: translateX(1vw);
        }
      }
    }
  }
}
</style>
