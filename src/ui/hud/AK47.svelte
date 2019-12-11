<div class="rifle">
  {#if visible}
    <img src="assets/AK47.png" alt="AK-47" in:enter out:leave />

    <div class="ammo" transition:fade="{{ duration: 300, delay: 150 }}">
      <span>{ magazine } / { ammo }</span>
    </div>
  {/if}
</div>

<script>
  import { quartIn, quartOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import Events from '@/managers/Events';

  Events.add('reload', onReload);

  export let visible;
  let magazine = 0;
  let ammo = 0;

  function enter (node, params) {
    return {
			duration: 750,
			easing: quartOut,

      css: (t, u) => {
        const s = 0.5 + t * 0.5;
        const y = u * -6;

        return `
          transform: scale(${s}) translateY(${y}vw);
          opacity: ${t.toFixed(2)};
        `;
      }
		};
  }

  function leave (node, params) {
    return {
      duration: 500,
      easing: quartIn,

      css: (t, u) => {
        const s = 0.5 + t * 0.5;
        const y = u * 6;

        return `
          transform: scale(${s}) translateY(${y}vw);
          opacity: ${t.toFixed(2)};
        `;
      }
    };
  }

  function onReload (event) {
    magazine = event.data.magazine;
    ammo = event.data.ammo;
  }
</script>

<style>
.rifle {
  transform: translateY(-100%);
  position: relative;

  height: 100%;
  width: 100%;
}

img {
  backface-visibility: hidden;
  transform-origin: 50% 50%;

  position: absolute;
  margin: 5vw auto 0;

  display: block;
  width: 56.3%;

  right: 0;
  left: 0;
}

.ammo {
  backface-visibility: hidden;
  text-align: center;
  position: absolute;

  display: block;
  bottom: 2.5vw;
  width: 100%;
}

span {
  font-size: 20px;
  line-height: 0;
}

@media only screen and (max-width: 1400px) {
  span {
    font-size: 18px;
  }
}

@media only screen and (max-width: 1200px) {
  span {
    font-size: 16px;
  }
}
</style>
