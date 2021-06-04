/* eslint-disable @typescript-eslint/no-explicit-any */
(global as any).PRODUCTION = false;
(global as any).BUILD = '0.3.5';

describe('globals', () => {
  test('PRODUCTION', () => {
    expect(typeof (global as any).PRODUCTION).toStrictEqual('boolean');
  });

  test('BUILD', () => {
    expect(typeof (global as any).BUILD).toStrictEqual('string');
  });
});

/* eslint-enable @typescript-eslint/no-explicit-any */
