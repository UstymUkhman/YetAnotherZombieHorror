export const worker: Worker = self as never;

worker.onmessage = (message => {
  // worker.postMessage({ });
  console.log(message.data);
});

worker.onerror = (error => {
  console.error(error);
});
