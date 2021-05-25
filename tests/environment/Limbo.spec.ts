import '../globals';
import Limbo from '@/environment/Limbo';
import LimboData from '@/config/limbo.json';
import { Object3D } from 'three/src/core/Object3D';

describe('Limbo', () => {
  const level = new Limbo();

  test('Create', () => {
    expect(Limbo).toBeDefined();
    expect(level).toBeInstanceOf(Limbo);
  });

  test('createColliders', () => {
    const createColliders = jest.fn(level.createColliders.bind(level));
    createColliders();
    expect(createColliders).toHaveReturnedWith(undefined);
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
    render();
    expect(render).toHaveReturnedWith(undefined);
  });

  test('destroy', () => {
    const destroy = jest.fn(level.destroy.bind(level));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
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
});
