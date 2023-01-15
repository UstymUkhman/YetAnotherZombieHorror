<Aim hide={!aiming} />

{#if visibleHUD}
  <div transition:fade>
    <Map
      playerPosition={playerLocation.position}
      playerRotation={playerLocation.rotation}
      radius={mapRadius / zoomScale}
      scale={scale} zoom={zoomScale}
      on:rifle={updateRifleAngle}
      enemies={enemiesPositions}
    />

    {#if visibleRifle}
      <BorderRifle
        playerRotation={playerLocation.rotation}
        angle={rifleAngle}
      />
    {/if}
  </div>
{/if}

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import BorderRifle from '@components/map/BorderRifle.svelte';
  import type { PlayerLocation } from '@/characters/types';
  import type { Vector3 } from 'three/src/math/Vector3';

  import { GameEvents } from '@/events/GameEvents';
  import Aim from '@components/HUD/Aim.svelte';
  import Map from '@components/map/Map.svelte';

  import { Elastic } from '@/utils/Elastic';
  import { fade } from 'svelte/transition';
  import Viewport from '@/utils/Viewport';

  import { PI } from '@/utils/Number';
  import RAF from '@/managers/RAF';

  type LocationEvent = {
    enemies: Array<Vector3>,
    player: PlayerLocation
  };

  const scaleRatio = Math.tan(PI.d3) + Number.EPSILON;
  const scaleFactor = Math.round(scaleRatio * 100.0);

  const dispatch = createEventDispatcher();
  const radiusFactor = scaleFactor / 10.0;

  const zoom = new Elastic.Number(0.0);
  let enemiesPositions: Array<Vector3>;
  let playerLocation: PlayerLocation;

  let visibleRifle = false;
  let firstUpdate = false;
  let visibleHUD = false;

  let rifleAngle: number;
  let zoomScale: number;
  let mapRadius: number;

  let aiming = false;
  let scale: number;

  function updateRifleAngle (event: CustomEvent): void {
    visibleRifle = event.detail.visible;
    rifleAngle = event.detail.angle;
  }

  function updateScale (width: number): void {
    mapRadius = width / radiusFactor;
    scale = width / scaleFactor;
  }

  function updateZoom (): void {
    zoom.update();

    zoomScale = Math.round(
      (1 - zoom.value) * 1e5 + Number.EPSILON
    ) / 1e5;

    if (zoomScale === 1 || zoomScale === 0.5) {
      RAF.remove(updateZoom);
    }
  }

  function dispatchUpdate (): void {
    setTimeout(() => visibleHUD = aiming = true, 5000);
    setTimeout(() => dispatch('firstUpdate'), 2500);

    firstUpdate = true;
    dispatch('start');
  }

  GameEvents.add('Characters::Location', event => {
    const { player, enemies } = event.data as LocationEvent;
    !firstUpdate && dispatchUpdate();
    enemiesPositions = enemies;
    playerLocation = player;
  }, true);

  GameEvents.add('Player::Run', event => {
    const running = event.data as boolean;
    if (running) aiming = false;
    zoom.set(+running * 0.5);

    RAF.remove(updateZoom);
    RAF.add(updateZoom);
  }, true);

  GameEvents.add('Player::Aim', event =>
    aiming = event.data as boolean
  , true);

  onMount(() => {
    Viewport.addResizeCallback(updateScale);
    updateScale(Viewport.size.width);
  });

  onDestroy(() => {
    GameEvents.remove('Characters::Location', true);
    Viewport.removeResizeCallback(updateScale);

    GameEvents.remove('Player::Run', true);
    GameEvents.remove('Player::Aim', true);

    RAF.remove(updateZoom);
  });
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div {
    @include mixin.size(var(--width), var(--height));
    @include mixin.center-transform;

    aspect-ratio: var(--ratio);
    pointer-events: none;
    overflow: hidden;

    z-index: 1;
    padding: 0;
    margin: 0;
  }
</style>
