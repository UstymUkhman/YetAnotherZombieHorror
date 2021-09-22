import WorkerManager from '@/worker/WorkerManager';
import LevelScene from '@/environment/LevelScene';

import { CameraObject } from '@/managers/Camera';
import { Vector3 } from 'three/src/math/Vector3';

describe('WorkerManager', () => {
  const maxCoords = LevelScene.maxCoords;
  const minCoords = LevelScene.minCoords;

  test('Rain::UpdateParticles', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: 'Rain::UpdateParticles', params: {
        camera: CameraObject.position,
        minCoords: minCoords,
        maxCoords: maxCoords,
        delta: 0.0
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('Level::GetRandomCoord', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: 'Level::GetRandomCoord', params: {
        portals: LevelScene.portals,
        bounds: LevelScene.bounds,
        player: new Vector3(),
        minCoords: minCoords,
        maxCoords: maxCoords
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('Offscreen::Transfer', () => {
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

    const response = WorkerManager.onmessage?.({ data: {
      event: 'Offscreen::Transfer', params: {
        element: canvas, params: {
          pixelRatio: 1.0
        }
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('Game::Resize', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: 'Game::Resize', params: {
        height: 1080.0,
        width: 1920.0
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('Game::Pause', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: 'Game::Pause', params: {
        paused: false
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('EventsTarget::Dispatch', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: 'EventsTarget::Dispatch', params: {
        event: new CustomEvent('event', {
          detail: null
        })
      }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });

  test('default', () => {
    const response = WorkerManager.onmessage?.({ data: {
      event: '', params: { }
    }} as MessageEvent);

    expect(response).toStrictEqual(undefined);
  });
});
