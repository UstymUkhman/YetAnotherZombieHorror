<div on:click|stopPropagation={ showGameModes } class="game-mode">
  <span class="mode selected">{ modes[settings.mode] }</span>

  <div class="options {visible ? 'visible' : ''}" style="transform: translateY(-{position}%);">
    {#each modes as mode, m}
      <span on:click|stopPropagation={() => { dispatch('setMode', m); visible = false; }} class="mode">{ mode }</span>
    {/each}
  </div>
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let settings;
  export let visible;

  function getOptionsPosition () {
    return !settings.mode ? '0' : settings.mode === 1 ? '33' : '67'
  }

  const modes = ['Easy', 'Normal', 'Hard'];
  let position = getOptionsPosition();

  function showGameModes (params) {
    position = getOptionsPosition();
    visible = true;
  }
</script>

<style>
.game-mode {
  position: relative;
  cursor: pointer;
  height: 35px;
}

.options {
  background-color: #000000;
  border: 1px solid #ffffff;

  backface-visibility: hidden;
  transition: opacity 0.5s;

  pointer-events: none;
  position: absolute;

  width: 100px;
  opacity: 0;
  top: 0;
}

.options.visible {
  pointer-events: all;
  opacity: 1;
}

.mode {
  transition: background-color 0.5s, color 0.5s;
  border-bottom: 1px solid #ffffff;
  background-color: #000000;

  backface-visibility: hidden;
  text-transform: uppercase;
  text-align: center;

  line-height: 35px;
  padding: 0 10px;

  color: #ffffff;
  display: block;
}

.mode:hover {
  background-color: #ffffff;
  color: #000000;
}

.mode.selected,
.mode:last-child {
  border-bottom: none;
}
</style>
