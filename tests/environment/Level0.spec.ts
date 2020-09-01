declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Object3D } from '@three/core/Object3D';
import Level0Data from '@/settings/level0.json';
import Level0 from '@/environment/Level0';

describe('Level0', () => {
  const level = new Level0();

  test('Create', () => {
    expect(Level0).toBeDefined();
    expect(level).toBeInstanceOf(Level0);
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

  test('position', () => {
    expect(Level0.position.x).toStrictEqual(Level0Data.position[0]);
    expect(Level0.position.y).toStrictEqual(Level0Data.position[1]);
    expect(Level0.position.z).toStrictEqual(Level0Data.position[2]);
  });

  test('scale', () => {
    expect(Level0.scale.x).toStrictEqual(Level0Data.scale[0]);
    expect(Level0.scale.y).toStrictEqual(Level0Data.scale[1]);
    expect(Level0.scale.z).toStrictEqual(Level0Data.scale[2]);
  });

  test('height', () => {
    expect(Level0.height).toStrictEqual(Level0Data.height);
  });

  test('depth', () => {
    expect(Level0.depth).toStrictEqual(Level0Data.depth);
  });
});
