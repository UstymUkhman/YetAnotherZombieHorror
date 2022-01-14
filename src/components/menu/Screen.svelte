<div>
  <canvas bind:this={scene} width={width} height={height} />

  {#if sceneLoaded}
    <Menu on:play={onPlay} />
  {/if}
</div>

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import Menu from '@/components/menu/Main.svelte';
  import type MenuScene from '@/scenes/MenuScene';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  let sceneLoaded = false;
  let menuScene: MenuScene;
  let scene: HTMLCanvasElement;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dispatch = createEventDispatcher();

  function onPlay (): void {
    menuScene.playScreamAnimation();
    setTimeout(() => dispatch('start'), 3000);
  }

  GameEvents.add('MenuScene::Loaded', () => {
    GameEvents.remove('MenuScene::Loaded');
    sceneLoaded = true;
  });

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
