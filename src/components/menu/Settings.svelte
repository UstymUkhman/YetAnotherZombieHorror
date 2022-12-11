<div in:screenFly={{ show: true }} out:screenFly={{ show: false }}>
  <ul>
    {#each performance as variable, v}
      <li on:mouseover={() => onListItemHover(v)}
          class:disabled={!variable.enabled}
          on:mouseout={() => selected = -1}
          on:keydown={() => onClick()}
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
        on:keydown={onResetClick}
        on:click={onResetClick}
        on:focus
        on:blur
    >
      <h5 class:active={selected === reset}>Reset</h5>
    </li>

    <li on:mouseover={() => onListItemHover(back)}
        on:keydown={onBackClick}
        on:click={onBackClick}
        on:focus
    >
      <h4 class:active={selected === back}>Back</h4>
    </li>
  </ul>
</div>

<script lang="ts">
  import { getOptionDependencies, updatePerformance, resetPerformance, maxClouds } from '@/settings/utils';
  import type { PerformanceSettings, PerformanceKeys, PerformanceValues } from '@/settings/types';

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getKey, screenFly } from '@components/menu/utils';
  import { Checkbox, Range } from '@components/common';

  import Sounds from '@components/menu/Sounds';
  import Settings from '@/settings';

  const dispatch = createEventDispatcher();

  let parsePerformanceData: () => void;
  let performance: PerformanceSettings;

  let selected: number;
  let reseted = false;

  let reset: number;
  let back: number;

  (parsePerformanceData = () => {
    performance = Array.from(Settings.getPerformanceValues()).map(([ key, value ]) => ({
      name: key.replace(/[A-Z]/g, char => ` ${char}`),
      enabled: true, key, value
    }));

    selected = back = performance.length + 1;
    reset = performance.length;
    updatePerformanceData();
  })();

  function updatePerformanceData (key?: PerformanceKeys, value?: PerformanceValues): void {
    if (!key && !value) return performance.forEach(({ key, value }) =>
      updateOptionDependencies(key, value)
    );

    updateOptionDependencies(key as PerformanceKeys, value as PerformanceValues);
  }

  function updateOptionDependencies (key: PerformanceKeys, value: PerformanceValues): void {
    const dependencies = getOptionDependencies(key);
    if (!dependencies) return;

    dependencies.forEach(key => {
      const dependency = performance.find(variable => variable.key === key);
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

    if (performance[key] && !performance[key].enabled) {
      const direction = +(event.code === 'ArrowDown');
      return onKeyDown(event, key + direction * 2 - 1);
    }

    if (key === -1) return onClick();

    Sounds.onHover();
    selected = key;
  }

  function onResetClick (): void {
    Sounds.onClick();
    reseted = resetPerformance(performance);
    reseted && setTimeout(parsePerformanceData, 100);
  }

  function onBackClick (): void {
    const update = updatePerformance(performance);
    dispatch('menu', update || reseted);
    Sounds.onClick();
  }

  function onClick (toggle = true): void {
    if (selected === reset) return onResetClick();
    if (selected === back) return onBackClick();

    const { key, value } = performance[selected];

    if (typeof value === 'number') {
      const extreme = value ? 0 : maxClouds;
      const detail = toggle ? extreme : value;
      onRangeUpdate({ detail } as CustomEvent);
    }

    else {
      performance[selected].value = !value;
    }

    updatePerformanceData(key, performance[selected].value);
    Sounds.onClick();
  }

  function onRangeUpdate (event: CustomEvent): void {
    performance[selected].value = event.detail;
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
