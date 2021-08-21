/// <reference lib="WebWorker" />

export type Callback    = (data: unknown) => void;
export type EventParams = Record<string, unknown>;
export type EventData   = { callback: Callback, params?: EventParams };
