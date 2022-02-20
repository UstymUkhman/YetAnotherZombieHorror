import Viewport from '@/utils/Viewport';

describe('Viewport', () => {
  const callback = () => void 0;

  test('Create', () => {
    expect(Viewport).toBeDefined();
  });

  test('addResizeCallback', () => {
    const addResizeCallback = jest.fn(Viewport.addResizeCallback.bind(Viewport, callback));

    addResizeCallback();
    expect(addResizeCallback).toHaveReturnedWith(undefined);
  });

  test('updateScreen', () => {
    const viewportPrototype = Object.getPrototypeOf(Viewport);
    const updateScreen = jest.fn(viewportPrototype.updateScreen.bind(Viewport));

    updateScreen();
    expect(updateScreen).toHaveReturnedWith(undefined);
  });

  test('removeResizeCallback', () => {
    const removeResizeCallback = jest.fn(Viewport.removeResizeCallback.bind(Viewport, callback));

    removeResizeCallback();
    expect(removeResizeCallback).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(Viewport.dispose.bind(Viewport));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('ratio', () => {
    expect(Viewport.ratio).toStrictEqual(16 / 9);
  });

  test('size', () => {
    const width = window.innerWidth;
    const height = window.innerWidth / Viewport.ratio;

    expect(Viewport.size.width).toStrictEqual(width);
    expect(Viewport.size.height).toStrictEqual(height);
  });
});
