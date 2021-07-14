import Viewport from '@/utils/Viewport';

describe('Viewport', () => {
  test('Create', () => {
    expect(Viewport).toBeDefined();
  });

  test('size', () => {
    const width = window.innerWidth;
    const height = window.innerWidth / Viewport.ratio;

    expect(Viewport.size.width).toStrictEqual(width);
    expect(Viewport.size.height).toStrictEqual(height);
  });

  test('dispose', () => {
    const dispose = jest.fn(Viewport.dispose.bind(Viewport));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('ratio', () => {
    expect(Viewport.ratio).toStrictEqual(16 / 9);
  });
});
