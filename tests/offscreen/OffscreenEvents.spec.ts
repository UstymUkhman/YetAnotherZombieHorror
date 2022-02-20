import OffscreenEvents from '@/offscreen/OffscreenEvents';
import WebWorker from '@/worker/WebWorker';

describe('OffscreenEvents', () => {
  const events = new OffscreenEvents(new WebWorker());

  test('Create', () => {
    expect(events).toBeDefined();
    expect(events).toBeInstanceOf(OffscreenEvents);
  });

  test('onDispatch', () => {
    const eventsPrototype = Object.getPrototypeOf(events);
    const onDispatch = jest.fn(eventsPrototype.onDispatch.bind(events));

    onDispatch();
    expect(onDispatch).toHaveReturnedWith(undefined);

    events.pause = false;
    onDispatch({ type: 'keydown' });
    expect(onDispatch).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(events.dispose.bind(events));

    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    events.pause = false;
    expect(events.pause).toStrictEqual(undefined);

    events.pause = true;
    expect(events.pause).toStrictEqual(undefined);
  });
});
