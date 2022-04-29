<canvas bind:this={canvas} width={width} height={height} class:visible />

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import Viewport from '@/utils/Viewport';
  import { onDestroy } from 'svelte';

  const height = Viewport.size.height;
  const width = Viewport.size.width;

  // @ts-expect-error
  let canvas: HTMLCanvasElement;
  export let updating = false;
  let visible = false;

  $: (update => update
    ? GameEvents.remove('Rain::Toggle')
    : GameEvents.add('Rain::Toggle', event =>
        visible = event.data
      )
  )(updating);

  onDestroy(() => GameEvents.remove('Rain::Toggle'));
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  canvas {
    @include mixin.size(var(--width), var(--height));
    @include mixin.center-transform;

    aspect-ratio: var(--ratio);
    pointer-events: none;
    overflow: hidden;
    display: none;

    padding: 0;
    margin: 0;

    &.visible {
      display: block;
    }
  }
</style>
