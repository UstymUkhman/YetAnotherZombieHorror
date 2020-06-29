import Player from '@assets/settings/player.json';
import Enemy from '@assets/settings/enemy.json';

declare const global: any;
global.PRODUCTION = false;
global.VERSION = '0.1.0';

import { Settings } from '@/utils/Settings';

describe('Settings', () => {
  test('Constants', () => {
    expect(Settings.APP).toStrictEqual(false);
    expect(Settings.DEBUG).toStrictEqual(true);
    expect(typeof Settings.VERSION).toStrictEqual('string');
  });

  test('Characters', () => {
    expect(Settings.Enemy).toStrictEqual(Enemy);
    expect(Settings.Player).toStrictEqual(Player);
  });

  test('Frozen', () => {
    expect(() => { Settings.DEBUG = false; }).toThrow(TypeError);
    expect(() => { delete (Settings.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Settings.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
  });
});
