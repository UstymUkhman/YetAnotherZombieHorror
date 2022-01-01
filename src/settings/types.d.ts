import type SettingsData from '@/settings/environment.json';

export type EnvironmentKeys = keyof typeof SettingsData;
type EnvironmentValues = typeof SettingsData[EnvironmentKeys];
export type Environment = Record<EnvironmentKeys, EnvironmentValues>;
