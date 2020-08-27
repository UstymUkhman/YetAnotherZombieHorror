declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import Camera, { object, listener } from '@/managers/Camera';

import { Object3D } from '@three/core/Object3D';
import { Vector3 } from '@three/math/Vector3';
import { Euler } from '@three/math/Euler';

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

  test('position', () => {
    expect(Camera.position).toBeInstanceOf(Vector3);
    expect(Camera.position.x).toStrictEqual(-1.1);
    expect(Camera.position.y).toStrictEqual(2.75);
    expect(Camera.position.z).toStrictEqual(-2.5);
  });

  test('rotation', () => {
    expect(Camera.rotation).toBeInstanceOf(Euler);
    expect(Camera.rotation.x).toStrictEqual(0);
    expect(Camera.rotation.y).toStrictEqual(Math.PI);
    expect(Camera.rotation.z).toStrictEqual(0);
  });

  test('destroy', () => {
    const destroy = jest.fn(Camera.destroy.bind(Camera));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });
});
