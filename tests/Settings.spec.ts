import Physics from '@/settings/physics.json';
import Settings from '@/settings';

describe('Settings', () => {
  test('Environment', () => {
    expect(typeof Settings.getValue('raining')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('lighting')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('raindrops')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('softParticles')).toStrictEqual('boolean');

    expect(typeof Settings.getValue('fog')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('bakedFog')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('volumetricFog')).toStrictEqual('boolean');

    expect(Settings.getValue('clouds')).toBeLessThanOrEqual(300);
    expect(Settings.getValue('clouds')).toBeGreaterThanOrEqual(100);
    expect(typeof Settings.getValue('clouds')).toStrictEqual('number');
    expect(typeof Settings.getValue('dynamicClouds')).toStrictEqual('boolean');
    expect(typeof Settings.getValue('physicalLights')).toStrictEqual('boolean');
  });

  test('Physics', () => {
    expect(typeof Physics.ammo).toStrictEqual('boolean');
  });
});
