<div>
  <canvas bind:this={scene} width={width} height={height} />

  {#if visibleSettings}
    <Settings
      on:menu={({ detail }) => changeView(false, detail)}
    />
  {/if}

  {#if visibleMenu}
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
  import { createEventDispatcher, tick, onMount, onDestroy } from 'svelte';
  import Settings from '@/components/menu/Settings.svelte';
  import { Await } from '@components/overlay/index';
  import Menu from '@/components/menu/Main.svelte';
  import MenuScene from '@/scenes/MenuScene';

  let scene: HTMLCanvasElement;
  let visibleSettings = false;
  let settingsUpdate = false;
  export let ready: boolean;
  let menuScene: MenuScene;

  let visibleMenu = true;
  let fadingMenu = true;
  let selectedItem = 0;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dispatch = createEventDispatcher();

  async function changeView (settings: boolean, update = false): Promise<void> {
    if (update) return saveSettingsUpdate();
    menuScene.rotateCamera(+settings * -0.5);

    visibleSettings = settings;
    selectedItem = +!settings;
    visibleMenu = !settings;
    fadingMenu = false;
  }

  async function saveSettingsUpdate (): Promise<void> {
    dispatch('update', true);
    menuScene.freeze = true;
    settingsUpdate = true;

    dispatch('hide');
    await tick();
    dispatch('update', false)
  }

  function settingsUpdated (): void {
    setTimeout(() => changeView(false), 3500);

    setTimeout(() => {
      menuScene.freeze = false;
      settingsUpdate = false;
    }, 2500);
  }

  function onPlay (): void {
    visibleMenu = false;
    const delay = +!DEBUG * 3e3;
    menuScene.playScreamAnimation();
    setTimeout(() => dispatch('start'), delay);
  }

  onMount(() => menuScene = new MenuScene(scene));

  onDestroy(() => menuScene?.dispose());

  $: (now =>
    settingsUpdate && now && settingsUpdated()
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
