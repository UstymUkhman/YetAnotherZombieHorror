import { randomInt } from '@/utils/Number';
import type { LevelBounds } from '@/scenes/types';

export function fisherYates<T>(a: T[], c = a.length, r = 0): void {
  while (c) {
    r = (Math.random() * c--) | 0;
    [a[c], a[r]] = [a[r], a[c]];
  }
}

export function cloneBounds (bounds: LevelBounds): LevelBounds {
  return JSON.parse(JSON.stringify(bounds));
}

export function min (a: Array<number>): number {
  let l = a.length, m = Infinity;
  while (l--) if (a[l] < m) m = a[l];
  return m;
}

export function max (a: Array<number>): number {
  let l = a.length, m = -Infinity;
  while (l--) if (a[l] > m) m = a[l];
  return m;
}

export function durstenfeld<T>(a: T[]): void {
  for (let c = a.length; c--; ) {
    const r = Math.floor(Math.random() * (c + 1));
    [a[c], a[r]] = [a[r], a[c]];
  }
}

export function shuffle<T>(a: T[]): T[] {
  return a.sort(() => Math.random() - 0.5);
}

export function random<T>(a: T[]): T {
  return a[randomInt(0, a.length - 1)];
}
