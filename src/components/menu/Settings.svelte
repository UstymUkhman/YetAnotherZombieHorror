<div in:screenFly={{ show: true }} out:screenFly>
  <ul>
    {#each environment as variable, v}
      <li on:mouseover={() => selected = v}
          on:mouseout={() => selected = -1}
          on:click={onListItemClick}
          on:focus
          on:blur
      >
        <h5 class:active={selected === v}>
          {variable.name}
        </h5>

        {#if typeof variable.value === 'number'}
          <Range
            on:update={onRangeUpdate}
            active={selected === v}
            value={variable.value}
            max={maxClouds + 99}
            offset={99}
            min={99}
          />

        {:else}
          <Checkbox
            checked={variable.value}
            active={selected === v}
          />
        {/if}
      </li>
    {/each}

    <li on:mouseover={() => selected = reset}
        on:mouseout={() => selected = -1}
        on:click={onResetClick}
        on:focus
        on:blur
    >
      <h5 class:active={selected === reset}>Reset</h5>
    </li>

    <li on:mouseover={() => selected = back}
        on:click={onBackClick}
        on:focus
    >
      <h4 class:active={selected === back}>Back</h4>
    </li>
  </ul>
</div>

<script lang="ts">
  import { getKey, screenFly, updateEnvironment, resetEnvironment } from './utils';
  import type { EnvironmentSettings } from '@/settings/types';
  import { Checkbox, Range } from '@components/common/index';
  import EnvironmentData from '@/settings/environment.json';

  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import Settings from '@/settings';

  const dispatch = createEventDispatcher();
  let environment = parseEnvironmentData();

  const maxClouds = EnvironmentData.clouds;
  const back = environment.length + 1;
  const reset = environment.length;

  let selected = back;
  let reseted = false;

  function parseEnvironmentData (): EnvironmentSettings {
    return Array.from(Settings.getEnvironmentValues()).map(([ key, value ]) => ({
      name: key.replace(/[A-Z]/g, char => ` ${char}`), key, value
    }));
  }

  function onListItemClick (event: MouseEvent): void {
    const target = event.target as HTMLElement;
    onClick(target.tagName === 'LI');
  }

  function onKeyDown (event: KeyboardEvent): void {
    const key = getKey(event, selected, back + 1);
    if (key === -1) onClick();
    else selected = key;
  }

  function onResetClick (): void {
    reseted = resetEnvironment(environment);

    reseted && setTimeout(() =>
      environment = parseEnvironmentData()
    , 100);
  }

  function onBackClick (): void {
    const update = updateEnvironment(environment);
    dispatch('menu', update || reseted);
  }

  function onClick (toggle = true): void {
    if (selected === reset) return onResetClick();
    if (selected === back) return onBackClick();

    const { value } = environment[selected];

    if (typeof value === 'number') {
      const extreme = value ? 0 : maxClouds;
      const detail = toggle ? extreme : value;
      onRangeUpdate({ detail } as CustomEvent);
    }

    else {
      environment[selected].value = !value;
    }
  }

  function onRangeUpdate (event: CustomEvent): void {
    environment[selected].value = event.detail;
  }

  onMount(() =>
    document.addEventListener('keydown', onKeyDown, true)
  );

  onDestroy(() =>
    document.removeEventListener('keydown', onKeyDown, true)
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

  li {
    display: flex;
    align-items: center;
    margin-bottom: 1.25em;
    justify-content: space-between;

    h5 {
      letter-spacing: 0.1rem;
      line-height: 1rem;
      font-size: 1rem;
    }

    :global(input[type=checkbox]) {
      pointer-events: none;
    }

    &:last-child {
      text-align: center;
      margin-bottom: 0;

      margin-top: 5%;
      display: block;

      h4 {
        @include mixin.font-size(3);
        text-decoration: underline;
        color: var.$grey;

        &.active {
          color: var.$white;
        }
      }
    }
  }
</style>
