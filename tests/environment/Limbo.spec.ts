import Limbo from '@/environment/Limbo';
import LimboData from '@/config/limbo.json';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Object3D } from 'three/src/core/Object3D';

describe('Limbo', () => {
  const level = new Limbo();

  test('Create', () => {
    expect(Limbo).toBeDefined();
    expect(level).toBeInstanceOf(Limbo);
  });

  test('createCascadedShadowMaps', () => {
    const levelMock = { traverse: () => void 0 };
    const limboPrototype = Object.getPrototypeOf(level);
    const createCascadedShadowMaps = jest.fn(limboPrototype.createCascadedShadowMaps.bind(level));

    createCascadedShadowMaps(levelMock);
    expect(createCascadedShadowMaps).toHaveReturnedWith(undefined);
  });

  test('resize', () => {
    const limboPrototype = Object.getPrototypeOf(level);
    const resize = jest.fn(limboPrototype.resize.bind(level));

    resize();
    expect(resize).toHaveReturnedWith(undefined);
  });

  test('createColliders', () => {
    const createColliders = jest.fn(level.createColliders.bind(level));
    createColliders();
    expect(createColliders).toHaveReturnedWith(undefined);
  });

  test('outOfBounds', () => {
    const outOfBounds = jest.fn(level.outOfBounds.bind(level));
    outOfBounds(new Vector3());
    expect(outOfBounds).toHaveReturnedWith(null);
  });

  test('removeObject', () => {
    const removeObject = jest.fn(level.removeObject.bind(level));
    removeObject(new Object3D());
    expect(removeObject).toHaveReturnedWith(undefined);
  });

  test('addObject', () => {
    const addObject = jest.fn(level.addObject.bind(level));
    addObject(new Object3D());
    expect(addObject).toHaveReturnedWith(undefined);
  });

  test('render', () => {
    const render = jest.fn(level.render.bind(level));
    render(0);
    expect(render).toHaveReturnedWith(undefined);
  });

  test('destroy', () => {
    const destroy = jest.fn(level.destroy.bind(level));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });

  test('center', () => {
    const x = (94 + -59.5) / 2.0;
    const z = (53 + -144) / 2.0;

    expect(Limbo.center).toBeInstanceOf(Vector3);
    expect(Limbo.center.y).toStrictEqual(0.0);
    expect(Limbo.center.x).toStrictEqual(x);
    expect(Limbo.center.z).toStrictEqual(z);
  });

  test('minCoords', () => {
    expect(Limbo.minCoords[0]).toStrictEqual(-59.5);
    expect(Limbo.minCoords[1]).toStrictEqual(-144);
  });

  test('maxCoords', () => {
    expect(Limbo.maxCoords[0]).toStrictEqual(94);
    expect(Limbo.maxCoords[1]).toStrictEqual(53);
  });

  test('portals', () => {
    expect(Limbo.portals).toStrictEqual(LimboData.portals);
  });

  test('bounds', () => {
    expect(Limbo.bounds).toStrictEqual(LimboData.bounds);
  });

  test('size', () => {
    expect(Limbo.size.x).toStrictEqual(94 - -59.5);
    expect(Limbo.size.y).toStrictEqual(53 - -144);
    expect(Limbo.size).toBeInstanceOf(Vector2);
  });
});
