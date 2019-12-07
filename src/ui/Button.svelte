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
  background-color: #000000;
  backface-visibility: hidden;
  text-transform: uppercase;
  pointer-events: all;
  position: relative;

  padding: 3px 15px 0;
  text-align: center;
  min-height: 30px;
  cursor: pointer;

  height: auto;
  width: auto;
}

.button span {
  transition: color 0.5s;
  line-height: 1.2;
  margin-top: 4px;
  font-size: 1vw;
}

.button:hover span {
  color: #8a0707;
}
</style>
