import { describe, test, expect } from 'vitest';
import Physics from '@/settings/physics.json';

import Settings from '@/settings';
import Configs from '@/configs';

describe('Settings', () => {
  test('Environment', () => {
    expect(typeof Settings.getEnvironmentValue('bullet')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('bulletPath')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('bulletHoles')).toStrictEqual('boolean');

    expect(typeof Settings.getEnvironmentValue('raining')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('lighting')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('raindrops')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('softParticles')).toStrictEqual('boolean');

    expect(typeof Settings.getEnvironmentValue('fog')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('bakedFog')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('volumetricFog')).toStrictEqual('boolean');

    expect(Settings.getEnvironmentValue('clouds')).toBeLessThanOrEqual(300);
    expect(Settings.getEnvironmentValue('clouds')).toBeGreaterThanOrEqual(0.0);
    expect(typeof Settings.getEnvironmentValue('clouds')).toStrictEqual('number');
    expect(typeof Settings.getEnvironmentValue('dynamicClouds')).toStrictEqual('boolean');
    expect(typeof Settings.getEnvironmentValue('physicalLights')).toStrictEqual('boolean');
  });

  test('Pistol.damage', () => {
    expect(typeof Configs.Gameplay.damage.pistol.head).toStrictEqual('number');
    expect(Configs.Gameplay.damage.pistol.head).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.pistol.head).toBeGreaterThan(0);

    expect(typeof Configs.Gameplay.damage.pistol.body).toStrictEqual('number');
    expect(Configs.Gameplay.damage.pistol.body).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.pistol.body).toBeGreaterThan(0);

    expect(typeof Configs.Gameplay.damage.pistol.leg).toStrictEqual('number');
    expect(Configs.Gameplay.damage.pistol.leg).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.pistol.leg).toBeGreaterThan(0);
  });

  test('Rifle.damage', () => {
    expect(typeof Configs.Gameplay.damage.rifle.head).toStrictEqual('number');
    expect(Configs.Gameplay.damage.rifle.head).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.rifle.head).toBeGreaterThan(0);

    expect(typeof Configs.Gameplay.damage.rifle.body).toStrictEqual('number');
    expect(Configs.Gameplay.damage.rifle.body).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.rifle.body).toBeGreaterThan(0);

    expect(typeof Configs.Gameplay.damage.rifle.leg).toStrictEqual('number');
    expect(Configs.Gameplay.damage.rifle.leg).toBeLessThanOrEqual(100);
    expect(Configs.Gameplay.damage.rifle.leg).toBeGreaterThan(0);
  });

  test('Physics', () => {
    expect(typeof Physics.ammo).toStrictEqual('boolean');
  });
});
