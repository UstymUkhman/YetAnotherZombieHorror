import type { Callback } from '@/managers/worker/types';
import WorkerEvents from '@/events/WorkerEvents';

import { CustomEvents } from '@/events/CustomEvents';
import type Worker from '@/managers/worker';
import { Config } from '@/config';

class Events extends CustomEvents
{
  private workerEvents?: WorkerEvents;

  public createWorkerEvents (worker: Worker): void {
    this.workerEvents = new WorkerEvents(worker);
  }

  public override add (name: string, callback: EventCallback, worker = false): void {
    Config.WORKER && worker
      ? this.workerEvents?.add(name, callback as Callback)
      : super.add(name, callback as EventCallback);
  }

  public override dispatch (name: string, data: unknown = null, worker = false): void {
    Config.WORKER && worker
      ? WorkerEvents.dispatch(name, data)
      : super.dispatch(name, data);
  }

  public override remove (name: string, worker = false): void {
    Config.WORKER && worker
      ? this.workerEvents?.remove(name)
      : super.remove(name);
  }

  public override dispose (): void {
    super.dispose();
  }
}

export type EventCallback = (event: GameEvent) => void;

export class GameEvent extends CustomEvent<unknown> {
  public data: unknown = null;
}

export const GameEvents = new Events();
