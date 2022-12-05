import type { Environment, EnvironmentSettings, EnvironmentKeys } from '@/settings/types';
import type EnvironmentData from '@/settings/environment.json';
import Settings from '@/settings';

const settings = new Settings();

const dependencies = new Map([
  ['bullet', ['bulletPath', 'bulletHoles']],
  ['raining', ['raindrops', 'softParticles']],
  ['fog', ['bakedFog', 'volumetricFog']],
  ['volumetricFog', ['bakedFog']],
  ['clouds', ['lighting', 'dynamicClouds']]
]);

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

export const getOptionDependencies = (key: EnvironmentKeys): Array<string> | void => {
  const dependency = dependencies.get(key);
  if (dependency) return dependency;
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
