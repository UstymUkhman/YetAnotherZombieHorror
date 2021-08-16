import WorkerManager from '@/worker/WorkerManager';
import type WebWorker from '@/worker/WebWorker';
import type { Callback } from '@/worker/types';

export default class WorkerEvents
{
  public constructor (private readonly worker: WebWorker) {}

  public add (name: string, callback: Callback): void {
    this.worker.add(name, callback);
  }

  public static dispatch (name: string, data: unknown = null): void {
    WorkerManager.postMessage({ name, response: data });
  }

  public remove (name: string): void {
    this.worker.remove(name);
  }
}
