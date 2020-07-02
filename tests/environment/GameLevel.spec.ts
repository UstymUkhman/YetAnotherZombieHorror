import GameLevel from '@/environment/GameLevel';

describe('Level0', () => {
  const level = new GameLevel();

  test('Create', () => {
    expect(level).toBeInstanceOf(GameLevel);
  });

  test('onResize', () => {
    const levelPrototype = Object.getPrototypeOf(level);
    const onResize = jest.fn(levelPrototype.onResize.bind(level));

    onResize();
    expect(onResize).toHaveReturnedWith(undefined);
  });

  test('canvas', () => {
    expect(level.canvas.tagName).toBe('CANVAS');
  });
});
