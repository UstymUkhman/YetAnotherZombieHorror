const copyEventProps = (event: Event, props: Array<string>, data: EventData): void => {
  for (const prop of props) {
    const name = prop as keyof Event;
    data[name] = event[name];
  }
};

const eventPropsHandler = (props: Array<string>): EventHandler =>
  (event: Event, callback: EventCallback) => {
    const data: EventData = { type: event.type };

    copyEventProps(event, props, data);
    callback(data);
  };

/* export const stopPropagation = (event: Event): void =>
  event.stopPropagation(); */

export const preventDefault = (event: Event): void =>
  event.preventDefault();

// Mouse Events:

type EventData = Record<string, unknown>;
export type EventCallback = (data: EventData) => void;
type EventHandler = (event: Event, callback: EventCallback) => void;

export const onMouseEvent = eventPropsHandler([
  'button' // , 'pointerType', 'pointerId',
  // 'ctrlKey', 'metaKey', 'shiftKey',
  // 'clientX', 'clientY',
  // 'pageX', 'pageY'
]);

// Wheel Events:

const wheelEvent = eventPropsHandler([
  'deltaX', 'deltaY'
]);

export function onWheelEvent (event: Event, callback: EventCallback): void {
  event.preventDefault();
  wheelEvent(event, callback);
}

// Keyboard Events:

const keyboardEvent = eventPropsHandler([
  'code' //, 'ctrlKey', 'metaKey', 'shiftKey', 'keyCode'
]);

type KeyboardCode = Readonly<KeyboardEvent['code']>;
type ActiveKeys = Record<KeyboardCode, boolean>;

const keys: ActiveKeys = Object.freeze({
  // 'ArrowLeft' : true,
  // 'ArrowUp'   : true,
  // 'ArrowRight': true,
  // 'ArrowDown' : true
});

export function onKeyboardEvent (event: Event, callback: EventCallback): void {
  if (!keys[(event as KeyboardEvent).code]) return;

  event.preventDefault();
  keyboardEvent(event, callback);
}

// Touch Events:

type Touches = Array<Record<'pageX' | 'pageY', number>>;

export function onTouchEvent (event: Event, callback: EventCallback): void {
  const eventTouches = (event as TouchEvent).touches;
  const touches: Touches = [];

  for (let t = eventTouches.length; t--;) {
    const { pageX, pageY } = eventTouches[t];
    touches.push({ pageX, pageY });
  }

  callback({ type: event.type, touches });
}
