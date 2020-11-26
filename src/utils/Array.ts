import type { Bounds } from '@/types.d';

export const cloneBounds = (bounds: Bounds): Bounds => JSON.parse(JSON.stringify(bounds));

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
