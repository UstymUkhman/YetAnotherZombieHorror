type Callbacks = { [name: string]: Callback };
type Events = { [name: string]: GameEvent };
type Callback = (event: GameEvent) => void;

export class GameEvent extends CustomEvent<unknown> {
  public data: unknown = null;
}

export class GameEvents {
  private static readonly callbacks: Callbacks = {};
  private static readonly events: Events = {};

  public static add (name: string, callback: Callback): void {
    this.callbacks[name] = callback;
    this.events[name] = new GameEvent(name);
    document.addEventListener(name, callback as EventListener, false);
  }

  public static dispatch (name: string, data: unknown = null): void {
    const gameEvent: GameEvent = this.events[name];

    if (gameEvent) {
      gameEvent.data = data;
      document.dispatchEvent(gameEvent);
    }
  }

  public static remove (name: string): void {
    document.removeEventListener(name, this.callbacks[name] as EventListener, false);
    delete this.callbacks[name];
    delete this.events[name];
  }

  public static dispose (): void {
    for (const name in this.events) {
      this.remove(name);
    }
  }
}
