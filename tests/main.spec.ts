import Game from '@/main';

jest.mock('@/Game.svelte', () => {
  return jest.fn().mockImplementation(() => {
    return { target: document.body };
  });
});

describe('Game', () => {
  test('Create', () => {
    expect(Game).toBeDefined();
    expect(Game?.target).toStrictEqual(document.body);
  });
});
