import { describe, test, expect } from 'vitest';
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

  test('DEBUG', () => {
    expect(typeof DEBUG).toStrictEqual('boolean');
    expect(DEBUG).toStrictEqual(false);
  });

  test('BUILD', () => {
    expect(typeof BUILD).toStrictEqual('string');
    expect(BUILD).toStrictEqual(version);
  });

  test('TEST', () => {
    expect(typeof TEST).toStrictEqual('boolean');
    expect(TEST).toStrictEqual(false);
  });
});
