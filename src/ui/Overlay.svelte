<div class="overlay" transition:fade="{{ duration: 250 }}">
  <div class="content">
    <slot />
  </div>
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  const dispatch = createEventDispatcher();
</script>

<style>
.overlay {
  position: absolute;
  display: block;

  height: 100%;
  width: 100%;

  padding: 0;
  margin: 0;

  left: 0;
  top: 0;
}

.content {
  background-color: rgba(0, 0, 0, 0.75);
  transform: translate(-50%, -50%);

  position: absolute;
  margin: auto;

  height: 45vw;
  width: 80vw;

  left: 50%;
  top: 50%;
}
</style>
