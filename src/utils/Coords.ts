import { getRandomCoord } from '@/worker/getRandomCoord';
import { fisherYates, random } from '@/utils/Array';
import type { LevelCoords } from '@/scenes/types';
import { Vector2 } from 'three/src/math/Vector2';
import LevelScene from '@/scenes/LevelScene';
import Configs from '@/configs';

export default class Coords
{
  private static readonly levelCoords = new Vector2();
  private static readonly playerCoords = new Vector2();
  private static readonly coords: Array<LevelCoords> = [];

  private static readonly ammount = Configs.RandomCoords.ammount;
  private static readonly distance = Configs.RandomCoords.playerDistance ** 2;

  public static getRandomLevelCoords (x: number, z: number, distance?: number): LevelCoords {
    Coords.playerCoords.set(x, z);

    do distance = Coords.setRandomCoords();
    while (distance < Coords.distance);

    fisherYates(Coords.coords);
    return Coords.levelCoords.toArray();
  }

  public static addLevelCoords (coords: LevelCoords): boolean {
    return Coords.coords.push(coords) === Coords.ammount;
  }

  private static setRandomCoords (): number {
    Coords.levelCoords.fromArray(random(Coords.coords));
    return Coords.levelCoords.distanceToSquared(Coords.playerCoords);
  }

  public static fillRandomLevelCoords (): void {
    for (let a = Coords.ammount; a--;)
      Coords.coords.push(getRandomCoord({
        minCoords: LevelScene.minCoords,
        maxCoords: LevelScene.maxCoords,
        portals: LevelScene.portals,
        bounds: LevelScene.bounds
      }));
  }
}
