import CustomEvents from '@/events/CustomEvents';
import WorkerEvents from '@/events/WorkerEvents';

import type WebWorker from '@/worker/WebWorker';
import type { Callback } from '@/worker/types';
import Configs from '@/configs';

export class GameEvent extends CustomEvent<unknown>
{
  public data: unknown = null;
}

class Events extends CustomEvents
{
  private workerEvents?: WorkerEvents;

  public createWorkerEvents (worker: WebWorker): void {
    this.workerEvents = new WorkerEvents(worker);
  }

  public override add (name: string, callback: EventCallback, worker = false): void {
    Configs.offscreen && worker
      ? this.workerEvents?.add(name, callback as Callback)
      : super.add(name, callback as EventCallback);
  }

  public override dispatch (name: string, data: unknown = null, worker = false): void {
    Configs.worker && worker
      ? WorkerEvents.dispatch(name, data)
      : super.dispatch(name, data);
  }

  public override remove (name: string, worker = false): void {
    Configs.offscreen && worker
      ? this.workerEvents?.remove(name)
      : super.remove(name);
  }

  public override dispose (): void {
    this.workerEvents?.dispose();
    super.dispose();
  }
}

export const GameEvents = new Events();
