<div class="aim-sight" class:expanded={expanded} class:hidden={hidden} transition:fade="{{ duration: 250 }}">
  <div class="line horizontal right"></div>
  <div class="line horizontal left"></div>

  <div class="line vertical bottom"></div>
  <div class="line vertical top"></div>
</div>

<script>
  import { fade } from 'svelte/transition';
  import Events from '@/managers/Events';
  import { onDestroy } from 'svelte';

  Events.add('run', event => hidden = event.data);

  Events.add('shoot', event => {
    setTimeout(() => { expanded = false; }, 100);
    expanded = event.data;
  });

  let expanded = false;
  let hidden = false;

  onDestroy(() => {
    Events.remove('shoot');
    Events.remove('run');
	});
</script>

<style>
.aim-sight {
  pointer-events: none;
  position: absolute;

  height: 3.125vw;
  width: 3.125vw;

  display: block;
  margin: auto;
  z-index: 1;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}

.line {
  transition: transform 0.1s ease-out, opacity 0.1s;
  transform: translate3d(0, 0, 0);
  background-color: white;

  position: absolute;
  display: block;
  margin: auto;
  opacity: 1;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}

.line.horizontal {
  height: 2px;
  width: 45%;
}

.line.vertical {
  height: 45%;
  width: 2px;
}

.line.bottom {
  bottom: 0;
  top: auto;
}

.line.right {
  left: auto;
  right: 0;
}

.line.left {
  right: auto;
  left: 0;
}

.line.top {
  bottom: auto;
  top: 0;
}

.aim-sight.expanded .line.bottom {
  transform: translate3d(0, 25%, 0);
}

.aim-sight.expanded .line.right {
  transform: translate3d(25%, 0, 0);
}

.aim-sight.expanded .line.left {
  transform: translate3d(-25%, 0, 0);
}

.aim-sight.expanded .line.top {
  transform: translate3d(0, -25%, 0);
}

.aim-sight.hidden .line.bottom {
  transform: translate3d(0, 50%, 0);
}

.aim-sight.hidden .line.right {
  transform: translate3d(50%, 0, 0);
}

.aim-sight.hidden .line.left {
  transform: translate3d(-50%, 0, 0);
}

.aim-sight.hidden .line.top {
  transform: translate3d(0, -50%, 0);
}

.aim-sight.hidden .line {
  transition-duration: 0.3s;
  opacity: 0;
}
</style>
