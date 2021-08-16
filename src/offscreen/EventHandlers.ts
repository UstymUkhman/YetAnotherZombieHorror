import type { Event } from 'three/src/core/EventDispatcher';

const copyEventProps = (event: Event, props: Array<string>, data: Event): void => {
  for (const prop of props) {
    const name = prop as keyof Event;
    data[name] = event[name];
  }
};

const eventPropsHandler = (props: Array<string>): EventHandler =>
  (event: Event, callback: EventCallback) => {
    const data: Event = { type: event.type };

    copyEventProps(event, props, data);
    callback(data);
  };

export const prevent = (event: Event): void =>
  event.preventDefault();

/* export const stop = (event: Event): void =>
  event.stopPropagation(); */

// Mouse Events:

export type EventCallback = (data: Event) => void;
type EventHandler = (event: Event, callback: EventCallback) => void;

export const mouseEvent = eventPropsHandler([
  'button' // , 'pointerType', 'pointerId',
  // 'ctrlKey', 'metaKey', 'shiftKey',
  // 'clientX', 'clientY',
  // 'pageX', 'pageY'
]);

// Wheel Events:

const onWheelEvent = eventPropsHandler([
  'deltaX', 'deltaY'
]);

export function wheelEvent (event: Event, callback: EventCallback): void {
  event.preventDefault();
  onWheelEvent(event, callback);
}

// Keyboard Events:

const onKeyboardEvent = eventPropsHandler([
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

export function keyboardEvent (event: Event, callback: EventCallback): void {
  if (!keys[(event as KeyboardEvent).code]) return;

  event.preventDefault();
  onKeyboardEvent(event, callback);
}

// Touch Events:

type Touches = Array<Record<'pageX' | 'pageY', number>>;

export function touchEvent (event: Event, callback: EventCallback): void {
  const eventTouches = (event as TouchEvent).touches;
  const touches: Touches = [];

  for (let t = eventTouches.length; t--;) {
    const { pageX, pageY } = eventTouches[t];
    touches.push({ pageX, pageY });
  }

  callback({ type: event.type, touches });
}
