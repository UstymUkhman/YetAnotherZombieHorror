import type { Event } from 'three/src/core/EventDispatcher';

export type EventListener = (event: Event) => boolean | void;
export type EventOptions = boolean | AddEventListenerOptions;

export type OffscreenParams = {
  element: OffscreenCanvas,
  pixelRatio: number,
  id: number
};

export type SizeParams = {
  height: number,
  width: number
};
