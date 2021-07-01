import GameScene from '@/environment/GameScene';

describe('GameScene', () => {
  const level = new GameScene();

  test('Create', () => {
    expect(level).toBeInstanceOf(GameScene);
  });

  test('canvas', () => {
    expect(level.canvas.tagName).toBe('CANVAS');
  });
});
