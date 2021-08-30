import WebWorker from '@/worker/WebWorker';

describe('WebWorker', () => {
  const webWorker = new WebWorker();

  test('Create', () => {
    expect(webWorker).toBeInstanceOf(WebWorker);
  });

  test('add', () => {
    const add = jest.fn(webWorker.add.bind(webWorker, 'message', jest.fn));
    add();
    expect(add).toHaveReturnedWith(undefined);
  });

  test('transfer', () => {
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    const transfer = jest.fn(webWorker.transfer.bind(webWorker, canvas as unknown as Transferable));

    transfer();
    expect(transfer).toHaveReturnedWith(undefined);
  });

  test('transfer', () => {
    const post = jest.fn(webWorker.post.bind(webWorker, 'message'));
    post();
    expect(post).toHaveReturnedWith(undefined);
  });

  test('onMessage', () => {
    const event = new MessageEvent('error', {
      data: { name: 'message', response: null }
    });

    const workerPrototype = Object.getPrototypeOf(webWorker);
    const onMessage = jest.fn(workerPrototype.onMessage.bind(workerPrototype, event));

    onMessage(event);
    expect(onMessage).toHaveReturnedWith(undefined);
  });

  test('onError', () => {
    const event = new MessageEvent('error');
    const workerPrototype = Object.getPrototypeOf(webWorker);
    const onError = jest.fn(workerPrototype.onError.bind(workerPrototype, event));

    onError(event);
    expect(onError).toHaveReturnedWith(undefined);
  });

  test('remove', () => {
    const remove = jest.fn(webWorker.remove.bind(webWorker));
    remove('message');
    expect(remove).toHaveReturnedWith(undefined);
  });
});
