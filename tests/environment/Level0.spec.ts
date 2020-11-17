import '../globals';
import Level0 from '@/environment/Level0';
import Level0Data from '@/config/level0.json';
import { Object3D } from '@three/core/Object3D';

describe('Level0', () => {
  const level = new Level0();

  test('Create', () => {
    expect(Level0).toBeDefined();
    expect(level).toBeInstanceOf(Level0);
  });

  test('createColliders', () => {
    const createColliders = jest.fn(level.createColliders.bind(level));
    createColliders();
    expect(createColliders).toHaveReturnedWith(undefined);
  });

  test('addObject', () => {
    const addObject = jest.fn(level.addObject.bind(level));
    addObject(new Object3D());
    expect(addObject).toHaveReturnedWith(undefined);
  });

  test('render', () => {
    const render = jest.fn(level.render.bind(level));
    render();
    expect(render).toHaveReturnedWith(undefined);
  });

  test('destroy', () => {
    const destroy = jest.fn(level.destroy.bind(level));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });

  test('minCoords', () => {
    expect(Level0.minCoords[0]).toStrictEqual(-39.5);
    expect(Level0.minCoords[1]).toStrictEqual(-53);
  });

  test('maxCoords', () => {
    expect(Level0.maxCoords[0]).toStrictEqual(64);
    expect(Level0.maxCoords[1]).toStrictEqual(53);
  });

  test('bounds', () => {
    expect(Level0.bounds).toStrictEqual(Level0Data.bounds);
  });
});
