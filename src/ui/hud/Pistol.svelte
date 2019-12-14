<div class="pistol">
  {#if visible}
    <img src="assets/img/1911.png" alt="Pistol" in:enter out:leave />

    <div class="ammo" transition:fade="{{ duration: 300, delay: 150 }}">
      <span>∞</span>
    </div>
  {/if}
</div>

<script>
  import { quartIn, quartOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  export let visible;

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
</script>

<style>
.pistol {
  position: relative;
  height: 100%;
  width: 100%;
}

img {
  backface-visibility: hidden;
  transform-origin: 50% 50%;

  position: absolute;
  margin: 4vw auto 0;

  display: block;
  width: 42.5%;

  right: 0;
  left: 0;
}

.ammo {
  backface-visibility: hidden;
  position: absolute;

  display: block;
  margin: 0 auto;

  bottom: 3.5vw;
  left: 5vw;
}

span {
  line-height: 0;
  font-size: 3vw;
}
</style>
