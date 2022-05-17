import { smoothstep, near, mix, map, randomInt, clamp, random, easeOutSine, lerp, DELTA_FRAME, PI } from '@/utils/Number';
import { Vector3 } from 'three/src/math/Vector3';

describe('Number', () => {
  test('smoothstep', () => {
    expect(smoothstep(0, 1, 0)).toStrictEqual(0);
    expect(smoothstep(0, 1, 0.5)).toStrictEqual(0.5);
    expect(smoothstep(0, 1, 2)).toStrictEqual(1);
  });

  test('near', () => {
    const p = new Vector3(0, 0, 0);
    const c = new Vector3(1, 0, 1);

    expect(near(p, c)).toStrictEqual(false);
    expect(near(p, c, 2)).toStrictEqual(true);
    expect(near(c, p)).toStrictEqual(false);
  });

  test('mix', () => {
    expect(mix(1, 2, 1)).toStrictEqual(2);
    expect(mix(1, 2, 0.5)).toStrictEqual(1.5);
    expect(mix(1, 2, 2)).toStrictEqual(3);
  });

  test('map', () => {
    expect(map(0, 1, 2)).toStrictEqual(1);
    expect(map(1.5, 1, 2)).toStrictEqual(1);
    expect(map(3, 1, 2)).toStrictEqual(2);
  });

  test('randomInt', () => {
    const int = randomInt(50, 100);
    expect(int).toBeLessThanOrEqual(100);
    expect(int).toBeGreaterThanOrEqual(50);
    expect(randomInt(1, 1)).toStrictEqual(1);
  });

  test('clamp', () => {
    expect(clamp(0.5)).toStrictEqual(0.5);
    expect(clamp(0, 1, 2)).toStrictEqual(1);
    expect(clamp(3, 1, 2)).toStrictEqual(2);
  });

  test('random', () => {
    const rand = random(1, 2);
    expect(rand).toBeLessThan(2);
    expect(rand).toBeGreaterThan(1);
    expect(random(0, 0.5)).toBeLessThan(0.5);
  });

  test('easeOutSine', () => {
    expect(easeOutSine(0)).toStrictEqual(0);
    expect(easeOutSine(0.25)).toBeCloseTo(0.38);
    expect(easeOutSine(0.5)).toBeCloseTo(0.707);
    expect(easeOutSine(0.75)).toBeCloseTo(0.92);
    expect(easeOutSine(1)).toStrictEqual(1);
  });

  test('lerp', () => {
    expect(lerp(1, 2, 0)).toStrictEqual(1);
    expect(lerp(1, 2, 0.5)).toStrictEqual(1.5);
    expect(lerp(1, 2, 1)).toStrictEqual(2);
  });

  test('DELTA_FRAME', () => {
    expect(DELTA_FRAME).toStrictEqual(1 / 60);
  });

  test('PI', () => {
    expect(PI.m2).toStrictEqual(Math.PI * 2);
    expect(PI.d2).toStrictEqual(Math.PI / 2);
    expect(Object.isFrozen(PI)).toStrictEqual(true);
  });
});
