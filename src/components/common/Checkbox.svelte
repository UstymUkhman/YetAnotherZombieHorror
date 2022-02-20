<input type="checkbox" on:change={onToggle} class:active class:checked />

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let checked = false;
  export let active = false;

  function onToggle (): void {
    dispatch('toggle', !checked);
    checked = !checked;
  }
</script>

<style lang="scss">
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  input {
    @include mixin.cursor(true);
    @include mixin.size(1.25rem);

    background-color: transparent;
    border: 1px solid var.$red;
    box-sizing: border-box;

    position: relative;
    appearance: none;

    display: block;
    outline: none;

    padding: 0;
    margin: 0;

    &::after {
      transition: background-color 200ms, transform 250ms, opacity 250ms;
      will-change: background-color, transform, opacity;
      transition-timing-function: var.$ease-in-quad;

      backface-visibility: hidden;
      background-color: var.$red;
      @include mixin.size(14px);

      transform: scale(0);
      position: absolute;

      content: "";
      opacity: 0;

      left: 2px;
      top: 2px;
    }

    &.checked {
      transition-timing-function: var.$ease-out-quad;

      &::after {
        transform: scale(1);
        opacity: 1;
      }
    }

    &:hover::after,
    &.active::after {
      background-color: rgba(var.$white, 0.8);
    }
  }
</style>
