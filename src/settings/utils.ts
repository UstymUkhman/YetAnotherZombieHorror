import type { Quality } from '@/settings/constants';

import type {
  Performance,
  PerformanceKeys,
  PerformanceData,
  PerformanceSettings
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

const performanceNeedsUpdate = (performance: PerformanceSettings, values: Performance): PerformanceData | void => {
  const settings = performance.reduce((performance, variable) => ({
    ...performance, [variable.key]: variable.value
  }), {}) as PerformanceData;

  for (const variable in settings) {
    const key = variable as PerformanceKeys;

    if (values.get(key) !== settings[key]) {
      return settings;
    }
  }
};

export const getOptionDependencies = (key: PerformanceKeys): Array<string> | void => {
  const dependency = dependencies.get(key);
  if (dependency) return dependency;
};

export const updatePerformance = (updated: PerformanceSettings): boolean => {
  const current = Settings.getPerformanceValues();
  const values = performanceNeedsUpdate(updated, current);

  values && settings.updatePerformanceValues(values);
  return !!values;
};

export const resetPerformance = (updated: PerformanceSettings, quality: Quality): boolean => {
  const initial = Settings.getDefaultPerformanceValues();
  const values = performanceNeedsUpdate(updated, initial);

  values && settings.resetPerformanceValues(quality);
  return !!values;
};
