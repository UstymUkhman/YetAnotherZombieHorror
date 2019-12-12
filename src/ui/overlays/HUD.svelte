<div class="head-up-display" class:visible={visible}>
  <AimSight />
</div>

<div class="player-info">
  <HealthBar />

  <div class="weapon">
    <Pistol visible={!hasRifle} />
    <AK47 visible={hasRifle} />
  </div>
</div>

<script>
  import HealthBar from '@/ui/hud/HealthBar';
  import AimSight from '@/ui/hud/AimSight';
  import Events from '@/managers/Events';

  import Pistol from '@/ui/hud/Pistol';
  import { onDestroy } from 'svelte';
  import AK47 from '@/ui/hud/AK47';

  Events.add('change', changeWeapon);

  let hasRifle = false;
  export let visible;

  function changeWeapon (event) {
    hasRifle = event.data;
  }

  onDestroy(() => {
    Events.remove('change');
  });
</script>

<style>
.head-up-display {
  transition: opacity 100ms;
  pointer-events: none;
  position: absolute;
  display: block;
  opacity: 0;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

.head-up-display.visible {
  transition: opacity 250ms 250ms;
  opacity: 1;
}

.player-info {
  width: 16.667vw;
  height: 12vw;

  position: fixed;
  display: block;

  bottom: 3vw;
  right: 5vw;
}

.weapon {
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  top: 0;
}
</style>
