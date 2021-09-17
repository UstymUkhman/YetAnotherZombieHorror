import Application from '@/main';

jest.mock('@/App.svelte', () => {
  return jest.fn().mockImplementation(() => {
    return { target: document.body };
  });
});

describe('Application', () => {
  test('Create', () => {
    expect(Application).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Application as any).target).toStrictEqual(document.body);
  });
});
