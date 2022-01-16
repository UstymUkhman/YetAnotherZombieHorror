import type SettingsData from '@/settings/environment.json';

type EnvironmentKeys = keyof typeof SettingsData;
type EnvironmentValues = typeof SettingsData[EnvironmentKeys];
type Environment = Map<EnvironmentKeys, EnvironmentValues>;

type EnvironmentSettings = Array<{
  value: EnvironmentValues,
  key: EnvironmentKeys,
  name: string,
}>;
