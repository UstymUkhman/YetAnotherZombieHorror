import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { PointLight } from 'three/src/lights/PointLight';

import LevelScene from '@/scenes/LevelScene';
import Clouds from '@/environment/Clouds';

describe('Clouds', () => {
  const clouds = new Clouds();

  test('Create', () => {
    expect(Clouds).toBeDefined();
    expect(clouds).toBeInstanceOf(Clouds);
  });

  test('startLighting', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const startLighting = jest.fn(cloudsPrototype.startLighting.bind(clouds));

    startLighting();
    expect(startLighting).toHaveReturnedWith(undefined);
  });

  test('showLighting', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const showLighting = jest.fn(cloudsPrototype.showLighting.bind(clouds));

    showLighting();
    expect(showLighting).toHaveReturnedWith(undefined);
  });

  test('hideLighting', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const hideLighting = jest.fn(cloudsPrototype.hideLighting.bind(clouds));

    hideLighting();
    expect(hideLighting).toHaveReturnedWith(undefined);
  });

  test('createClouds', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const createClouds = jest.fn(cloudsPrototype.createClouds.bind(clouds));

    const createdClouds = createClouds();
    expect(createdClouds).toBeInstanceOf(Object);
  });

  test('update', () => {
    const update = jest.fn(clouds.update.bind(clouds));

    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(clouds.dispose.bind(clouds));

    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('height', () => {
    expect(Clouds.height).toBeGreaterThanOrEqual(LevelScene.size.x);
    expect(Clouds.height).toBeGreaterThanOrEqual(LevelScene.size.y);
  });

  test('pause', () => {
    const pause = jest.fn(() => clouds.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });

  test('sky', () => {
    expect(clouds.sky).toBeInstanceOf(InstancedMesh);
  });

  test('flash', () => {
    expect(clouds.flash).toBeInstanceOf(PointLight);
  });
});
