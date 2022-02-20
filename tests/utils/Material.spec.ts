import { DynamicCollider, StaticCollider, HitBox, Transparent } from '@/utils/Material';
import { Color as TColor } from 'three/src/math/Color';

import { Color } from '@/utils/Color';
import Configs from '@/configs';

describe('Material', () => {
  test('DynamicCollider', () => {
    expect(DynamicCollider.color).toStrictEqual(new TColor(Color.RED));
    expect(DynamicCollider.visible).toStrictEqual(Configs.colliders);
    expect(DynamicCollider.transparent).toStrictEqual(false);
    expect(DynamicCollider.wireframe).toStrictEqual(true);
  });

  test('StaticCollider', () => {
    expect(StaticCollider.color).toStrictEqual(new TColor(Color.RAIN));
    expect(StaticCollider.visible).toStrictEqual(Configs.colliders);
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
    expect(HitBox.visible).toStrictEqual(Configs.hitBoxes);
    expect(HitBox.transparent).toStrictEqual(true);
    expect(HitBox.opacity).toBeLessThan(1);
  });
});
