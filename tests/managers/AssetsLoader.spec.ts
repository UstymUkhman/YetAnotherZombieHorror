import { LoadingManager } from '@three/loaders/LoadingManager';
import { CubeTexture } from '@three/textures/CubeTexture';
import { Texture } from '@three/textures/Texture';

import { Assets } from '@/managers/AssetsLoader';
import { Group } from '@three/objects/Group';
import { RGBFormat } from '@three/constants';

describe('AssetsLoader', () => {
  const loader = new Assets.Loader();

  test('Create', () => {
    expect(Assets.Loader).toBeDefined();
    expect(loader).toBeInstanceOf(LoadingManager);
  });

  test('getPromiseCallbacks', done => {
    const loaderPrototype = Object.getPrototypeOf(loader);
    const getPromiseCallbacks = jest.fn(loaderPrototype.getPromiseCallbacks.bind(loaderPrototype));

    new Promise((resolve, reject) => {
      const callbacks = getPromiseCallbacks(resolve, reject) as Assets.Callbacks;
      expect(callbacks.onLoad(new CubeTexture())).toHaveReturnedWith(undefined);
    }).then(asset => {
      expect(asset).toBeInstanceOf(CubeTexture);
      expect((asset as CubeTexture).format).toStrictEqual(RGBFormat);
    });

    new Promise((resolve, reject) => {
      const callbacks = getPromiseCallbacks(resolve, reject) as Assets.Callbacks;
      expect(callbacks.onProgress(new ProgressEvent('loading'))).toHaveReturnedWith(undefined);
    });

    new Promise((resolve, reject) => {
      const error = new ErrorEvent('loading');
      const callbacks = getPromiseCallbacks(resolve, reject) as Assets.Callbacks;
      expect(callbacks.onError(error)).rejects.toStrictEqual(error);
    });

    done();
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
