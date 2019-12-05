<div class="head-up-display" class:visible={visible}>
  <AimSight />
</div>

<script>
  import AimSight from '@/ui/hud/AimSight';

  export let visible;
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
</style>
