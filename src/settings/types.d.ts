import type { DefaultPerformance } from '@/settings/constants';

type Performance = Map<PerformanceKeys, PerformanceValues>;
type PerformanceValues = PerformanceData[PerformanceKeys];

type RequestSuccess  = (db: IDBDatabase) => void;
type PerformanceData = typeof DefaultPerformance;
type PerformanceKeys = keyof PerformanceData;

type PerformanceSettings = Array<{
  value: PerformanceValues,
  key: PerformanceKeys,
  enabled: boolean,
  name: string
}>;
