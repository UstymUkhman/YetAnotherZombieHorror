<input type="range" min={min - offset} max={max - offset} value={value} step="1" on:input={onUpdate} class:active>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let active = false;
  export let value = 100;
  export let offset = 0;
  export let max = 100;
  export let min = 0;

  function onUpdate (event: Event): void {
    const target = event.target as HTMLInputElement;
    dispatch('update', +target.value);
  }
</script>

<style lang="scss">
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  input {
    background-color: transparent;

    position: relative;
    appearance: none;
    height: 1.25rem;

    cursor: pointer;
    display: block;
    outline: none;

    width: 50%;
    padding: 0;
    margin: 0;

    &::-webkit-slider-runnable-track {
      @include mixin.size(100%, 5px);
      background-color: var.$red;
      border: none;
    }

    &::-webkit-slider-thumb {
      transition: background-color 200ms;
      background-color: var.$red;
      @include mixin.size(12px);

      margin-top: -3.5px;
      appearance: none;
      border: none;
    }

    &:hover::-webkit-slider-thumb,
    &.active::-webkit-slider-thumb {
      background-color: rgba(var.$white, 0.8);
    }
  }
</style>
