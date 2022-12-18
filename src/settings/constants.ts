import Performance from '@/settings/performance.json';

export const maxClouds = 300.0;
export const defaultQuality = 0.0;

const DefaultSettings = Performance[defaultQuality];
const size = Object.keys(DefaultSettings).length;

export default DefaultSettings;

export enum Quality {
  LOW = size,
  MEDIUM = size + 1,
  HIGH = size + 2
}
