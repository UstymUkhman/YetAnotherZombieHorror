<div in:screenFade={{ show: true, menuFade }} out:screenFade={{ menuFade }}>
  <menu style={`
    transform: rotateY(12deg) rotateX(${rotation}deg);
    height: ${items.length * 10 + 20}%;
  `}>

    {#each items as item, i}
      <li on:mouseover={() => onMouseOver(i)}
          on:keydown={onClick}
          on:click={onClick}
          on:focus
      >
        <h3 class:active={selected === i}>{item}</h3>
      </li>
    {/each}

  </menu>
</div>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getKey, screenFade } from '@/components/menu/utils';
  import Sounds from '@/components/menu/Sounds';

  import { mix } from '@/utils/Number';
  import Configs from '@/configs';

  const items = ['Play', 'Settings', 'Credits'];
  const dispatch = createEventDispatcher();

  Configs.APP && items.push('Exit');
  const last = items.length - 1;

  export let menuFade: boolean;
  export let selected: number;

  let rotation = -6;

  function onKeyDown (event: KeyboardEvent): void {
    const key = getKey(event, selected, items.length);
    if (key === -1) return onClick();

    selected = key;
    Sounds.onHover();
    updateRotation();
  }

  function onMouseOver (index: number): void {
    selected !== index && Sounds.onHover();
    selected = index;
    updateRotation();
  }

  function updateRotation (): void {
    rotation = mix(-6, 6, selected / last);
  }

  function onClick (): void {
    Sounds.onClick();

    switch (selected) {
      case 0:
        dispatch('play');
        menuFade = true;
      break;

      case 1:
        dispatch('settings');
        menuFade = false;
      break;

      case 2:
      break;

      case 3:
        window.exit();
      break;
    }
  }

  onMount(() =>
    document.addEventListener('keydown', onKeyDown, true)
  );

  onDestroy(() =>
    document.removeEventListener('keydown', onKeyDown, true)
  );

  $: updateRotation();
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

      width: 30%;
      bottom: 0;
      top: 0;
    }

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
</style>
