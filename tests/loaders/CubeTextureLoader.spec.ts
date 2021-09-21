import CubeTextureLoader from '@/loaders/CubeTextureLoader';
import { Loader } from 'three/src/loaders/Loader';
import { Assets } from '@/loaders/AssetsLoader';

describe('CubeTextureLoader', () => {
  const loader = new CubeTextureLoader(Assets.Loader);

  test('Create', () => {
    expect(loader).toBeInstanceOf(Loader);
    expect(CubeTextureLoader).toBeDefined();
  });

  /* test('load', () => {
    const loader = new CubeTextureLoader(Assets.Loader);
    const texture = loader.load(['']);
    expect(texture).toBeInstanceOf(CubeTexture);
  }); */
});
