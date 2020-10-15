declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { ColliderMaterial, HitBoxMaterial, NoMaterial } from '@/utils/Material';
import { Color as TColor } from '@three/math/Color';

import { Settings } from '@/settings';
import { Color } from '@/utils/Color';

describe('Material', () => {
  test('ColliderMaterial', () => {
    expect(ColliderMaterial.color).toStrictEqual(new TColor(Color.GREY));
    expect(ColliderMaterial.visible).toStrictEqual(Settings.colliders);
    expect(ColliderMaterial.transparent).toStrictEqual(true);
    expect(ColliderMaterial.opacity).toBeLessThan(1);
  });

  test('HitBoxMaterial', () => {
    expect(HitBoxMaterial.color).toStrictEqual(new TColor(Color.RED));
    expect(HitBoxMaterial.visible).toStrictEqual(Settings.hitBoxes);
    expect(HitBoxMaterial.transparent).toStrictEqual(true);
    expect(HitBoxMaterial.opacity).toBeLessThan(1);
  });

  test('NoMaterial', () => {
    expect(NoMaterial.color).toStrictEqual(new TColor(Color.BLACK));
    expect(NoMaterial.transparent).toStrictEqual(true);
    expect(NoMaterial.visible).toStrictEqual(false);
    expect(NoMaterial.opacity).toStrictEqual(0);
  });
});
