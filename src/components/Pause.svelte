<div transition:fade>
  <Button text="Continue" on:click={() => dispatch('continue')} />
</div>

<script lang="ts">
  import Button from '@components/common/Button.svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  @use "@/variables" as var;
  @use "@/mixins" as mixin;

  div {
    @include mixin.absolute-size;

    background-color: var.$black;
    display: block;

    z-index: 1;
    padding: 0;
    margin: 0;

    left: 0;
    top: 0;

    :global(button) {
      transform: translateX(-50%);
      position: absolute;

      display: block;
      margin: auto;

      bottom: 0;
      left: 50%;
      top: 0;
    }
  }
</style>
