import { version } from '../package.json';

describe('globals', () => {
  test('PRODUCTION', () => {
    expect(typeof PRODUCTION).toStrictEqual('boolean');
    expect(PRODUCTION).toStrictEqual(false);
  });

  test('STAGING', () => {
    expect(typeof STAGING).toStrictEqual('boolean');
    expect(STAGING).toStrictEqual(false);
  });

  test('BUILD', () => {
    expect(typeof BUILD).toStrictEqual('string');
    expect(BUILD).toStrictEqual(version);
  });
});
