import type SettingsData from '@/settings/environment.json';

type EnvironmentValues = typeof SettingsData[EnvironmentKeys];
type Environment = Map<EnvironmentKeys, EnvironmentValues>;

type EnvironmentKeys = keyof typeof SettingsData;
type RequestSuccess = (db: IDBDatabase) => void;

type EnvironmentSettings = Array<{
  value: EnvironmentValues,
  key: EnvironmentKeys,
  enabled: boolean,
  name: string
}>;
