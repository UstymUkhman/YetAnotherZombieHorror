import type { FlyParams, TransitionConfig } from 'svelte/transition';
import type EnvironmentData from '@/settings/environment.json';
import type { EnvironmentSettings } from '@/settings/types';

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

export const updateEnvironment = (environment: EnvironmentSettings): void => {
  settings.updateEnvironmentValues(environment.reduce((environment, variable) => ({
    ...environment, [variable.key]: variable.value
  }), {}) as typeof EnvironmentData);
};

export const resetEnvironment = (): void =>
  settings.resetEnvironmentValues();
