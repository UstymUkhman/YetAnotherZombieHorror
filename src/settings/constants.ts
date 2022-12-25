import Performance from '@/settings/performance.json';

export const MAX_CLOUDS = 300.0;
export const DEFAULT_QUALITY = 0.0;

export const DefaultPerformance = Performance[DEFAULT_QUALITY];
const { length } = Object.keys(DefaultPerformance);
export const PERFORMANCE_LENGTH = length;

export enum Quality {
  LOW    = PERFORMANCE_LENGTH + 0.0,
  MEDIUM = PERFORMANCE_LENGTH + 1.0,
  HIGH   = PERFORMANCE_LENGTH + 2.0
}
