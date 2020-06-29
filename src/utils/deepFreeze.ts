type FrozenObject = { [propriety: string]: unknown };

const deepFreeze = (object: FrozenObject): FrozenObject => {
  Object.freeze(object);

  const proprieties = Object.getOwnPropertyNames(object);

  for (const name in proprieties) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = object[proprieties[name]];
    const canFreeze = typeof value === 'object' || typeof value === 'function';

    if (value && canFreeze && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return object;
};

export default deepFreeze;
