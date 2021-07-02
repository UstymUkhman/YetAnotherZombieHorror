import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { PointLight } from 'three/src/lights/PointLight';

import Clouds from '@/environment/Clouds';
import Limbo from '@/environment/Limbo';

describe('Clouds', () => {
  const clouds = new Clouds(100);

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
    expect(Clouds.height).toBeGreaterThanOrEqual(Limbo.size.x);
    expect(Clouds.height).toBeGreaterThanOrEqual(Limbo.size.y);
  });

  test('sky', () => {
    expect(clouds.sky).toBeInstanceOf(InstancedMesh);
  });

  test('flash', () => {
    expect(clouds.flash).toBeInstanceOf(PointLight);
  });
});
