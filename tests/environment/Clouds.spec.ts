import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { PointLight } from 'three/src/lights/PointLight';
import Clouds from '@/environment/Clouds';

describe('Clouds', () => {
  const clouds = new Clouds(100);

  test('Create', () => {
    expect(Clouds).toBeDefined();
    expect(clouds).toBeInstanceOf(Clouds);
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

  test('sky', () => {
    expect(clouds.sky).toBeInstanceOf(InstancedMesh);
  });

  test('flash', () => {
    expect(clouds.flash).toBeInstanceOf(PointLight);
  });
});
