import Settings from '@/config/settings';

test('Settings', () => {
  expect(typeof Settings.dynamicClouds).toStrictEqual('boolean');
  expect(typeof Settings.softParticles).toStrictEqual('boolean');
  expect(typeof Settings.ammoPhysics).toStrictEqual('boolean');

  expect(typeof Settings.bakedFog).toStrictEqual('boolean');
  expect(typeof Settings.raining).toStrictEqual('boolean');
});
