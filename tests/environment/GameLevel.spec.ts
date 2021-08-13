import LevelData from '@/config/level.json';
import LevelScene from '@/environment/LevelScene';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Object3D } from 'three/src/core/Object3D';

describe('LevelScene', () => {
  const level = new LevelScene();

  test('Create', () => {
    expect(LevelScene).toBeDefined();
    expect(level).toBeInstanceOf(LevelScene);
  });

  test('createSkybox', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createSkybox = jest.fn(levelPrototype.createSkybox.bind(level, LevelData.skybox));

    createSkybox();
    expect(createSkybox).toHaveReturnedWith(undefined);
  });

  test('createLights', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createLights = jest.fn(levelPrototype.createLights.bind(level));

    createLights();
    expect(createLights).toHaveReturnedWith(undefined);
  });

  test('render', () => {
    const render = jest.fn(level.render.bind(level));
    render(0);
    expect(render).toHaveReturnedWith(undefined);
  });

  test('resize', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const resize = jest.fn(levelPrototype.resize.bind(level));

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

  test('destroy', () => {
    const destroy = jest.fn(level.destroy.bind(level));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });

  test('scenes', () => {
    expect(level.scenes.length).toBeGreaterThanOrEqual(1);
    expect(level.scenes[1].tagName).toBe('CANVAS');
  });

  test('maxCoords', () => {
    expect(LevelScene.maxCoords[0]).toStrictEqual(94);
    expect(LevelScene.maxCoords[1]).toStrictEqual(53);
  });

  test('minCoords', () => {
    expect(LevelScene.minCoords[0]).toStrictEqual(-59.5);
    expect(LevelScene.minCoords[1]).toStrictEqual(-144);
  });

  test('portals', () => {
    expect(LevelScene.portals).toStrictEqual(LevelData.portals);
  });

  test('center', () => {
    const x = (94 + -59.5) / 2.0;
    const z = (53 + -144) / 2.0;

    expect(LevelScene.center).toBeInstanceOf(Vector3);
    expect(LevelScene.center.y).toStrictEqual(0.0);
    expect(LevelScene.center.x).toStrictEqual(x);
    expect(LevelScene.center.z).toStrictEqual(z);
  });

  test('bounds', () => {
    expect(LevelScene.bounds).toStrictEqual(LevelData.bounds);
  });

  test('size', () => {
    expect(LevelScene.size.x).toStrictEqual(94 - -59.5);
    expect(LevelScene.size.y).toStrictEqual(53 - -144);
    expect(LevelScene.size).toBeInstanceOf(Vector2);
  });

  test('pause', () => {
    const pause = jest.fn(() => level.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });
});
