import type { Environment, EnvironmentKeys, EnvironmentSettings } from '@/settings/types';
import type { FlyParams, TransitionConfig } from 'svelte/transition';
import type EnvironmentData from '@/settings/environment.json';

import { quadIn, quadOut } from 'svelte/easing';
import { fade, fly } from 'svelte/transition';

import Viewport from '@/utils/Viewport';
import Settings from '@/settings';

type ScreenFade = ScreenFly & { menuFade?: boolean };
type ScreenFly = FlyParams & { show?: boolean };

const keys = ['ArrowUp', 'ArrowDown', 'Enter'];
const settings = new Settings();

const updateSelected = (key: string, selected: number, items: number): number =>
  Math.abs((items + selected + (+(key === 'ArrowDown') * 2 - 1)) % items);

export const screenFade = (node: Element, { show, menuFade }: ScreenFade): TransitionConfig =>
  (menuFade ? fade : fly)(node, {
    ...(!menuFade && { easing: show ? quadOut : quadIn }),
    delay: +!!(menuFade && show) * 250 + (+!!show * 250),
    x: Viewport.size.width * -0.5,
    duration: 250
  }
);

export const screenFly = (node: Element, { show }: ScreenFly): TransitionConfig =>
  fly(node, {
    easing: show ? quadOut : quadIn,
    x: Viewport.size.width * 0.5,
    delay: +!!show * 250,
    duration: 250
  }
);

export const getKey = (event: KeyboardEvent, selected: number, items: number): number => {
  event.stopPropagation();
  event.preventDefault();
  const key = event.key;

  if (!keys.includes(key)) return selected;
  else if (key === 'Enter') return -1;

  return updateSelected(key, selected, items);
};

const environmentNeedsUpdate = (environment: EnvironmentSettings, values: Environment): typeof EnvironmentData | void => {
  const settings = environment.reduce((environment, variable) => ({
    ...environment, [variable.key]: variable.value
  }), {}) as typeof EnvironmentData;

  for (const variable in settings) {
    const key = variable as EnvironmentKeys;

    if (values.get(key) !== settings[key]) {
      return settings;
    }
  }
};

export const updateEnvironment = (updated: EnvironmentSettings): boolean => {
  const current = Settings.getEnvironmentValues();
  const values = environmentNeedsUpdate(updated, current);

  values && settings.updateEnvironmentValues(values);
  return !!values;
};

export const resetEnvironment = (updated: EnvironmentSettings): boolean => {
  const initial = Settings.getDefaultEnvironmentValues();
  const values = environmentNeedsUpdate(updated, initial);

  values && settings.resetEnvironmentValues();
  return !!values;
};
