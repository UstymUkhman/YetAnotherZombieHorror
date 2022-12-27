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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: (_ => playerRotation && updateBorderRotation())(angle);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: (_ => angle && updateBorderRotation())(playerRotation);
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;
  @import "@/animations";

  div.container {
    @include mixin.size(10vw);

    transform-origin: 50% 50%;
    border-radius: 50%;

    position: absolute;
    display: block;

    bottom: 2vw;
    right: 2vw;

    div.arc {
      @include mixin.size(2.25vw);

      animation: 1s var.$ease-out-sine infinite pulse;
      background-color: var.$white;

      backface-visibility: hidden;
      transform-origin: 50% 50%;

      border-radius: 50%;
      position: absolute;

      bottom: 8.875vw;
      right: 3.875vw;

      display: block;
      margin: auto;

      left: auto;
      top: auto;
    }
  }
</style>
