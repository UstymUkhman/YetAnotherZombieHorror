import { mouseEvent, wheelEvent, keyboardEvent, prevent } from '@/offscreen/EventHandlers';
import type { Events, EventHandler } from '@/offscreen/types';
import type { Event } from 'three/src/core/EventDispatcher';
import type WebWorker from '@/worker/WebWorker';

export default class OffscreenEvents
{
  private paused = true;
  private readonly dispatch = this.onDispatch.bind(this);

  private readonly eventHandlers = new Map(Object.entries({
    pointerdown: mouseEvent,
    pointermove: mouseEvent,
    pointerup: mouseEvent,

    mousedown: mouseEvent,
    mousemove: mouseEvent,
    mouseup: mouseEvent,

    mousewheel: wheelEvent,
    keydown: keyboardEvent,
    keyup: keyboardEvent,
    contextmenu: prevent
  }));

  public constructor (private readonly worker: WebWorker) {
    for (const [name] of this.eventHandlers) {
      document.addEventListener(name, this.dispatch);
    }
  }

  private onDispatch (event: Event): void {
    if (!this.paused) {
      const handler = this.eventHandlers.get(event.type as Events) as EventHandler;
      handler(event, event => this.worker.post('EventsTarget::Dispatch', event));
    }
  }

  public dispose (): void {
    this.paused = true;

    for (const [name] of this.eventHandlers) {
      document.removeEventListener(name, this.dispatch);
    }
  }

  public set pause (paused: boolean) {
    this.paused = paused;
  }
}
