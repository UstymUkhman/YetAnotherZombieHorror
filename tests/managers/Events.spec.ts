import { GameEvent, GameEvents } from '@/managers/Events';

describe('GameEvents', () => {
  const timestamp = Date.now();

  const gameEvent = new GameEvent('time');
  gameEvent.data = timestamp;

  const callback = jest.fn((event: GameEvent) => {
    expect(event).toStrictEqual(gameEvent);
    expect(event.data).toStrictEqual(timestamp);
  });

  test('Import', () => {
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
