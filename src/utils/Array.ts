import type { LevelBounds } from '@/scenes/types';

export const cloneBounds = (bounds: LevelBounds): LevelBounds =>
  JSON.parse(JSON.stringify(bounds));

export const min = (a: Array<number>): number => {
  let l = a.length, m = Infinity;
  while (l--) if (a[l] < m) m = a[l];
  return m;
};

export const max = (a: Array<number>): number => {
  let l = a.length, m = -Infinity;
  while (l--) if (a[l] > m) m = a[l];
  return m;
};
