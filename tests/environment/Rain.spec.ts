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

  test('createWorkerLoop', () => {
    const rainPrototype = Object.getPrototypeOf(rain);
    const createWorkerLoop = jest.fn(rainPrototype.createWorkerLoop.bind(rain, [null, null]));

    createWorkerLoop();
    expect(createWorkerLoop).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(rain.update.bind(rain));
    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });

  test('updateParticles', () => {
    const rainPrototype = Object.getPrototypeOf(rain);
    const updateParticles = jest.fn(rainPrototype.updateParticles.bind(rain, [null, null]));

    updateParticles();
    expect(updateParticles).toHaveReturnedWith(undefined);
  });

  test('updateParticleGeometry', () => {
    const rainPrototype = Object.getPrototypeOf(rain);
    const updateParticleGeometry = jest.fn(rainPrototype.updateParticleGeometry.bind(rain, [null, null]));

    updateParticleGeometry();
    expect(updateParticleGeometry).toHaveReturnedWith(undefined);
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
});
