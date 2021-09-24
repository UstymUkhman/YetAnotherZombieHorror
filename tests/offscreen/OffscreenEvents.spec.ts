import OffscreenEvents from '@/offscreen/OffscreenEvents';
import WebWorker from '@/worker/WebWorker';

describe('OffscreenEvents', () => {
  const events = new OffscreenEvents(new WebWorker());

  test('Create', () => {
    expect(events).toBeDefined();
    expect(events).toBeInstanceOf(OffscreenEvents);
  });

  test('dispatch', () => {
    const eventsPrototype = Object.getPrototypeOf(events);
    const dispatch = jest.fn(eventsPrototype.dispatch.bind(events));

    dispatch();
    expect(dispatch).toHaveReturnedWith(undefined);
  });
});
