import { mouseEvent, wheelEvent, keyboardEvent, prevent } from '@/offscreen/EventHandlers';
import type { Event } from 'three/src/core/EventDispatcher';
import type WebWorker from '@/worker/WebWorker';

export default class OffscreenEvents
{
  public constructor (private readonly worker: WebWorker) {
    const eventHandlers = Object.entries({
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

    for (const [event, handler] of eventHandlers) {
      document.addEventListener(event, event =>
        handler(event, this.dispatch.bind(this))
      );
    }
  }

  private dispatch (event: Event): void {
    this.worker.post('EventsTarget::Dispatch', event);
  }
}
