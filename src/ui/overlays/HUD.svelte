<div class="head-up-display" class:visible={visible}>
  <AimSight />
</div>

<div class="player-info">
  <HealthBar />

  <div class="weapon">
    <Pistol />
    <!-- <AK47 /> -->
  </div>
</div>

<script>
  import HealthBar from '@/ui/hud/HealthBar';
  import AimSight from '@/ui/hud/AimSight';

  import Pistol from '@/ui/hud/Pistol';
  // import AK47 from '@/ui/hud/AK47';

  export let visible;

  // ∞
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
  height: 16.667vw;
  width: 16.667vw;

  position: fixed;
  display: block;

  bottom: 2vw;
  right: 3vw;
}

.weapon {
  position: absolute;
  display: block;
}
</style>
