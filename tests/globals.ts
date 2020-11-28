(global as any).PRODUCTION = false;
(global as any).BUILD = '0.2.0';

describe('globals', () => {
  test('PRODUCTION', () => {
    expect(typeof (global as any).PRODUCTION).toStrictEqual('boolean');
  });

  test('BUILD', () => {
    expect(typeof (global as any).BUILD).toStrictEqual('string');
  });
});
