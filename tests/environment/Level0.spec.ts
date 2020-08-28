declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Object3D } from '@three/core/Object3D';
import Level0 from '@/environment/Level0';

describe('Level0', () => {
  const level = new Level0();

  test('Create', () => {
    expect(Level0).toBeDefined();
    expect(level).toBeInstanceOf(Level0);
  });

  test('addModel', () => {
    const addObject = jest.fn(level.addObject.bind(level));
    addObject(new Object3D());
    expect(addObject).toHaveReturnedWith(undefined);
  });

  test('render', () => {
    const render = jest.fn(level.render.bind(level));
    render();
    expect(render).toHaveReturnedWith(undefined);
  });

  test('destroy', () => {
    const destroy = jest.fn(level.destroy.bind(level));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });
});
