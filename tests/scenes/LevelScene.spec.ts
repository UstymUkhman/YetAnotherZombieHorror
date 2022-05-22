import { Texture } from 'three/src/textures/Texture';
import type { GameEvent } from '@/events/GameEvents';

import { Object3D } from 'three/src/core/Object3D';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';

import LevelScene from '@/scenes/LevelScene';
import LevelData from '@/configs/level.json';
import Configs from '@/configs';

describe('LevelScene', () => {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  const level = new LevelScene(canvas as HTMLCanvasElement, 1);

  test('Create', () => {
    expect(LevelScene).toBeDefined();
    expect(level).toBeInstanceOf(LevelScene);
  });

  test('createColliders', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createColliders = jest.fn(levelPrototype.createColliders.bind(level));

    createColliders();
    expect(createColliders).toHaveReturnedWith(undefined);
  });

  test('createEnvironment', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createEnvironment = jest.fn(levelPrototype.createEnvironment.bind(level));

    const environment = createEnvironment();
    expect(environment).toBeInstanceOf(Object);
  });

  test('loadLevel', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const loadLevel = jest.fn(levelPrototype.loadLevel.bind(level, Configs.Level.model));

    const levelModel = loadLevel(Configs.Level.model);
    expect(levelModel).toBeInstanceOf(Object);
  });

  test('createSkybox', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createSkybox = jest.fn(levelPrototype.createSkybox.bind(level, LevelData.skybox));

    const skybox = createSkybox();
    expect(skybox).toBeInstanceOf(Object);
  });

  test('createLights', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createLights = jest.fn(levelPrototype.createLights.bind(level));

    createLights();
    expect(createLights).toHaveReturnedWith(undefined);
  });

  test('getSceneEnvMap', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const getSceneEnvMap = jest.fn(levelPrototype.getSceneEnvMap.bind(level));

    const envMap = getSceneEnvMap();
    expect(envMap).toBeInstanceOf(Texture);
  });

  test('createRenderer', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const createRenderer = jest.fn(levelPrototype.createRenderer.bind(level, 1.0));

    createRenderer(1.0);
    expect(createRenderer).toHaveReturnedWith(undefined);
  });

  test('removeGameObject', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const removeGameObject = jest.fn(levelPrototype.removeGameObject.bind(level));

    removeGameObject({ data: new Object3D() } as GameEvent);
    expect(removeGameObject).toHaveReturnedWith(undefined);
  });

  test('addGameObject', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const addGameObject = jest.fn(levelPrototype.addGameObject.bind(level));

    addGameObject({ data: new Object3D() } as GameEvent);
    expect(addGameObject).toHaveReturnedWith(undefined);
  });

  test('resize', () => {
    const resize = jest.fn(level.resize.bind(level));

    resize(1920, 1080);
    expect(resize).toHaveReturnedWith(undefined);
  });

  test('outOfBounds', () => {
    const outOfBounds = jest.fn(level.outOfBounds.bind(level));
    outOfBounds(new Vector3());
    expect(outOfBounds).toHaveReturnedWith(null);
  });

  test('dispose', () => {
    const dispose = jest.fn(level.dispose.bind(level));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
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

  test('bounds', () => {
    expect(LevelScene.bounds).toStrictEqual(LevelData.bounds);
  });

  test('center', () => {
    const x = (94 + -59.5) / 2.0;
    const z = (53 + -144) / 2.0;

    expect(LevelScene.center).toBeInstanceOf(Vector3);
    expect(LevelScene.center.y).toStrictEqual(0.0);
    expect(LevelScene.center.x).toStrictEqual(x);
    expect(LevelScene.center.z).toStrictEqual(z);
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

  test('render', () => {
    (level as unknown as Record<string, unknown>).portals = { update: jest.fn() };
    const render = jest.fn(level.render.bind(level));
    render(0);
    expect(render).toHaveReturnedWith(undefined);
  });
});
