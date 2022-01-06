<div in:fade={{ delay: 500 }} out:fade></div>

<script lang="ts">
  import { fade } from 'svelte/transition';
</script>

<style lang="scss">
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  div {
    @include mixin.center-size;
    background-color: var.$black;

    z-index: 1;
    padding: 0;
  }
</style>
