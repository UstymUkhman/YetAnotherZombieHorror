<div>
  <canvas bind:this={scene} width={width} height={height} />

  {#if sceneLoaded && visibleSettings}
    <Settings
      on:menu={() => changeView(false)}
    />
  {/if}

  {#if sceneLoaded && visibleMenu}
    <Menu
      on:settings={() => changeView(true)}
      selected={selectedItem}
      menuFade={fadingMenu}
      on:play={onPlay}
    />
  {/if}
</div>

<script lang="ts">
  import Settings from '@/components/menu/Settings.svelte';
  import { GameEvents } from '@/events/GameEvents';

  import Menu from '@/components/menu/Main.svelte';
  import type MenuScene from '@/scenes/MenuScene';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  let visibleSettings = false;
  let sceneLoaded = false;
  let visibleMenu = true;
  let fadingMenu = true;
  let selectedItem = 0;

  let menuScene: MenuScene;
  let scene: HTMLCanvasElement;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dispatch = createEventDispatcher();

  function changeView (settings: boolean): void {
    menuScene.rotateCamera(+settings * -0.5);
    dispatch('settings', settings);

    visibleSettings = settings;
    selectedItem = +!settings;
    visibleMenu = !settings;
    fadingMenu = false;
  }

  function onPlay (): void {
    visibleMenu = false;
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
