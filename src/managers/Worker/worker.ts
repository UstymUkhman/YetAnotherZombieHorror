export const worker: Worker = self as never;

worker.onmessage = ((message: MessageEvent) => {
  // worker.postMessage({ });
  console.log(message.data);
});

worker.onerror = ((error: ErrorEvent) => {
  console.error(error);
});
