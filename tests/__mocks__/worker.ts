export default class WebWorker {
  public constructor () { }

  public postMessage (message: any, options?: PostMessageOptions | undefined) { return; }

  public onmessage (event: MessageEvent<any>) { return; }

  public onerror (error: ErrorEvent) { return; }
}
