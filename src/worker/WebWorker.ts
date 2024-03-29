import type { EventData, EventParams, Callback } from '@/worker/types';
import WorkerManager from '@/worker/WorkerManager?worker';

export default class WebWorker
{
  private worker = new WorkerManager();
  private events: Map<string, EventData> = new Map();

  public constructor () {
    this.worker.onmessage = this.onMessage.bind(this);
    this.worker.onerror = this.onError.bind(this);
  }

  public add (event: string, callback: Callback, params?: EventParams): void {
    this.events.set(event, { callback, params });
  }

  public transfer (element: Transferable, params?: EventParams): void {
    this.worker.postMessage({ event: 'Offscreen::Transfer',
      params: { element, ...params }
    }, [element]);
  }

  public post (event: string, params?: EventParams): void {
    const eventParams = this.events.get(event)?.params;

    this.worker.postMessage({ event, params: {
      ...eventParams, ...params
    }});
  }

  private onMessage (event: MessageEvent): void {
    const { name, response } = event.data;
    this.events.get(name)?.callback({ data: response });
  }

  private onError (error: ErrorEvent): void {
    console.error(error);
  }

  public remove (event: string): void {
    this.events.delete(event);
  }

  public dispose (): void {
    this.worker.onmessage =
      this.worker.onerror = null;

    this.events.clear();
  }

  public clear (): void {
    this.events.clear();
  }
}
