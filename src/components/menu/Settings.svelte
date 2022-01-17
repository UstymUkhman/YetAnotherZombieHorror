<div in:screenFly={{ show: true }} out:screenFly>
  <ul>
    {#each environment as value, v}
      <li on:mouseover={() => selected = v}
          on:click={onClick}
          on:focus
      >
        <h5 class:active="{selected === v}">
          {value.name}
        </h5>
      </li>
    {/each}

    <li on:mouseover={() => selected = reset}
        on:click={onResetClick}
        on:focus
    >
      <h5 class:active="{selected === reset}">Reset</h5>
    </li>

    <li on:mouseover={() => selected = back}
        on:click={onBackClick}
        on:focus
    >
      <h4 class:active="{selected === back}">Back</h4>
    </li>
  </ul>
</div>

<script lang="ts">
  import type { EnvironmentSettings } from '@/settings/types';
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { getKey, screenFly } from './utils';
  import Settings from '@/settings';

  const dispatch = createEventDispatcher();
  let environment = parseEnvironmentData();

  const back = environment.length + 1;
  const reset = environment.length;
  let selected = back;

  function parseEnvironmentData (): EnvironmentSettings {
    return Array.from(Settings.getEnvironmentValues()).map(([ key, value ]) => ({
      name: key.replace(/[A-Z]/g, char => ` ${char}`), key, value
    }));
  }

  function onKeyUp (event: KeyboardEvent): void {
    const key = getKey(event, selected, back + 1);
    if (key === -1) onClick();
    else selected = key;
  }

  function onResetClick (): void {
    setTimeout(() =>
      environment = parseEnvironmentData()
    , 100);

    dispatch('reset');
  }

  function onBackClick (): void {
    dispatch('menu');
  }

  function onClick (): void {
    if (selected === back) return dispatch('menu');
    console.log(selected, environment[selected]);
  }

  onMount(() =>
    document.addEventListener('keyup', onKeyUp, true)
  );

  onDestroy(() =>
    document.removeEventListener('keyup', onKeyUp, true)
  );
</script>

<style lang="scss">
  @use "./mixins" as menu;
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  div {
    @include mixin.center-size(50%, 100%);

    padding: 0;
    z-index: 1;
    left: auto;
  }

  ul {
    @include mixin.center-transform;
    @include menu.list(h4 h5);

    box-sizing: border-box;
    padding-inline: 10vw;

    height: 60%;
    width: 100%;
  }

  li:last-child {
    text-align: center;
    margin-top: 5%;

    h4 {
      @include mixin.font-size(3);
      text-decoration: underline;
      color: var.$grey;

      &.active {
        color: var.$white;
      }
    }
  }
</style>
