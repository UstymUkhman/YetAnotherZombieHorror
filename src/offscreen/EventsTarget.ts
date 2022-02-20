import type { EventListener, EventOptions } from '@/offscreen/types';
import { EventDispatcher } from 'three/src/core/EventDispatcher';
import type { Event } from 'three/src/core/EventDispatcher';

class EventsTarget extends EventDispatcher
{
  private readonly noop = (): void => void 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override addEventListener (type: string, listener: EventListener, options?: EventOptions) {
    super.addEventListener(type, listener);
  }

  public override dispatchEvent (event: Event): void {
    event.stopPropagation = this.noop;
    event.preventDefault = this.noop;
    super.dispatchEvent(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override removeEventListener (type: string, listener: EventListener, options?: EventOptions) {
    super.removeEventListener(type, listener);
  }
}

export default new EventsTarget();
