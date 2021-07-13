import Viewport, { RATIO } from '@/utils/Viewport';

describe('Viewport', () => {
  test('Create', () => {
    const width = window.innerWidth;
    const height = window.innerWidth / Viewport.ratio;

    expect(Viewport).toBeDefined();
    expect(Viewport.ratio).toStrictEqual(16 / 9);

    expect(Viewport.size.width).toStrictEqual(width);
    expect(Viewport.size.height).toStrictEqual(height);
  });

  test('dispose', () => {
    const dispose = jest.fn(Viewport.dispose.bind(Viewport));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('RATIO', () => {
    expect(RATIO).toStrictEqual(16 / 9);
  });
});
