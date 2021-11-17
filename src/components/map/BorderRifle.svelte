<div class="container" style="transform: rotate({borderRotation}deg);">
  <div class="arc" />
</div>

<script lang="ts">
  export let playerRotation: number;
  let borderRotation: number;
  export let angle: number;

  function updateBorderRotation (): void {
    borderRotation = angle - playerRotation;
  }

  $: (angle => {
    if (!playerRotation) return;
    updateBorderRotation();
  })(angle);

  $: (playerRotation => {
    if (!angle) return;
    updateBorderRotation();
  })(playerRotation);
</script>

<style lang="scss">
@use "sass:math";
@use "@/variables" as var;

div.container {
  transform-origin: 50% 50%;
  border-radius: 50%;

  position: absolute;
  display: block;

  height: 10vw;
  width: 10vw;

  bottom: 2vw;
  right: 2vw;

  div.arc {
    animation: pulse 1s var.$ease-out-sine infinite;
    backface-visibility: hidden;

    background-color: var.$white;
    transform-origin: 50% 50%;

    border-radius: 50%;
    position: absolute;

    bottom: 8.875vw;
    right: 3.875vw;

    height: 2.25vw;
    width: 2.25vw;

    display: block;
    margin: auto;

    left: auto;
    top: auto;
  }
}

@keyframes pulse {
  0% {
    transform: scale(math.div(1, 3));
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
