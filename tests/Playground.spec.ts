jest.mock('@three/renderers/WebGLRenderer');
jest.mock('three/examples/jsm/WebGL');

declare const global: any;
global.PRODUCTION = false;
global.VERSION = '0.1.0';

import Playground from '@/environment/Playground';

describe('Playground', () => {
  test('Import', () => {
    expect(Playground).toBeDefined();
  });

  test('Create', () => {
    const playground = new Playground();
    expect(playground).toBeInstanceOf(Playground);

    const _setSize = jest.fn();
    const _createScene = jest.fn();
    const _createCamera = jest.fn();
    const _createLights = jest.fn();
    const _createGround = jest.fn();

    const _createRenderer = jest.fn();
    const _createControls = jest.fn();
    const _createEvents = jest.fn();
    const _createStats = jest.fn();

    _setSize();
    _createScene();
    _createCamera();
    _createLights();
    _createGround();

    _createRenderer();
    _createControls();
    _createEvents();
    _createStats();

    expect(_setSize).toHaveBeenCalled();
    expect(_createScene).toHaveBeenCalled();
    expect(_createCamera).toHaveBeenCalled();
    expect(_createLights).toHaveBeenCalled();
    expect(_createGround).toHaveBeenCalled();

    expect(_createRenderer).toHaveBeenCalled();
    expect(_createControls).toHaveBeenCalled();
    expect(_createEvents).toHaveBeenCalled();
    expect(_createStats).toHaveBeenCalled();
  });

  test('Render', () => {
    const playground = new Playground();
    const _render = jest.fn();

    playground.render();
    _render();

    expect(_render).toHaveBeenCalled();
  });

  test('Resize', () => {
    const playground = new Playground();
    const _onResize = jest.fn();

    playground.onResize();
    _onResize();

    expect(_onResize).toHaveBeenCalled();
  });

  test('Canvas Element', () => {
    const playground = new Playground();
    expect(playground.getScene().tagName).toBe('CANVAS');
  });

  test('Destroy', () => {
    const playground = new Playground();
    const _destroy = jest.fn();

    playground.destroy();
    _destroy();

    expect(_destroy).toHaveBeenCalled();
  });
});
