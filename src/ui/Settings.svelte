<div on:click={() => { visibleModes = false }} class="settings-overlay">
  <div class="settings">
    <GameMode
      settings={settings}
      bind:visible={visibleModes}

      on:setMode={(event) => {
        settings.mode = event.detail
      }}
    />

    <div on:click={() => { dispatch('ready') }} class="start">
      <span>Ready!</span>
    </div>
  </div>
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  import GameMode from '@/ui/settings/GameMode';
  const dispatch = createEventDispatcher();

  let visibleModes = false;

  const settings = {
    gamepad: false,
    mode: 1
  };
</script>

<style>
.settings-overlay {
  background-color: rgba(0, 0, 0, 0.75);
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

.settings {
  transform: translate(-50%, -50%);
  position: absolute;

  margin: auto;
  width: 100px;

  left: 50%;
  top: 50%;
}

.start {
  transition: background-color 0.5s, color 0.5s;
  border: 1px solid #ffffff;
  background-color: #000000;

  backface-visibility: hidden;
  text-transform: uppercase;

  text-align: center;
  position: relative;
  line-height: 35px;
  margin-top: 100px;

  color: #ffffff;
  font-size: 20px;
  cursor: pointer;

  height: 35px;
  width: 100px;
}

.start:hover {
  background-color: #ffffff;
  color: #000000;
}
</style>
