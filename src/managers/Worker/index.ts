// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./worker.d.ts" />

import Worker from 'worker-loader!./worker';

export default class WorkerManager {
  private static loader = new Worker();

  public static init (): void {
    this.loader.onmessage = this.onMessage.bind(this);
    this.loader.onerror = this.onError.bind(this);
    // this.loader.postMessage({ });
  }

  private static onMessage (message: MessageEvent): void {
    console.log(message.data);
  }

  private static onError (error: ErrorEvent): void {
    console.error(error);
  }
}
