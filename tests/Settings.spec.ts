import Performance from '@/settings/performance.json';

import { describe, test, expect } from 'vitest';
import Physics from '@/settings/physics.json';

import Settings from '@/settings';
import Configs from '@/configs';

import {
  Quality,
  MAX_CLOUDS,
  DEFAULT_QUALITY,
  PERFORMANCE_LENGTH,
  DefaultPerformance
} from '@/settings/constants';

describe('Settings', () => {
  test('Constants', () => {
    expect(DefaultPerformance).toStrictEqual(Performance[0]);
    expect(PERFORMANCE_LENGTH).toStrictEqual(13.0);

    expect(DEFAULT_QUALITY).toStrictEqual(0.0);
    expect(MAX_CLOUDS).toStrictEqual(300.0);

    expect(Quality.LOW).toStrictEqual(13.0);
    expect(Quality.MEDIUM).toStrictEqual(14.0);
    expect(Quality.HIGH).toStrictEqual(15.0);
  });

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

  test('Performance.LOW', () => {
    expect(Performance[0].bullet).toStrictEqual(true);
    expect(Performance[0].bulletPath).toStrictEqual(false);
    expect(Performance[0].bulletHoles).toStrictEqual(false);

    expect(Performance[0].raining).toStrictEqual(true);
    expect(Performance[0].lighting).toStrictEqual(false);
    expect(Performance[0].raindrops).toStrictEqual(false);
    expect(Performance[0].softParticles).toStrictEqual(false);

    expect(Performance[0].fog).toStrictEqual(true);
    expect(Performance[0].bakedFog).toStrictEqual(false);
    expect(Performance[0].volumetricFog).toStrictEqual(false);

    expect(Performance[0].clouds).toStrictEqual(0.0);
    expect(Performance[0].dynamicClouds).toStrictEqual(false);
    expect(Performance[0].physicalLights).toStrictEqual(false);
  });

  test('Performance.MEDIUM', () => {
    expect(Performance[1].bullet).toStrictEqual(true);
    expect(Performance[1].bulletPath).toStrictEqual(false);
    expect(Performance[1].bulletHoles).toStrictEqual(true);

    expect(Performance[1].raining).toStrictEqual(true);
    expect(Performance[1].lighting).toStrictEqual(true);
    expect(Performance[1].raindrops).toStrictEqual(true);
    expect(Performance[1].softParticles).toStrictEqual(false);

    expect(Performance[1].fog).toStrictEqual(false);
    expect(Performance[1].bakedFog).toStrictEqual(false);
    expect(Performance[1].volumetricFog).toStrictEqual(false);

    expect(Performance[1].clouds).toStrictEqual(300.0);
    expect(Performance[1].dynamicClouds).toStrictEqual(true);
    expect(Performance[1].physicalLights).toStrictEqual(false);
  });

  test('Performance.HIGH', () => {
    expect(Performance[2].bullet).toStrictEqual(true);
    expect(Performance[2].bulletPath).toStrictEqual(true);
    expect(Performance[2].bulletHoles).toStrictEqual(true);

    expect(Performance[2].raining).toStrictEqual(true);
    expect(Performance[2].lighting).toStrictEqual(true);
    expect(Performance[2].raindrops).toStrictEqual(true);
    expect(Performance[2].softParticles).toStrictEqual(true);

    expect(Performance[2].fog).toStrictEqual(true);
    expect(Performance[2].bakedFog).toStrictEqual(true);
    expect(Performance[2].volumetricFog).toStrictEqual(true);

    expect(Performance[2].clouds).toStrictEqual(1.0);
    expect(Performance[0].dynamicClouds).toStrictEqual(false);
    expect(Performance[2].physicalLights).toStrictEqual(true);
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
