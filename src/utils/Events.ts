type GameEvents = { [name: string]: GameEvent };
type Callbacks = { [name: string]: Callback };
type Callback = () => void;

class GameEvent extends CustomEvent<unknown> {
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
    document.addEventListener(name, callback, false);
  }

  public dispatch (name: string, data: unknown = null): void {
    this.events[name].data = data;
    document.dispatchEvent(this.events[name]);
  }

  public remove (name: string): void {
    document.removeEventListener(name, this.callbacks[name], false);
    delete this.callbacks[name];
    delete this.events[name];
  }

  public dispose (): void {
    for (const name in this.events) {
      this.remove(name);
    }
  }
}

export default new Events();
