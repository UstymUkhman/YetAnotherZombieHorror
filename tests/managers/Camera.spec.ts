declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import Camera, { object, listener } from '@/managers/Camera';
import { Object3D } from '@three/core/Object3D';

describe('Camera', () => {
  test('updateAspectRatio', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const updateAspectRatio = jest.fn(сameraPrototype.updateAspectRatio.bind(Camera));

    updateAspectRatio();
    expect(updateAspectRatio).toHaveReturnedWith(undefined);
  });

  test('setTo', () => {
    const target = new Object3D();
    Camera.setTo(target);

    expect(target.children.length).toStrictEqual(1);
    expect(target.children[0]).toBe(Camera.object);
  });

  test('listener', () => {
    expect(Camera.listener).toStrictEqual(listener);
  });

  test('object', () => {
    expect(Camera.object).toBeInstanceOf(PerspectiveCamera);
    expect(Camera.object.fov).toBeCloseTo(55.4, 1);
    expect(Camera.object).toStrictEqual(object);
  });

  test('destroy', () => {
    const destroy = jest.fn(Camera.destroy.bind(Camera));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });
});
