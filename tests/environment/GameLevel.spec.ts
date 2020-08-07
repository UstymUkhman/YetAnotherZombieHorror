declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import GameLevel from '@/environment/GameLevel';

describe('Level0', () => {
  const level = new GameLevel();

  test('Create', () => {
    expect(level).toBeInstanceOf(GameLevel);
  });

  test('setRenderSize', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const setRenderSize = jest.fn(levelPrototype.setRenderSize.bind(level));

    setRenderSize();
    expect(setRenderSize).toHaveReturnedWith(undefined);
  });

  test('canvas', () => {
    expect(level.canvas.tagName).toBe('CANVAS');
  });
});
