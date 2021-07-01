import Settings from '@/config/settings';

test('Settings', () => {
  expect(typeof Settings.dynamicClouds).toStrictEqual('boolean');
  expect(typeof Settings.ammoPhysics).toStrictEqual('boolean');
  expect(typeof Settings.fpCamera).toStrictEqual('boolean');
  expect(typeof Settings.bakedFog).toStrictEqual('boolean');
});
