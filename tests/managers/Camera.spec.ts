import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { CameraManager, CameraObject } from '@/managers/Camera';

import { Object3D } from 'three/src/core/Object3D';
import Camera from '@/managers/Camera';
import Config from '@/config';

describe('Camera', () => {
  test('setCamera', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const setCamera = jest.fn(сameraPrototype.setCamera.bind(Camera));

    setCamera();
    expect(setCamera).toHaveReturnedWith(undefined);
  });

  test('updateState', () => {
    const updateState = jest.fn(Camera.updateState.bind(Camera));

    updateState();
    expect(updateState).toHaveReturnedWith(undefined);
  });

  test('getPosition', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const getPosition = jest.fn(сameraPrototype.getPosition.bind(Camera));

    getPosition();
    expect(getPosition).toHaveReturnedWith(Config.Camera.tps.idle);
  });

  test('changeView', () => {
    const changeView = jest.fn(Camera.changeView.bind(Camera));

    changeView(true, false, false);
    expect(changeView).toHaveReturnedWith(undefined);

    changeView(true, true, false);
    expect(changeView).toHaveReturnedWith(undefined);

    changeView(false, false, true);
    expect(changeView).toHaveReturnedWith(undefined);

    changeView(false, true, true);
    expect(changeView).toHaveReturnedWith(undefined);
  });

  test('updateNearPlane', () => {
    const updateNearPlane = jest.fn(Camera.updateNearPlane.bind(Camera));

    updateNearPlane(false, false, false);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(false, false, true);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(false, true, false);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(false, true, true);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(true, false, false);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(true, false, true);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(true, true, false);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    updateNearPlane(true, true, true);
    expect(updateNearPlane).toHaveReturnedWith(undefined);

    const changeView = jest.fn(Camera.changeView.bind(Camera));
    changeView(false, false, false);

    updateNearPlane(false, true, true);
    expect(updateNearPlane).toHaveReturnedWith(undefined);
    changeView(false, false, false);
  });

  test('setNearPlane', () => {
    const setNearPlane = jest.fn(Camera.setNearPlane.bind(Camera));

    setNearPlane(0.1, 400);
    expect(setNearPlane).toHaveReturnedWith(undefined);

    setNearPlane(0.5, 100);
    expect(setNearPlane).toHaveReturnedWith(undefined);
  });

  test('changeShoulder', () => {
    const changeShoulder = jest.fn(Camera.changeShoulder.bind(Camera));

    changeShoulder();
    expect(changeShoulder).toHaveReturnedWith(undefined);

    changeShoulder();
    expect(changeShoulder).toHaveReturnedWith(undefined);
  });

  test('aimAnimation', () => {
    const aimAnimation = jest.fn(Camera.aimAnimation.bind(Camera));
    aimAnimation(true, false, 400);
    expect(aimAnimation).toHaveReturnedWith(undefined);

    aimAnimation(false, true, 400);
    expect(aimAnimation).toHaveReturnedWith(undefined);
  });

  test('shakeAnimation', () => {
    const { x, y, z } = Config.Camera.tps.idle;
    const shakeAnimation = jest.fn(Camera.shakeAnimation.bind(Camera));

    shakeAnimation(0.0);

    expect(Camera.object.position.x).toStrictEqual(x);
    expect(Camera.object.position.y).toStrictEqual(y);
    expect(Camera.object.position.z).toStrictEqual(z);

    shakeAnimation(0.1);

    expect(Camera.object.position.x).not.toStrictEqual(x);
    expect(Camera.object.position.y).not.toStrictEqual(y);
    expect(Camera.object.position.z).not.toStrictEqual(z);

    expect(shakeAnimation).toHaveReturnedWith(undefined);
  });

  test('runAnimation', () => {
    const runAnimation = jest.fn(Camera.runAnimation.bind(Camera));

    runAnimation(true);
    expect(runAnimation).toHaveReturnedWith(undefined);

    runAnimation(false);
    expect(runAnimation).toHaveReturnedWith(undefined);
  });

  test('run', () => {
    const сameraPrototype = Object.getPrototypeOf(Camera);
    const run = jest.fn(сameraPrototype.run.bind(Camera));

    run();
    expect(run).toHaveReturnedWith(undefined);
  });

  test('deathAnimation', () => {
    const deathAnimation = jest.fn(Camera.deathAnimation.bind(Camera));
    deathAnimation();
    expect(deathAnimation).toHaveReturnedWith(undefined);
  });

  test('setTo', () => {
    const target = new Object3D();
    Camera.setTo(target);

    expect(target.children.length).toStrictEqual(1);
    expect(target.children[0]).toBe(Camera.object);
  });

  test('resize', () => {
    const resize = jest.fn(Camera.resize.bind(Camera));
    resize();
    expect(resize).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(Camera.dispose.bind(Camera));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('config', () => {
    const { aspect, near, far, fov } = CameraManager.config;

    expect(aspect).toStrictEqual(CameraObject.aspect);
    expect(near).toStrictEqual(CameraObject.near);
    expect(far).toStrictEqual(CameraObject.far);
    expect(fov).toStrictEqual(CameraObject.fov);
  });

  test('CameraObject', () => {
    expect(Camera.object).toBeInstanceOf(PerspectiveCamera);
    expect(Camera.object).toStrictEqual(CameraObject);

    expect(Camera.object.fov).toBeGreaterThan(42.9);
    expect(Camera.object.fov).toBeLessThan(43.0);
  });

  test('isFPS', () => {
    expect(typeof Camera.isFPS).toStrictEqual('boolean');
    expect(Camera.isFPS).toStrictEqual(false);
  });
});
