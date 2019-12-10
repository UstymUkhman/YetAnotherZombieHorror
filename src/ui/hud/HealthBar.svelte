<svg width="{size}" height="{size}" class="health-container">
  <circle
    style="stroke-dasharray: {size * 2} {size * 3}; stroke-dashoffset: {-circle};"
    cx="{size / 2}" cy="{size / 2}"
    r="{(size / 2.3).toFixed()}"
    stroke-width="{size / 16}"
    bind:this={healthBar}
    class:ready={ready}
    class="health-bar"
    stroke="{color}"
  />
</svg>

<script>
  import Events from '@/managers/Events';
  import { blend } from '@/utils/color';
  import { onDestroy } from 'svelte';
  import { onMount } from 'svelte';

  Events.add('hit', setHealth);

  let size = window.innerWidth / 6;
  let color = '#00CC00';
  let ready = false;
  let health = 0;

  let healthBar;
  let length;
  let circle;

  function setHealth (event) {
    const mix = event.data < 50 ? event.data / 50 : event.data / 200;
    const initialColor = event.data < 50 ? '#ffd700' : '#00CC00';
    const targetColor = event.data < 50 ? '#8a0707' : '#ffd700';

    circle = size + length / 100 * (100 - event.data);
    color = blend(targetColor, initialColor, mix);
    health = event.data;
  }

  function onResize (event) {
    size = window.innerWidth / 6;
    const radius = healthBar.r.baseVal.value;

    circle = +(radius * 2 * Math.PI).toFixed();
    length = circle - size;
  }

  onMount(() => {
    window.addEventListener('resize', onResize);
    onResize();

    setTimeout(() => {
      setHealth({ data: 100 });
      ready = true;
    }, 500);
	});

  onDestroy(() => {
    window.removeEventListener('resize', onResize);
    Events.remove('hit');
  });
</script>

<style>
.health-container {
  position: absolute;
  display: block;
  margin: auto;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}

.health-bar.ready {
  transition: stroke-dashoffset 0.5s ease-out;
}

.health-bar {
  transform-origin: 50% 50%;
  transform: rotate(24deg);
  fill: transparent;
}
</style>
