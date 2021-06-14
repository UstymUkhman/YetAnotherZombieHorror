import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import Limbo from '@/environment/Limbo';

export default class Portals
{
  private readonly offset = new Vector2();
  private readonly player = new Vector3();

  private readonly portals = Limbo.portals;
  private readonly position = new Vector3();

  private readonly triggers = this.portals
    .filter((_, c) => !(c % 2))
    .map((coords, c, portals) => coords[0] + (
        +(c < portals.length / 2) * -2 + 1
      ) * -0.05
    );

  private updatePosition (x: number, z = x): void {
    const bound = this.portals[x][0];
    const step = Math.sign(bound) * -0.1;

    this.position.set(
      this.portals[x][0] - this.offset.x + step,
      this.player.y,
      this.portals[z][1] + this.offset.y
    );
  }

  private bottomPortalArea (): boolean {
    if (this.player.z < this.portals[2][1]) {
      if (this.player.x <= this.triggers[1]) {
        this.offset.set(
          -(this.portals[2][0] - this.player.x),
          this.portals[2][1] - this.player.z
        );

        this.updatePosition(0, 1);
        return true;
      }

      else if (this.player.x >= this.triggers[2]) {
        this.offset.set(
          this.player.x - this.portals[4][0],
          this.portals[5][1] - this.player.z
        );

        this.updatePosition(6);
        return true;
      }
    }

    return false;
  }

  private topPortalArea (): boolean {
    if (this.player.z > this.portals[1][1]) {
      if (this.player.x <= this.triggers[0]) {
        this.offset.set(
          this.portals[0][0] - this.player.x,
          this.portals[0][1] - this.player.z
        );

        this.updatePosition(2, 3);
        return true;
      }

      else if (this.player.x >= this.triggers[3]) {
        this.offset.set(
          this.player.x - this.portals[6][0],
          this.portals[7][1] - this.player.z
        );

        this.updatePosition(4);
        return true;
      }
    }

    return false;
  }

  public portalPassed (player: Vector3): boolean {
    this.player.copy(player);
    return this.topPortalArea() || this.bottomPortalArea();
  }

  public get playerPosition (): Vector3 {
    return this.position;
  }
}
