type GameEvents = { [name: string]: GameEvent };
type Callbacks = { [name: string]: Callback };
type Callback = (event: GameEvent) => void;

export class GameEvent extends CustomEvent<unknown> {
  public data: unknown = null;

  constructor (name: string) {
    super(name);
  }
}

class Events {
  private readonly events: GameEvents = {};
  private readonly callbacks: Callbacks = {};

  public add (name: string, callback: Callback): void {
    this.callbacks[name] = callback;
    this.events[name] = new GameEvent(name);
    document.addEventListener(name, callback as EventListener, false);
  }

  public dispatch (name: string, data: unknown = null): void {
    const gameEvent: GameEvent = this.events[name];

    if (gameEvent) {
      gameEvent.data = data;
      document.dispatchEvent(gameEvent);
    }
  }

  public remove (name: string): void {
    document.removeEventListener(name, this.callbacks[name] as EventListener, false);
    delete this.callbacks[name];
    delete this.events[name];
  }

  public dispose (): void {
    for (const name in this.events) {
      this.remove(name);
    }
  }
}

export const GameEvents = new Events();
