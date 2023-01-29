import { VISUALS_LENGTH } from '@/settings/constants';
import type { Quality } from '@/settings/constants';

import type {
  Visuals,
  VisualKeys,
  VisualData,
  VisualSettings
} from '@/settings/types';

import Settings from '@/settings';

const settings = new Settings();

const dependencies = new Map([
  ['bullet', ['bulletPath', 'bulletHoles']],
  ['raining', ['raindrops', 'softParticles']],
  ['fog', ['bakedFog', 'volumetricFog']],
  ['volumetricFog', ['bakedFog']],
  ['clouds', ['lighting', 'dynamicClouds']]
]);

const visualsNeedsUpdate = (visuals: VisualSettings, values: Visuals): VisualData | void => {
  const settings = visuals.reduce((visuals, visual) => ({
    ...visuals, [visual.key]: visual.value
  }), {}) as VisualData;

  for (const visual in settings) {
    const key = visual as VisualKeys;

    if (values.get(key) !== settings[key]) {
      return settings;
    }
  }
};

export const resetVisuals = (updated: VisualSettings, quality: Quality): boolean => {
  const qualityIndex = quality - VISUALS_LENGTH;

  const visualValues = Settings.getDefaultVisualValues(qualityIndex);
  const currentValues = visualsNeedsUpdate(updated, visualValues);

  currentValues && settings.resetVisualValues(qualityIndex);
  return !!currentValues;
};

export const getOptionDependencies = (key: VisualKeys): Array<string> | void => {
  const dependency = dependencies.get(key);
  if (dependency) return dependency;
};

export const updateVisuals = (updated: VisualSettings): boolean => {
  const visualValues = Settings.getVisualValues();
  const currentValues = visualsNeedsUpdate(updated, visualValues);

  currentValues && settings.updateVisualValues(currentValues);
  return !!currentValues;
};
