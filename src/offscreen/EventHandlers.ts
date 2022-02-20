import type { EventHandler, EventCallback, ActiveKeys, Touches } from '@/offscreen/types';
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

// Wheel Event:

export const wheelEvent = eventPropsHandler(['deltaY']);

// Mouse Events:

export const mouseEvent = eventPropsHandler([
  'button', 'movementX', 'movementY'
]);

// Keyboard Events:

const onKeyboardEvent = eventPropsHandler(['code']);

const keys: ActiveKeys = Object.freeze({
  'KeyW'      : true,
  'KeyD'      : true,
  'KeyS'      : true,
  'KeyA'      : true,

  'KeyQ'      : true,
  'KeyE'      : true,
  'KeyC'      : true,
  'KeyV'      : true,

  'KeyR'      : true,
  'ShiftLeft' : true
});

export function keyboardEvent (event: Event, callback: EventCallback): void {
  if (!keys[(event as KeyboardEvent).code]) return;

  event.preventDefault();
  onKeyboardEvent(event, callback);
}

// Touch Events:

export function touchEvent (event: Event, callback: EventCallback): void {
  const eventTouches = (event as TouchEvent).touches;
  const touches: Touches = [];

  for (let t = eventTouches.length; t--;) {
    const { pageX, pageY } = eventTouches[t];
    touches.push({ pageX, pageY });
  }

  callback({ type: event.type, touches });
}

export const prevent = (event: Event): void =>
  event.preventDefault();
