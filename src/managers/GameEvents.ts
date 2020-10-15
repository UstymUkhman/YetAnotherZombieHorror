type Callback = (event: GameEvent) => void;
type Callbacks = Map<string, Callback>;
type Events = Map<string, GameEvent>;

export class GameEvent extends CustomEvent<unknown> {
  public data: unknown = null;
}

export class GameEvents {
  private static readonly callbacks: Callbacks = new Map();
  private static readonly events: Events = new Map();

  public static add (name: string, callback: Callback): void {
    this.callbacks.set(name, callback);
    this.events.set(name, new GameEvent(name));
    document.addEventListener(name, callback as EventListener, false);
  }

  public static dispatch (name: string, data: unknown = null): void {
    const gameEvent = this.events.get(name);

    if (gameEvent) {
      gameEvent.data = data;
      document.dispatchEvent(gameEvent);
    }
  }

  public static remove (name: string): void {
    const callback = this.callbacks.get(name) as EventListener;
    document.removeEventListener(name, callback, false);

    this.callbacks.delete(name);
    this.events.delete(name);
  }

  public static dispose (): void {
    this.callbacks.clear();
    this.events.clear();
  }
}
