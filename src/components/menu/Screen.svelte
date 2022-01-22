<div>
  <canvas bind:this={scene} width={width} height={height} />

  {#if sceneLoaded && visibleSettings}
    <Settings
      on:menu={({ detail }) => changeView(false, detail)}
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

  {#if settingsUpdate}
    <Await updating />
  {/if}
</div>

<script lang="ts">
  import Settings from '@/components/menu/Settings.svelte';
  import { Await } from '@components/overlay/index';
  import { GameEvents } from '@/events/GameEvents';

  import Menu from '@/components/menu/Main.svelte';
  import type MenuScene from '@/scenes/MenuScene';
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  let scene: HTMLCanvasElement;
  let visibleSettings = false;
  let settingsUpdate = false;
  export let ready: boolean;
  let menuScene: MenuScene;

  let sceneLoaded = false;
  let visibleMenu = true;
  let fadingMenu = true;
  let selectedItem = 0;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dispatch = createEventDispatcher();

  function saveSettingsUpdate (): void {
    setTimeout(() => dispatch('update', false));
    dispatch('update', true);
    menuScene.freeze = true;
    settingsUpdate = true;
    dispatch('hide');
  }

  function changeView (settings: boolean, update = false): void {
    if (update) return saveSettingsUpdate();
    menuScene.rotateCamera(+settings * -0.5);

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

  $: (now =>
    settingsUpdate && now && setTimeout(() => {
      menuScene.freeze = false;
      settingsUpdate = false;
      changeView(false);
    }, 500)
  )(ready);
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
