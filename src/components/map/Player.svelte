<div style="transform: rotate({rotation}deg);" />

<script lang="ts">
  export let rotation: number;
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div {
    clip-path: polygon(50% 0, 100% 100%, 50% 75%, 0% 100%);
    @include mixin.center-size(1vw);

    background-color: var.$black;
    padding: 0;
  }
</style>
