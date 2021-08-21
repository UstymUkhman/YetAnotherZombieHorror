import type { Shader } from 'three/src/renderers/shaders/ShaderLib';
import VolumetricFog from '@/environment/VolumetricFog';
import { FogExp2 } from 'three/src/scenes/FogExp2';

describe('VolumetricFog', () => {
  const fog = new VolumetricFog();

  test('Create', () => {
    expect(fog).toBeInstanceOf(FogExp2);
  });

  test('setUniforms', () => {
    const setUniforms = jest.fn(fog.setUniforms.bind(fog));

    setUniforms({ uniforms: Object.create(null) } as Shader);
    expect(setUniforms).toHaveReturnedWith(undefined);
    expect(fog.setUniforms).toBeInstanceOf(Function);
  });

  test('update', () => {
    const update = jest.fn(fog.update.bind(fog));

    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(fog.dispose.bind(fog));

    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });
});
