import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import Rain from '@/environment/Rain';

describe('Rain', () => {
  const scene = new Scene();
  const renderer = new WebGLRenderer();
  const rain = new Rain(renderer, scene);

  test('Create', () => {
    expect(rain).toBeDefined();
    expect(rain).toBeInstanceOf(Rain);
  });

  test('updateParticleGeometry', () => {
    const rainPrototype = Object.getPrototypeOf(rain);
    const updateParticleGeometry = jest.fn(rainPrototype.updateParticleGeometry.bind(rain, [null, null]));

    updateParticleGeometry();
    expect(updateParticleGeometry).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(rain.update.bind(rain));
    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });

  test('resize', () => {
    const resize = jest.fn(rain.resize.bind(rain));
    resize(1920, 1080);
    expect(resize).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(rain.dispose.bind(rain));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(() => rain.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });

  test('cameraDrops', () => {
    expect(rain.cameraDrops?.tagName).toBe('CANVAS');
  });
});
