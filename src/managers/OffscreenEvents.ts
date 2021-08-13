import type Worker from '@/managers/worker';

import {
  onMouseEvent, onKeyboardEvent,
  preventDefault // , stopPropagation
} from '@/managers/EventHandlers';

// type Handler = (event: Event, data: EventCallback) => void;
// type EventHandlers = Record<string, Handler>;

export default class OffscreenEvents
{
  // private proxyId = 0;
  // public readonly id = this.proxyId++;

  public constructor (private readonly worker: Worker) {
    const eventHandlers = Object.entries({
      contextmenu: preventDefault,

      pointerdown: onMouseEvent,
      pointermove: onMouseEvent,
      pointerup: onMouseEvent,

      mousedown: onMouseEvent,
      mousemove: onMouseEvent,
      mouseup: onMouseEvent,

      keydown: onKeyboardEvent,
      keyup: onKeyboardEvent
    });

    for (const [event, handler] of eventHandlers) {
      document.addEventListener(event, event =>
        handler(event, this.sendEvent.bind(this))
      );
    }
  }

  private sendEvent (event: unknown): void {
    this.worker.post('handleEvent', {
      id: 0, /* this.id,*/ event
    });
  }
}
