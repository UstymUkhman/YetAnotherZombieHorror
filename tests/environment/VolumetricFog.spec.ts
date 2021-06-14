import type { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import type { Shader } from 'three/src/renderers/shaders/ShaderLib';

import { VolumetricFog } from '@/environment/VolumetricFog';
import { FogExp2 } from 'three/src/scenes/FogExp2';
import { Mesh } from 'three/src/objects/Mesh';
import Limbo from '@/environment/Limbo';

describe('VolumetricFog', () => {
  const fog = new VolumetricFog();

  test('Create', () => {
    expect(fog).toBeInstanceOf(FogExp2);
  });

  test('setUniforms', () => {
    const setUniforms = jest.fn(fog.setUniforms.bind(fog));

    setUniforms({ uniforms: {} } as Shader);
    expect(fog.setUniforms).toBeInstanceOf(Function);
    expect(setUniforms).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(fog.update.bind(fog));

    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });

  test('skybox', () => {
    const radius = Math.abs(Limbo.minCoords[1] - Limbo.maxCoords[1]);
    const geometry = fog.skybox.geometry as SphereGeometry;

    expect(fog.skybox).toBeInstanceOf(Mesh);
    expect(geometry.parameters.radius).toBeCloseTo(radius, 0);
  });
});
