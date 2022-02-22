import { getRandomCoord } from '@/worker/getRandomCoord';
import { Vector2 } from 'three/src/math/Vector2';

import LevelScene from '@/scenes/LevelScene';
import { randomInt } from '@/utils/Number';
import Configs from '@/configs';

export default class Coords
{
  private static readonly levelCoords = new Vector2();
  private static readonly coords: Array<LevelCoords> = [];

  private static readonly ammount = Configs.RandomCoords.ammount;
  private static readonly lastIndex = Configs.RandomCoords.ammount - 1;
  private static readonly distance = Configs.RandomCoords.playerDistance ** 2;

  public static getRandomLevelCoords (player: Vector2): LevelCoords {
    let distance = Coords.setRandomCoords(player);

    while (distance < Coords.distance) {
      distance = Coords.setRandomCoords(player);
    }

    return Coords.levelCoords.toArray();
  }

  public static addLevelCoords (coords: LevelCoords): boolean {
    Coords.coords.push(coords);
    console.log(Coords.coords.length, Coords.ammount);
    return Coords.coords.length === Coords.ammount;
  }

  private static setRandomCoords (player: Vector2): number {
    const coords = Coords.coords[randomInt(0, Coords.lastIndex)];
    Coords.levelCoords.fromArray(coords);
    return Coords.levelCoords.distanceToSquared(player);
  }

  public static fillRandomLevelCoords (): void {
    for (let a = Coords.ammount; a--;) {
      Coords.coords.push(getRandomCoord({
        minCoords: LevelScene.minCoords,
        maxCoords: LevelScene.maxCoords,
        portals: LevelScene.portals,
        bounds: LevelScene.bounds
      }));
    }
  }
}
