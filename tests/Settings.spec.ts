import { describe, test, expect } from 'vitest';
import Physics from '@/settings/physics.json';

import Settings from '@/settings';
import Configs from '@/configs';

describe('Settings', () => {
  test('Performance', () => {
    expect(typeof Settings.getPerformanceValue('bullet')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('bulletPath')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('bulletHoles')).toStrictEqual('boolean');

    expect(typeof Settings.getPerformanceValue('raining')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('lighting')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('raindrops')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('softParticles')).toStrictEqual('boolean');

    expect(typeof Settings.getPerformanceValue('fog')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('bakedFog')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('volumetricFog')).toStrictEqual('boolean');

    expect(Settings.getPerformanceValue('clouds')).toBeLessThanOrEqual(300);
    expect(Settings.getPerformanceValue('clouds')).toBeGreaterThanOrEqual(0.0);
    expect(typeof Settings.getPerformanceValue('clouds')).toStrictEqual('number');
    expect(typeof Settings.getPerformanceValue('dynamicClouds')).toStrictEqual('boolean');
    expect(typeof Settings.getPerformanceValue('physicalLights')).toStrictEqual('boolean');
  });

  test('Enemy', () => {
    expect(typeof Configs.Gameplay.enemy.canLose).toStrictEqual('boolean');
    expect(typeof Configs.Gameplay.enemy.immune).toStrictEqual('boolean');
  });

  test('Enemy.damage', () => {
    expect(typeof Configs.Gameplay.damage.enemy.strong).toStrictEqual('number');
    expect(Configs.Gameplay.damage.enemy.strong).toBeLessThanOrEqual(50);
    expect(Configs.Gameplay.damage.enemy.strong).toBeGreaterThan(0);

    expect(typeof Configs.Gameplay.damage.enemy.soft).toStrictEqual('number');
    expect(Configs.Gameplay.damage.enemy.soft).toBeLessThanOrEqual(25);
    expect(Configs.Gameplay.damage.enemy.soft).toBeGreaterThan(0);
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

  test('Rifle.spawn', () => {
    expect(typeof Configs.Gameplay.rifleSpawn).toStrictEqual('number');
    expect(Configs.Gameplay.rifleSpawn).toBeLessThanOrEqual(15);
    expect(Configs.Gameplay.rifleSpawn).toBeGreaterThan(0);
  });

  test('Physics', () => {
    expect(typeof Physics.ammo).toStrictEqual('boolean');
  });
});
