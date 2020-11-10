declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Camera, CameraObject, CameraListener } from '@/managers/GameCamera';
import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { Object3D } from '@three/core/Object3D';

describe('GameCamera', () => {
  test('CameraObject', () => {
    expect(Camera.object).toBeInstanceOf(PerspectiveCamera);
    expect(Camera.object).toStrictEqual(CameraObject);
    expect(Camera.object.fov).toBeCloseTo(55.4, 1);
  });

  test('CameraListener', () => {
    expect(Camera.listener).toStrictEqual(CameraListener);
  });

  test('updateAspectRatio', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const updateAspectRatio = jest.fn(сameraPrototype.updateAspectRatio.bind(Camera));

    updateAspectRatio();
    expect(updateAspectRatio).toHaveReturnedWith(undefined);
  });

  test('setCamera', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const setCamera = jest.fn(сameraPrototype.setCamera.bind(Camera));

    setCamera();
    expect(setCamera).toHaveReturnedWith(undefined);
  });

  test('aimAnimation', () => {
    const aimAnimation = jest.fn(Camera.aimAnimation.bind(Camera));
    aimAnimation(true, true, false, 400);
    expect(aimAnimation).toHaveReturnedWith(undefined);

    aimAnimation(false, false, true, 400);
    expect(aimAnimation).toHaveReturnedWith(undefined);
  });

  test('runAnimation', () => {
    const runAnimation = jest.fn(Camera.runAnimation.bind(Camera));
    runAnimation(() => true, true);
    expect(runAnimation).toHaveReturnedWith(undefined);
  });

  test('setTo', () => {
    const target = new Object3D();
    Camera.setTo(target);

    expect(target.children.length).toStrictEqual(1);
    expect(target.children[0]).toBe(Camera.object);
  });

  test('destroy', () => {
    const destroy = jest.fn(Camera.destroy.bind(Camera));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });
});
