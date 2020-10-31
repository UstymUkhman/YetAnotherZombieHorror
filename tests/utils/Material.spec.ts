declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { DynamicCollider, StaticCollider, HitBox, Transparent } from '@/utils/Material';
import { Color as TColor } from '@three/math/Color';

import { Color } from '@/utils/Color';
import { Config } from '@/config';

describe('Material', () => {
  test('DynamicCollider', () => {
    expect(DynamicCollider.color).toStrictEqual(new TColor(Color.RED));
    expect(DynamicCollider.visible).toStrictEqual(Config.colliders);
    expect(DynamicCollider.transparent).toStrictEqual(false);
    expect(DynamicCollider.wireframe).toStrictEqual(true);
  });

  test('StaticCollider', () => {
    expect(StaticCollider.color).toStrictEqual(new TColor(Color.GREY));
    expect(StaticCollider.visible).toStrictEqual(Config.colliders);
    expect(StaticCollider.transparent).toStrictEqual(true);
    expect(StaticCollider.opacity).toBeLessThan(1);
  });

  test('Transparent', () => {
    expect(Transparent.color).toStrictEqual(new TColor(Color.BLACK));
    expect(Transparent.transparent).toStrictEqual(true);
    expect(Transparent.visible).toStrictEqual(false);
    expect(Transparent.opacity).toStrictEqual(0);
  });

  test('HitBox', () => {
    expect(HitBox.color).toStrictEqual(new TColor(Color.RED));
    expect(HitBox.visible).toStrictEqual(Config.hitBoxes);
    expect(HitBox.transparent).toStrictEqual(true);
    expect(HitBox.opacity).toBeLessThan(1);
  });
});
