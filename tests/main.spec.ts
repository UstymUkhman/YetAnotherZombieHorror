import { describe, test, expect } from 'vitest';
import Application from '@/main';

describe('Application', () => {
  test('Create', () => {
    expect(Application).toBeDefined();
    expect((Application as { target?: HTMLElement }).target).not.toStrictEqual(null);
  });
});
