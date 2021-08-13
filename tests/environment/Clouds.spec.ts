import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { PointLight } from 'three/src/lights/PointLight';
import LevelScene from '@/environment/LevelScene';
import Clouds from '@/environment/Clouds';

describe('Clouds', () => {
  const clouds = new Clouds(100);

  test('Create', () => {
    expect(Clouds).toBeDefined();
    expect(clouds).toBeInstanceOf(Clouds);
  });

  test('addSounds', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const addSounds = jest.fn(cloudsPrototype.addSounds.bind(clouds, []));

    addSounds([]);
    expect(addSounds).toHaveReturnedWith(undefined);
  });

  test('startLighting', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const startLighting = jest.fn(cloudsPrototype.startLighting.bind(clouds));

    startLighting();
    expect(startLighting).toHaveReturnedWith(undefined);
  });

  test('hideLighting', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const hideLighting = jest.fn(cloudsPrototype.hideLighting.bind(clouds));

    hideLighting();
    expect(hideLighting).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const update = jest.fn(cloudsPrototype.update.bind(clouds));

    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const cloudsPrototype = Object.getPrototypeOf(clouds);
    const dispose = jest.fn(cloudsPrototype.dispose.bind(clouds));

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
