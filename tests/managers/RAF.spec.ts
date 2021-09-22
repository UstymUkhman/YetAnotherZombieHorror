import RAF from '@/managers/RAF';

describe('Music', () => {
  const call = () => void 0;

  test('Create', () => {
    expect(RAF).toBeDefined();
  });

  test('add', () => {
    const add = jest.fn(RAF.add.bind(RAF, call));
    add();
    expect(add).toHaveReturnedWith(undefined);

    add();
    expect(add).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const RAFPrototype = Object.getPrototypeOf(RAF);
    const update = jest.fn(RAFPrototype.update.bind(RAF));

    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('remove', () => {
    const remove = jest.fn(RAF.remove.bind(RAF, call));
    remove();
    expect(remove).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(RAF.dispose.bind(RAF));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    RAF.pause = true;
    expect(RAF.pause).toStrictEqual(undefined);

    RAF.pause = false;
    expect(RAF.pause).toStrictEqual(undefined);

    RAF.pause = true;
    expect(RAF.pause).toStrictEqual(undefined);
  });
});
