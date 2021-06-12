import GameLevel from '@/environment/GameLevel';

describe('GameLevel', () => {
  const level = new GameLevel();

  test('Create', () => {
    expect(level).toBeInstanceOf(GameLevel);
  });

  test('canvas', () => {
    expect(level.canvas.tagName).toBe('CANVAS');
  });
});
