import { ColliderMaterial, HitBoxMaterial, NoMaterial } from '@/utils/Material';

// declare const global: any;
// global.PRODUCTION = false;
// global.BUILD = '0.1.0';

// export const colliders = false;
// export const hitBoxes = false;

import { Settings } from '@/settings';
import { Color } from '@/utils/Color';

describe('Material', () => {
  test('ColliderMaterial', () => {
    expect(ColliderMaterial.visible).toStrictEqual(Settings.colliders);
    expect(ColliderMaterial.color).toStrictEqual(Color.GREY);
    expect(ColliderMaterial.transparent).toStrictEqual(true);
    expect(ColliderMaterial.opacity).toBeLessThan(1);
  });

  test('HitBoxMaterial', () => {
    expect(ColliderMaterial.visible).toStrictEqual(Settings.hitBoxes);
    expect(ColliderMaterial.transparent).toStrictEqual(true);
    expect(ColliderMaterial.color).toStrictEqual(Color.RED);
    expect(ColliderMaterial.opacity).toBeLessThan(1);
  });

  test('NoMaterial', () => {
    expect(ColliderMaterial.color).toStrictEqual(Color.BLACK);
    expect(ColliderMaterial.transparent).toStrictEqual(true);
    expect(ColliderMaterial.visible).toStrictEqual(false);
    expect(ColliderMaterial.opacity).toStrictEqual(0);
  });
});
