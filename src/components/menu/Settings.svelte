<div in:screenFly={{ show: true }} out:screenFly={{ show: false }}>
  <ul>
    {#each visuals as visual, v}
      <li on:mouseover={() => onListItemHover(v)}
          on:mouseout={() => selected = -1}
          class:disabled={!visual.enabled}
          on:keydown={() => onClick()}
          on:click={onListItemClick}
          on:focus
          on:blur
      >
        <h5 class:active={selected === v}>
          {visual.name}
        </h5>

        {#if typeof visual.value === 'number'}
          <Range
            on:update={onRangeUpdate}
            active={selected === v}
            max={MAX_CLOUDS + 99}
            value={visual.value}
            offset={99}
            min={99}
          />

        {:else}
          <Checkbox
            active={selected === v}
            checked={visual.value}
          />
        {/if}
      </li>
    {/each}

    <li class="reset">
      <h5>Reset To:</h5>

      <dl>
        <h5 on:mouseover={() => onListItemHover(Quality.LOW)}
            class:active={selected === Quality.LOW}
            on:mouseout={() => selected = -1}
            on:keydown={onResetClick}
            on:click={onResetClick}
            on:focus
            on:blur
        >
          {Quality[Quality.LOW]}
        </h5>

        <h5 on:mouseover={() => onListItemHover(Quality.MEDIUM)}
            class:active={selected === Quality.MEDIUM}
            on:mouseout={() => selected = -1}
            on:keydown={onResetClick}
            on:click={onResetClick}
            on:focus
            on:blur
        >
          {Quality[Quality.MEDIUM]}
        </h5>

        <h5 on:mouseover={() => onListItemHover(Quality.HIGH)}
            class:active={selected === Quality.HIGH}
            on:mouseout={() => selected = -1}
            on:keydown={onResetClick}
            on:click={onResetClick}
            on:focus
            on:blur
        >
          {Quality[Quality.HIGH]}
        </h5>
      </dl>
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
  import { getOptionDependencies, updateVisuals, resetVisuals } from '@/settings/utils';
  import type { VisualSettings, VisualKeys, VisualValues } from '@/settings/types';

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { Quality, MAX_CLOUDS } from '@/settings/constants';
  import { getKey, screenFly } from '@components/menu/utils';
  import { Checkbox, Range } from '@components/common';

  import Sounds from '@components/menu/Sounds';
  import Settings from '@/settings';

  const dispatch = createEventDispatcher();

  let parseVisualData: () => void;
  let visuals: VisualSettings;

  let selected: number;
  let reseted = false;
  let back: number;

  (parseVisualData = () => {
    visuals = Array.from(Settings.getVisualValues()).map(([ key, value ]) => ({
      name: (key as string).replace(/[A-Z]/g, char => ` ${char}`),
      enabled: true, key, value
    }));

    const backIndex = Object.keys(Quality).length * 0.5;
    selected = back = visuals.length + backIndex;

    updateVisualData();
  })();

  function updateVisualData (key?: VisualKeys, value?: VisualValues): void {
    if (!key && !value) return visuals.forEach(({ key, value }) =>
      updateOptionDependencies(key, value)
    );

    updateOptionDependencies(key as VisualKeys, value as VisualValues);
  }

  function updateOptionDependencies (key: VisualKeys, value: VisualValues): void {
    const dependencies = getOptionDependencies(key);
    if (!dependencies) return;

    dependencies.forEach(key => {
      const dependency = visuals.find(visual => visual.key === key);
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

    if (visuals[key] && !visuals[key].enabled) {
      const direction = +(event.code === 'ArrowDown');
      return onKeyDown(event, key + direction * 2 - 1);
    }

    if (key === -1) return onClick();

    Sounds.onHover();
    selected = key;
  }

  function resetIndex (): boolean {
    switch (selected) {
      case Quality.LOW:
      case Quality.MEDIUM:
      case Quality.HIGH:
        return true;

      default:
        return false;
    }
  }

  function onResetClick (): void {
    Sounds.onClick();
    reseted = resetVisuals(visuals, selected);
    reseted && setTimeout(parseVisualData, 100);
  }

  function onBackClick (): void {
    const update = updateVisuals(visuals);
    dispatch('menu', update || reseted);
    Sounds.onClick();
  }

  function onClick (toggle = true): void {
    if (resetIndex()) return onResetClick();
    if (selected === back) return onBackClick();

    const { key, value } = visuals[selected];

    if (typeof value === 'number') {
      const extreme = value ? 0 : MAX_CLOUDS;
      const detail = toggle ? extreme : value;
      onRangeUpdate({ detail } as CustomEvent);
    }

    else visuals[selected].value = !value;

    updateVisualData(key, visuals[selected].value);
    Sounds.onClick();
  }

  function onRangeUpdate (event: CustomEvent): void {
    visuals[selected].value = event.detail;
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

    &.reset {
      margin-top: 1.75em;

      dl {
        justify-content: space-between;
        display: inline-flex;
        max-width: 280px;

        width: 60%;
        margin: 0;

        h5 {
          pointer-events: all;
        }
      }
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
