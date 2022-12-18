import SettingsData from '@/settings/performance.json';

type PerformanceValues = typeof SettingsData[PerformanceKeys];
type Performance = Map<PerformanceKeys, PerformanceValues>;

type PerformanceKeys = keyof typeof SettingsData;
type RequestSuccess = (db: IDBDatabase) => void;

const size = Object.keys(SettingsData).length;

type PerformanceSettings = Array<{
  value: PerformanceValues,
  key: PerformanceKeys,
  enabled: boolean,
  name: string
}>;

export enum Quality {
  LOW = size,
  MEDIUM = size + 1,
  HIGH = size + 2
}
