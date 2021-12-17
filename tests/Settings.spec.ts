import Settings from '@/settings';

describe('Settings', () => {
  test('Defaults', () => {
    expect(typeof Settings.ammoPhysics).toStrictEqual('boolean');
    expect(typeof Settings.physicalLights).toStrictEqual('boolean');

    expect(typeof Settings.raining).toStrictEqual('boolean');
    expect(typeof Settings.lighting).toStrictEqual('boolean');
    expect(typeof Settings.raindrops).toStrictEqual('boolean');
    expect(typeof Settings.softParticles).toStrictEqual('boolean');

    expect(typeof Settings.fog).toStrictEqual('boolean');
    expect(typeof Settings.bakedFog).toStrictEqual('boolean');
    expect(typeof Settings.volumetricFog).toStrictEqual('boolean');

    expect(Settings.clouds).toBeLessThanOrEqual(300);
    expect(Settings.clouds).toBeGreaterThanOrEqual(100);
    expect(typeof Settings.clouds).toStrictEqual('number');
    expect(typeof Settings.dynamicClouds).toStrictEqual('boolean');
  });
});
