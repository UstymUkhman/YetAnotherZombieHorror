import Visuals from '@/settings/visuals.json';

export const MAX_CLOUDS = 300.0;
export const DEFAULT_QUALITY = 0.0;

export const DefaultVisuals = Visuals[DEFAULT_QUALITY];
const { length } = Object.keys(DefaultVisuals);
export const VISUALS_LENGTH = length;

export enum Quality {
  LOW    = VISUALS_LENGTH + 0.0,
  MEDIUM = VISUALS_LENGTH + 1.0,
  HIGH   = VISUALS_LENGTH + 2.0
}
