import { GameEvent } from '@/events/GameEvents';

export default class CustomEvents
{
  private readonly target = new EventTarget();
  private readonly events: Map<string, GameEvent> = new Map();
  private readonly callbacks: Map<string, EventCallback> = new Map();

  protected add (name: string, callback: EventCallback): void {
    this.callbacks.set(name, callback);
    this.events.set(name, new GameEvent(name));
    this.target.addEventListener(name, callback as EventListener, false);
  }

  protected dispatch (name: string, data: unknown = null): void {
    const event = this.events.get(name);

    if (event) {
      event.data = data;
      this.target.dispatchEvent(event);
    }
  }

  protected remove (name: string): void {
    const callback = this.callbacks.get(name) as EventListener;
    this.target.removeEventListener(name, callback, false);

    this.callbacks.delete(name);
    this.events.delete(name);
  }

  protected dispose (): void {
    for (const [name] of this.events) {
      this.remove(name);
    }

    this.callbacks.clear();
    this.events.clear();
  }
}
