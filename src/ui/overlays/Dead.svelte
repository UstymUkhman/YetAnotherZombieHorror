<div class="overlay" transition:fade="{{ duration: 1000, delay: 5000 }}">
  <h1>You Are Dead</h1>
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

h1 {
  transform: translate(-50%, -50%);
  position: absolute;

  display: block;
  margin: auto;

  left: 50%;
  top: 50%;
}
</style>
