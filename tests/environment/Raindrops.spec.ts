import Raindrops from '@/environment/Raindrops';

describe('Raindrops', () => {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  const background = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  const raindrops = new Raindrops(background as HTMLCanvasElement, canvas as HTMLCanvasElement);

  test('Create', () => {
    expect(raindrops).toBeDefined();
    expect(raindrops).toBeInstanceOf(Raindrops);
  });

  test('update', () => {
    const raindropsPrototype = Object.getPrototypeOf(raindrops);
    const update = jest.fn(raindropsPrototype.update.bind(raindrops));

    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('resize', () => {
    const raindropsPrototype = Object.getPrototypeOf(raindrops);
    const resize = jest.fn(raindropsPrototype.resize.bind(raindrops, [1920, 1080]));

    resize();
    expect(resize).toHaveReturnedWith(undefined);

    canvas.style.opacity = '1';

    resize();
    expect(resize).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(raindrops.pause.bind(raindrops));
    pause(true);
    expect(pause).toHaveReturnedWith(undefined);

    pause(false);
    expect(pause).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(raindrops.dispose.bind(raindrops));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });
});
