import { mouseEvent, wheelEvent, keyboardEvent, prevent } from '@/offscreen/EventHandlers';
import type { Event } from 'three/src/core/EventDispatcher';
import type WebWorker from '@/worker/WebWorker';

export default class OffscreenEvents
{
  private readonly eventHandlers = Object.entries({
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
  });

  public constructor (private readonly worker: WebWorker) {
    for (const [event, handler] of this.eventHandlers) {
      document.addEventListener(event, event =>
        handler(event, this.dispatch.bind(this))
      );
    }
  }

  private dispatch (event: Event): void {
    this.worker.post('EventsTarget::Dispatch', event);
  }

  public dispose (): void {
    for (const [event, handler] of this.eventHandlers) {
      document.removeEventListener(event, event =>
        handler(event, this.dispatch.bind(this))
      );
    }
  }
}
