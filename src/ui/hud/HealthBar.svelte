<svg width="{size}" height="{size}">
  <circle
    style="stroke-dasharray: {length} {size * 3}; stroke-dashoffset: {circle};"
    cx="{size / 2}" cy="{size / 2}"
    r="{(size / 2.3).toFixed()}"
    stroke-width="{size / 16}"
    bind:this={healthBar}
    class:ready={ready}
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
  let color = '#007000';
  let ready = false;
  let health = 0;

  let healthBar;
  let length;
  let circle;

  function setHealth (event) {
    const mix = event.data === 100 ? 100 : event.data < 50 ? 50 : 200;
    const initialColor = event.data < 50 ? '#f3b800' : '#007000';
    const targetColor = event.data < 50 ? '#8a0707' : '#f3b800';

    color = blend(targetColor, initialColor, event.data / mix);
    circle = length / 100 * (100 - event.data);
    health = event.data;
  }

  function onResize (event) {
    size = window.innerWidth / 6;
    const radius = healthBar.r.baseVal.value;

    length = size * 1.3625;
    ready = false;
    circle = 0;

    if (event) {
      setTimeout(() => { ready = true; }, 100);
      setHealth({ data: health });
    }
  }

  onMount(() => {
    window.addEventListener('resize', onResize);
    onResize();
    setHealth({ data: 0 });

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
svg {
  transform-origin: 50% 50%;
  transform: rotate(90deg);

  position: relative;
  display: block;
  margin: auto;

  height: auto;
  width: 100%;

  bottom: 2vw;
  top: auto;
}

circle.ready {
  transition: stroke-dashoffset 0.5s ease-out;
}

circle {
  transform-origin: 50% 50%;
  position: absolute;
  fill: transparent;

  display: block;
  margin: auto;
}
</style>
