import type { Callback } from '@/managers/worker/types';
import { worker } from '@/managers/worker/worker';
import type Worker from '@/managers/worker';

export default class WorkerEvents
{
  public constructor (private readonly worker: Worker) {}

  public add (name: string, callback: Callback): void {
    this.worker.add(name, callback);
  }

  public static dispatch (name: string, data: unknown = null): void {
    worker.postMessage({ name, response: data });
  }

  public remove (name: string): void {
    this.worker.remove(name);
  }
}
