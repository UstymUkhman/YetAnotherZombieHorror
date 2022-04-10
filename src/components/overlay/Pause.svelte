<div transition:fade>
  <ul>
    <li on:mouseover={() => onMouseOver(0)}
        on:click={onClick}
        on:focus
    >
      <h3 class:active={!selected}>Continue</h3>
    </li>

    <li on:mouseover={() => onMouseOver(1)}
        on:click={onClick}
        on:focus
    >
      <h3 class:active={selected}>Quit</h3>
    </li>
  </ul>
</div>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getKey } from '@components/menu/utils';
  import Sounds from '@components/menu/Sounds';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  let selected = 0;

  function onKeyDown (event: KeyboardEvent): void {
    const key = getKey(event, selected, 2);
    if (key === -1) return onClick();

    selected = key;
    Sounds.onHover();
  }

  function onMouseOver (index: number): void {
    selected !== index && Sounds.onHover();
    selected = index;
  }

  function onClick (): void {
    Sounds.onClick();
    dispatch(selected ? 'quit' : 'continue');
  }

  onMount(() =>
    document.addEventListener('keydown', onKeyDown, true)
  );

  onDestroy(() =>
    document.removeEventListener('keydown', onKeyDown, true)
  );
</script>

<style lang="scss">
  @use "../menu/mixins" as menu;
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div {
    @include mixin.absolute-size;

    background-color: var.$black;
    display: block;

    z-index: 1;
    padding: 0;
    margin: 0;

    left: 0;
    top: 0;

    ul {
      @include menu.list(h3);

      text-align: center;
      position: absolute;

      margin: auto;
      height: 25vh;
      width: 20%;

      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
    }
  }
</style>
