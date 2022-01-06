<div>
  <canvas bind:this={scene} width={width} height={height} />
  <Menu on:start />
</div>

<script lang="ts">
  import Menu from '@/components/menu/Main.svelte';
  import type MenuScene from '@/scenes/MenuScene';
  import { onMount, onDestroy } from 'svelte';

  let menuScene: MenuScene;
  let scene: HTMLCanvasElement;

  const width = window.innerWidth;
  const height = window.innerHeight;

  onMount(() => import('@/scenes/MenuScene').then(MenuScene =>
    menuScene = new MenuScene.default(scene)
  ));

  onDestroy(() => menuScene?.dispose());
</script>

<style lang="scss">
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  div {
    z-index: 1;
    @include mixin.center-size;
    background-color: var.$black;

    canvas {
      @include mixin.center-size;
    }
  }
</style>
