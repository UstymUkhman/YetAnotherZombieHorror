import { GameEvents, GameEvent } from '@/events/GameEvents';
import WebWorker from '@/worker/WebWorker';

const timestamp = Date.now();

describe('GameEvent', () => {
  const event = new GameEvent('event');
  event.data = timestamp;

  test('Create', () => {
    expect(GameEvent).toBeDefined();
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.data).toStrictEqual(timestamp);
  });
});

describe('GameEvents', () => {
  const gameEvent = new GameEvent('time');
  gameEvent.data = timestamp;

  const callback = jest.fn((event: GameEvent) => {
    expect(event).toStrictEqual(gameEvent);
    expect(event.data).toStrictEqual(timestamp);
  });

  test('Create', () => {
    expect(GameEvents).toBeDefined();
  });

  test('createWorkerEvents', () => {
    const webWorker = new WebWorker();
    const createWorkerEvents = jest.fn(GameEvents.createWorkerEvents.bind(GameEvents, webWorker));

    createWorkerEvents();
    expect(createWorkerEvents).toHaveReturnedWith(undefined);
  });

  test('add & dispatch', () => {
    GameEvents.add('time', callback);
    GameEvents.add('time', callback, true);

    GameEvents.dispatch('time', timestamp);
    GameEvents.dispatch('time', timestamp, true);

    expect(callback).toHaveBeenCalledWith(gameEvent);
  });

  test('remove', () => {
    GameEvents.remove('time');
    GameEvents.remove('time', true);

    GameEvents.dispatch('time', timestamp);
    GameEvents.dispatch('time', timestamp, true);

    expect(callback).not.toHaveBeenCalled();
  });

  test('dispose', () => {
    GameEvents.add('time', callback);
    GameEvents.dispose();

    GameEvents.dispatch('time', timestamp);
    expect(callback).not.toHaveBeenCalled();
  });
});
