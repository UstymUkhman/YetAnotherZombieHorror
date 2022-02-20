import type { Event, EventListener as Listener } from 'three/src/core/EventDispatcher';

type EventHandler = (event: Event, callback: EventCallback) => void;
type Touches = Array<Record<'pageX' | 'pageY', number>>;
type EventOptions = boolean | AddEventListenerOptions;

type KeyboardCode = Readonly<KeyboardEvent['code']>;
type ActiveKeys = Record<KeyboardCode, boolean>;

type EventHandlers = Array<[Events, EventHandler]>;
type EventListeners = Map<Events, EventHandler>;

type EventListener = Listener<Event, T, this>;
type EventCallback = (event: Event) => void;

type OffscreenParams = {
  element: OffscreenCanvas,
  pixelRatio: number,
  id: number
};

type SizeParams = {
  height: number,
  width: number
};

type Events =
  'pointerdown' |
  'pointermove' |
  'pointerup'   |

  'mousedown'   |
  'mousemove'   |
  'mouseup'     |

  'mousewheel'  |
  'keydown'     |
  'keyup'       |
  'contextmenu'
;
