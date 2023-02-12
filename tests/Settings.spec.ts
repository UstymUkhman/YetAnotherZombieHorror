import { describe, test, expect } from 'vitest';
import Physics from '@/settings/physics.json';
import Visuals from '@/settings/visuals.json';
import Settings from '@/settings';
import Configs from '@/configs';

import {
  Quality,
  MAX_CLOUDS,
  DefaultVisuals,
  VISUALS_LENGTH,
  DEFAULT_QUALITY
} from '@/settings/constants';

describe('Settings', () => {
  test('Constants', () => {
    expect(DefaultVisuals).toStrictEqual(Visuals[0]);
    expect(VISUALS_LENGTH).toStrictEqual(12.0);

    expect(DEFAULT_QUALITY).toStrictEqual(0.0);
    expect(MAX_CLOUDS).toStrictEqual(300.0);

    expect(Quality.LOW).toStrictEqual(12.0);
    expect(Quality.MEDIUM).toStrictEqual(13.0);
    expect(Quality.HIGH).toStrictEqual(14.0);
  });

  test('Visuals', () => {
    expect(typeof Settings.getVisualValue('bullet')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('bulletPath')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('bulletHoles')).toStrictEqual('boolean');

    expect(typeof Settings.getVisualValue('raining')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('lighting')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('raindrops')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('softParticles')).toStrictEqual('boolean');

    expect(typeof Settings.getVisualValue('fog')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('volumetricFog')).toStrictEqual('boolean');

    expect(Settings.getVisualValue('clouds')).toBeLessThanOrEqual(300);
    expect(Settings.getVisualValue('clouds')).toBeGreaterThanOrEqual(0.0);
    expect(typeof Settings.getVisualValue('clouds')).toStrictEqual('number');
    expect(typeof Settings.getVisualValue('dynamicClouds')).toStrictEqual('boolean');
    expect(typeof Settings.getVisualValue('physicalLights')).toStrictEqual('boolean');
  });

  test('Visuals.LOW', () => {
    expect(Visuals[0].bullet).toStrictEqual(true);
    expect(Visuals[0].bulletPath).toStrictEqual(false);
    expect(Visuals[0].bulletHoles).toStrictEqual(false);

    expect(Visuals[0].raining).toStrictEqual(true);
    expect(Visuals[0].lighting).toStrictEqual(false);
    expect(Visuals[0].raindrops).toStrictEqual(false);
    expect(Visuals[0].softParticles).toStrictEqual(false);

    expect(Visuals[0].fog).toStrictEqual(true);
    expect(Visuals[0].volumetricFog).toStrictEqual(false);

    expect(Visuals[0].clouds).toStrictEqual(0.0);
    expect(Visuals[0].dynamicClouds).toStrictEqual(false);
    expect(Visuals[0].physicalLights).toStrictEqual(false);
  });

  test('Visuals.MEDIUM', () => {
    expect(Visuals[1].bullet).toStrictEqual(true);
    expect(Visuals[1].bulletPath).toStrictEqual(false);
    expect(Visuals[1].bulletHoles).toStrictEqual(true);

    expect(Visuals[1].raining).toStrictEqual(true);
    expect(Visuals[1].lighting).toStrictEqual(true);
    expect(Visuals[1].raindrops).toStrictEqual(true);
    expect(Visuals[1].softParticles).toStrictEqual(false);

    expect(Visuals[1].fog).toStrictEqual(false);
    expect(Visuals[1].volumetricFog).toStrictEqual(false);

    expect(Visuals[1].clouds).toStrictEqual(300.0);
    expect(Visuals[1].dynamicClouds).toStrictEqual(true);
    expect(Visuals[1].physicalLights).toStrictEqual(false);
  });

  test('Visuals.HIGH', () => {
    expect(Visuals[2].bullet).toStrictEqual(true);
    expect(Visuals[2].bulletPath).toStrictEqual(true);
    expect(Visuals[2].bulletHoles).toStrictEqual(true);

    expect(Visuals[2].raining).toStrictEqual(true);
    expect(Visuals[2].lighting).toStrictEqual(true);
    expect(Visuals[2].raindrops).toStrictEqual(true);
    expect(Visuals[2].softParticles).toStrictEqual(true);

    expect(Visuals[2].fog).toStrictEqual(true);
    expect(Visuals[2].volumetricFog).toStrictEqual(true);

    expect(Visuals[2].clouds).toStrictEqual(1.0);
    expect(Visuals[0].dynamicClouds).toStrictEqual(false);
    expect(Visuals[2].physicalLights).toStrictEqual(true);
  });

  test('Enemies.max', () => {
    expect(typeof Configs.Gameplay.maxEnemies).toStrictEqual('number');
    expect(Configs.Gameplay.maxEnemies).toBeLessThanOrEqual(50);
    expect(Configs.Gameplay.maxEnemies).toBeGreaterThan(0);
  });

  test('Rifle.spawn', () => {
    expect(typeof Configs.Gameplay.rifleSpawn).toStrictEqual('number');
    expect(Configs.Gameplay.rifleSpawn).toBeLessThanOrEqual(10);
    expect(Configs.Gameplay.rifleSpawn).toBeGreaterThan(0);
  });

  test('Enemy', () => {
    expect(typeof Configs.Gameplay.enemy.immune).toStrictEqual('boolean');
    expect(typeof Configs.Gameplay.enemy.lose).toStrictEqual('boolean');
    expect(typeof Configs.Gameplay.enemy.walk).toStrictEqual('number');
    expect(typeof Configs.Gameplay.enemy.run).toStrictEqual('number');
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

  test('Physics', () => {
    expect(['ammo', 'bvh'].includes(Physics.engine)).toStrictEqual(true);
  });
});
