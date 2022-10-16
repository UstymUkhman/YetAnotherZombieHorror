import { describe, test, expect } from 'vitest';
import Physics from '@/settings/physics.json';
import Settings from '@/settings';

describe('Settings', () => {
  test('Environment', () => {
    expect(typeof Settings.getEnvironmentValue('raining')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('lighting')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('raindrops')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('softParticles')).toStrictEqual('boolean');

    expect(typeof Settings.getEnvironmentValue('fog')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('bakedFog')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('volumetricFog')).toStrictEqual('boolean');

    expect(Settings.getEnvironmentValue('clouds')).toBeLessThanOrEqual(300);
    expect(Settings.getEnvironmentValue('clouds')).toBeGreaterThanOrEqual(100);
    expect(typeof Settings.getEnvironmentValue('clouds')).toStrictEqual('number');
    expect(typeof Settings.getEnvironmentValue('dynamicClouds')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('physicalLights')).toStrictEqual('boolean');
  });

  test('Physics', () => {
    expect(typeof Physics.ammo).toStrictEqual('boolean');
  });
});
