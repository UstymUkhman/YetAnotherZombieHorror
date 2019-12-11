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

  padding: 3px 15px 1px;
  pointer-events: all;
  position: relative;

  text-align: center;
  min-height: 30px;
  cursor: pointer;

  height: auto;
  width: auto;
}

span {
  transition: color 0.5s;
  line-height: 1.2;
  margin-top: 4px;
  font-size: 20px;
}

.button:hover span {
  color: #8a0707;
}

@media only screen and (max-width: 1400px) {
  span {
    font-size: 18px;
  }
}

@media only screen and (max-width: 1200px) {
  span {
    font-size: 16px;
  }
}
</style>
