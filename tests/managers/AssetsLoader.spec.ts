import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { CubeTexture } from 'three/src/textures/CubeTexture';
import { Texture } from 'three/src/textures/Texture';

import { Assets } from '@/loaders/AssetsLoader';
import { Group } from 'three/src/objects/Group';
import { RGBFormat } from 'three/src/constants';

describe('AssetsLoader', () => {
  test('Create', () => {
    expect(Assets.Loader).toBeDefined();
    expect(Assets.Loader).toBeInstanceOf(LoadingManager);
  });

  test('getPromiseCallbacks', done => {
    const loaderPrototype = Object.getPrototypeOf(Assets.Loader);
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
    Assets.Loader.loadCubeTexture('skybox').then(cubeTexture => {
      expect(cubeTexture).toBeInstanceOf(CubeTexture);
      expect(cubeTexture.images.length).toStrictEqual(6);
    });

    done();
  });

  test('loadTexture', done => {
    Assets.Loader.loadTexture('AK47.png').then(texture => {
      expect(texture).toBeInstanceOf(Texture);
      expect(texture.image).toBeInstanceOf(Image);
    });

    done();
  });

  test('loadGLTF', done => {
    Assets.Loader.loadGLTF('AK47.glb').then(model => {
      expect(model.scene).toBeInstanceOf(Group);
      expect(model).toEqual({ scene: new Group() });
    });

    done();
  });

  test('loadAudio', done => {
    Assets.Loader.loadAudio('scream.mp3').then(audio => {
      expect(audio).toBeInstanceOf(AudioBuffer);
    });

    done();
  });

  test('onProgress', () => {
    const onProgress = jest.fn(Assets.Loader.onProgress);
    onProgress('', 1, 1);
    expect(onProgress).toHaveReturnedWith(undefined);
  });

  test('onError', () => {
    const onError = jest.fn(Assets.Loader.onError);
    onError('');
    expect(onError).toHaveReturnedWith(undefined);
  });

  test('onStart', () => {
    const onStart = jest.fn(Assets.Loader.onStart);
    onStart();
    expect(onStart).toHaveReturnedWith(undefined);
  });

  test('onLoad', () => {
    const onLoad = jest.fn(Assets.Loader.onLoad);
    onLoad();
    expect(onLoad).toHaveReturnedWith(undefined);
  });
});
