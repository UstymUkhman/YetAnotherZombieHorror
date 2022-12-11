import type SettingsData from '@/settings/performance.json';

type PerformanceValues = typeof SettingsData[PerformanceKeys];
type Performance = Map<PerformanceKeys, PerformanceValues>;

type PerformanceKeys = keyof typeof SettingsData;
type RequestSuccess = (db: IDBDatabase) => void;

type PerformanceSettings = Array<{
  value: PerformanceValues,
  key: PerformanceKeys,
  enabled: boolean,
  name: string
}>;
