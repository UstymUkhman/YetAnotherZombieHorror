/// <reference lib="WebWorker" />

export type EventParams = Record<string, unknown>;
export type Callback    = ({ data: unknown }) => void;
export type EventData   = { callback: Callback, params?: EventParams };
