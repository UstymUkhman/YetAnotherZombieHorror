{#if firstDrawCall}
  <Aim hide={!aiming} />

  {#if location}
    <Map
      playerRotation={location.rotation}
      playerPosition={location.position}
      radius={mapRadius / zoomScale}
      scale={scale} zoom={zoomScale}
      on:rifle={updateRifleAngle}
    />

    {#if visibleRifle}
      <BorderRifle
        playerRotation={location.rotation}
        angle={rifleAngle}
      />
    {/if}
  {/if}
{/if}

<script lang="ts">
  import BorderRifle from '@components/map/BorderRifle.svelte';
  import type { PlayerLocation } from '@/characters/types';

  import { GameEvents } from '@/events/GameEvents';
  import { createEventDispatcher } from 'svelte';

  import Aim from '@components/HUD/Aim.svelte';
  import Map from '@components/map/Map.svelte';
  import { onMount, onDestroy } from 'svelte';

  import { Elastic } from '@/utils/Elastic';
  import Viewport from '@/utils/Viewport';

  import { PI } from '@/utils/Number';
  import RAF from '@/managers/RAF';

  type LocationEvent = {
    enemies: Array<unknown>,
    player: PlayerLocation
  };

  const scaleRatio = Math.tan(PI.d3) + Number.EPSILON;
  const scaleFactor = Math.round(scaleRatio * 100);

  const dispatch = createEventDispatcher();
  const radiusFactor = scaleFactor / 10.0;

  const zoom = new Elastic.Number(0);
  let location: PlayerLocation;

  let firstDrawCall = false;
  let visibleRifle = false;
  let rifleAngle: number;

  let zoomScale: number;
  let mapRadius: number;

  let aiming = true;
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

  function dispatchFirstDraw (): void {
    if (!location) return;
    dispatch('firstDraw');
    firstDrawCall = true;
  }

  GameEvents.add('Characters::Location', event => {
    !firstDrawCall && dispatchFirstDraw();
    location = (event.data as LocationEvent).player;
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
