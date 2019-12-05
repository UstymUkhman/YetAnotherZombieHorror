<div on:click|preventDefault|stopPropagation={() => { dispatch('click') }} class="button">
  <span>{ text }</span>
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let text;
</script>

<style>
.button {
  transition: background-color 0.5s, color 0.5s;
  border: 1px solid #ffffff;
  background-color: #000000;

  backface-visibility: hidden;
  text-transform: uppercase;
  pointer-events: all;

  text-align: center;
  position: relative;
  line-height: 35px;

  color: #ffffff;
  font-size: 20px;
  cursor: pointer;

  height: 35px;
  width: 100px;
}

.button:hover {
  background-color: #ffffff;
  color: #000000;
}
</style>
