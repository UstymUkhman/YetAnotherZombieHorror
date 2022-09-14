import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { Color as TColor } from 'three/src/math/Color';
import { Material } from '@/utils/Material';
import { Color } from '@/utils/Color';

describe('Material', () => {
  test('Ground', () => {
    const material = new Material.Ground({ color: Color.WHITE });
    const onBeforeCompile = jest.fn(material.onBeforeCompile.bind(material));

    expect(material instanceof MeshPhongMaterial).toStrictEqual(true);
    expect(material.color).toStrictEqual(new TColor(Color.WHITE));

    onBeforeCompile({
      fragmentShader: '#include <output_fragment>',
      vertexShader: 'void main() {',
      uniforms: {}
    });

    expect(onBeforeCompile).toHaveReturnedWith(undefined);
    expect(material.needsUpdate).toStrictEqual(undefined);

    expect(material.transparent).toStrictEqual(false);
    expect(material.wireframe).toStrictEqual(false);
    expect(material.visible).toStrictEqual(true);
  });

  test('DynamicCollider', () => {
    expect(Material.DynamicCollider.color).toStrictEqual(new TColor(Color.RED));
    expect(Material.DynamicCollider.transparent).toStrictEqual(false);
    expect(Material.DynamicCollider.wireframe).toStrictEqual(true);
    expect(Material.DynamicCollider.visible).toStrictEqual(false);
  });

  test('StaticCollider', () => {
    expect(Material.StaticCollider.color).toStrictEqual(new TColor(Color.RAIN));
    expect(Material.StaticCollider.transparent).toStrictEqual(true);
    expect(Material.StaticCollider.visible).toStrictEqual(false);
    expect(Material.StaticCollider.opacity).toBeLessThan(1);
  });

  test('Transparent', () => {
    expect(Material.Transparent.color).toStrictEqual(new TColor(Color.BLACK));
    expect(Material.Transparent.transparent).toStrictEqual(true);
    expect(Material.Transparent.visible).toStrictEqual(false);
    expect(Material.Transparent.opacity).toStrictEqual(0);
  });

  test('HitBox', () => {
    expect(Material.HitBox.color).toStrictEqual(new TColor(Color.RED));
    expect(Material.HitBox.transparent).toStrictEqual(true);
    expect(Material.HitBox.visible).toStrictEqual(false);
    expect(Material.HitBox.opacity).toBeLessThan(1);
  });
});
