import type SettingsData from '@/settings/environment.json';

type EnvironmentKeys = keyof typeof SettingsData;
type EnvironmentValues = typeof SettingsData[EnvironmentKeys];
type Environment = Record<EnvironmentKeys, EnvironmentValues>;
