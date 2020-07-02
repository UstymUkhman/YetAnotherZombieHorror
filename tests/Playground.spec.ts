jest.mock('@three/renderers/WebGLRenderer');
jest.mock('three/examples/jsm/WebGL');

declare const global: any;
global.PRODUCTION = false;
global.VERSION = '0.1.0';

import Playground from '@/environment/Playground';

describe('Playground', () => {
  const playground = new Playground();

  test('Import', () => {
    expect(Playground).toBeDefined();
  });

  test('Create', () => {
    expect(playground).toBeInstanceOf(Playground);
  });

  test('render', () => {
    const render = jest.fn(playground.render.bind(playground));
    render();
    expect(render).toHaveReturnedWith(undefined);
  });

  test('onResize', () => {
    const onResize = jest.fn(playground.onResize.bind(playground));
    onResize();
    expect(onResize).toHaveReturnedWith(undefined);
  });

  test('getScene', () => {
    expect(playground.getScene().tagName).toBe('CANVAS');
  });

  test('destroy', () => {
    const destroy = jest.fn(playground.destroy.bind(playground));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });
});
