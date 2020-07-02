import { LoadingManager } from '@three/loaders/LoadingManager';
import { CubeTexture } from '@three/textures/CubeTexture';

import AssetsLoader from '@/managers/AssetsLoader';
import { Texture } from '@three/textures/Texture';
import { Group } from '@three/objects/Group';

describe('AssetsLoader', () => {
  const loader = new AssetsLoader();

  test('Create', () => {
    const defaultTexturePath = '/assets/images';
    const defaultModelsPath = '/assets/models/';

    const defaultCubeTextures = [
      'px.png', 'nx.png',
      'py.png', 'ny.png',
      'pz.png', 'nz.png'
    ];

    expect(AssetsLoader).toBeDefined();
    expect(loader).toBeInstanceOf(LoadingManager);

    expect(loader.modelBasePath).toStrictEqual(defaultModelsPath);
    expect(loader.cubeTextures).toStrictEqual(defaultCubeTextures);
    expect(loader.textureBasePath).toStrictEqual(defaultTexturePath);
  });

  test('loadCubeTexture', done => {
    loader.loadCubeTexture('skybox').then(cubeTexture => {
      expect(cubeTexture).toBeInstanceOf(CubeTexture);
      expect(cubeTexture.images.length).toStrictEqual(6);
    });

    done();
  });

  test('loadTexture', done => {
    loader.loadTexture('AK47.png').then(texture => {
      expect(texture).toBeInstanceOf(Texture);
      expect(texture.image).toBeInstanceOf(Image);
    });

    done();
  });

  test('loadGLTF', done => {
    loader.loadGLTF('AK47.glb').then(model => {
      expect(model.scene).toBeInstanceOf(Group);
      expect(model).toEqual({ scene: new Group() });
    });

    done();
  });

  test('onProgress', () => {
    const onProgress = jest.fn(loader.onProgress);
    onProgress('', 1, 1);
    expect(onProgress).toHaveReturnedWith('100');
  });

  test('onError', () => {
    const onError = jest.fn(loader.onError);
    onError('');
    expect(onError).toHaveReturnedWith(undefined);
  });

  test('onStart', () => {
    const onStart = jest.fn(loader.onStart);
    onStart();
    expect(onStart).toHaveReturnedWith(undefined);
  });

  test('onLoad', () => {
    const onLoad = jest.fn(loader.onLoad);
    onLoad();
    expect(onLoad).toHaveReturnedWith(undefined);
  });
});
