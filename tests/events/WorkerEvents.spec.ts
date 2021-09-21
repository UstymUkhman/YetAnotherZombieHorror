import WorkerEvents from '@/events/WorkerEvents';
import WebWorker from '@/worker/WebWorker';

describe('WorkerEvents', () => {
  const callback = () => void 0;
  const worker = new WebWorker();
  const events = new WorkerEvents(worker);

  test('Create', () => {
    expect(WorkerEvents).toBeDefined();
    expect(events).toBeInstanceOf(WorkerEvents);
  });

  test('add', () => {
    const add = jest.fn(events.add.bind(events, 'event', callback));
    add();
    expect(add).toHaveBeenCalled();
  });

  test('remove', () => {
    const remove = jest.fn(events.remove.bind(events, 'event'));
    remove();
    expect(remove).toHaveReturnedWith(undefined);
  });
});
