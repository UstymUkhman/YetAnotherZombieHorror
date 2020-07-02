import GameEvents, { GameEvent } from '@/managers/GameEvents';

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

  test('add & dispatch', () => {
    GameEvents.add('time', callback);
    GameEvents.dispatch('time', timestamp);
    expect(callback).toHaveBeenCalledWith(gameEvent);
  });

  test('remove', () => {
    GameEvents.remove('time');
    GameEvents.dispatch('time', timestamp);
    expect(callback).not.toHaveBeenCalled();
  });

  test('dispose', () => {
    GameEvents.add('time', callback);
    GameEvents.dispose();

    GameEvents.dispatch('time', timestamp);
    expect(callback).not.toHaveBeenCalled();
  });
});
