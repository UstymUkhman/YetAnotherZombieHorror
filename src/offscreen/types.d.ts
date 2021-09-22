import type { Event, EventListener as Listener } from 'three/src/core/EventDispatcher';

export type EventOptions = boolean | AddEventListenerOptions;
export type EventListener = Listener<Event, T, this>;

export type OffscreenParams = {
  element: OffscreenCanvas,
  pixelRatio: number,
  id: number
};

export type SizeParams = {
  height: number,
  width: number
};
