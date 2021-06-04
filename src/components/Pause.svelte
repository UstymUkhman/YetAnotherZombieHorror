<div transition:fade>
  <Button text="Start" on:click={() => dispatch('start')} />
</div>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from '@components/Button.svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
@use '@/variables' as var;

div {
  background-color: var.$black;
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;

  :global(button) {
    position: absolute;
    display: block;
    margin: auto;

    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
  }
}
</style>
