<div in:screenFly={{ show: true }} out:screenFly>
  <ul>
    {#each environment as variable, v}
      <li on:mouseover={() => onListItemHover(v)}
          class:disabled={!variable.enabled}
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

    <li on:mouseover={() => onListItemHover(reset)}
        on:mouseout={() => selected = -1}
        on:click={onResetClick}
        on:focus
        on:blur
    >
      <h5 class:active={selected === reset}>Reset</h5>
    </li>

    <li on:mouseover={() => onListItemHover(back)}
        on:click={onBackClick}
        on:focus
    >
      <h4 class:active={selected === back}>Back</h4>
    </li>
  </ul>
</div>

<script lang="ts">
  import type { EnvironmentSettings, EnvironmentKeys, EnvironmentValues } from '@/settings/types';
  import { getOptionDependencies, updateEnvironment, resetEnvironment } from '@/settings/utils';

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getKey, screenFly } from '@components/menu/utils';

  import { Checkbox, Range } from '@components/common/index';
  import EnvironmentData from '@/settings/environment.json';

  import Sounds from '@components/menu/Sounds';
  import Settings from '@/settings';

  const dispatch = createEventDispatcher();
  const maxClouds = EnvironmentData.clouds;

  let parseEnvironmentData: () => void;
  let environment: EnvironmentSettings;

  let selected: number;
  let reseted = false;

  let reset: number;
  let back: number;

  (parseEnvironmentData = () => {
    environment = Array.from(Settings.getEnvironmentValues()).map(([ key, value ]) => ({
      name: key.replace(/[A-Z]/g, char => ` ${char}`),
      enabled: true, key, value
    }));

    selected = back = environment.length + 1;
    reset = environment.length;
    updateEnvironmentData();
  })();

  function updateEnvironmentData (key?: EnvironmentKeys, value?: EnvironmentValues): void {
    if (!key && !value) return environment.forEach(({ key, value }) =>
      updateOptionDependencies(key, value)
    );

    updateOptionDependencies(key as EnvironmentKeys, value as EnvironmentValues);
  }

  function updateOptionDependencies (key: EnvironmentKeys, value: EnvironmentValues): void {
    const dependencies = getOptionDependencies(key);
    if (!dependencies) return;

    dependencies.forEach(key => {
      const dependency = environment.find(variable => variable.key === key);
      if (!dependency) return;

      if (!value) dependency.value = false;
      dependency.enabled = !!value;
    });
  }

  function onListItemHover (index: number): void {
    selected !== index && Sounds.onHover();
    selected = index;
  }

  function onListItemClick (event: MouseEvent): void {
    const target = event.target as HTMLElement;
    onClick(target.tagName === 'LI');
  }

  function onKeyDown (event: KeyboardEvent, index?: number): void {
    const key = index ?? getKey(event, selected, back + 1);

    if (environment[key] && !environment[key].enabled) {
      const direction = +(event.code === 'ArrowDown') * 2 - 1;
      return onKeyDown(event, key + direction);
    }

    if (key === -1) return onClick();

    Sounds.onHover();
    selected = key;
  }

  function onResetClick (): void {
    Sounds.onClick();
    reseted = resetEnvironment(environment);
    reseted && setTimeout(parseEnvironmentData, 100);
  }

  function onBackClick (): void {
    const update = updateEnvironment(environment);
    dispatch('menu', update || reseted);
    Sounds.onClick();
  }

  function onClick (toggle = true): void {
    if (selected === reset) return onResetClick();
    if (selected === back) return onBackClick();

    const { key, value } = environment[selected];

    if (typeof value === 'number') {
      const extreme = value ? 0 : maxClouds;
      const detail = toggle ? extreme : value;
      onRangeUpdate({ detail } as CustomEvent);
    }

    else {
      environment[selected].value = !value;
    }

    updateEnvironmentData(key, environment[selected].value);
    Sounds.onClick();
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
    transition: opacity 250ms;
    justify-content: space-between;

    h5 {
      letter-spacing: 0.1rem;
      line-height: 1rem;
      font-size: 1rem;
    }

    :global(input[type="checkbox"]) {
      pointer-events: none;
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
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
