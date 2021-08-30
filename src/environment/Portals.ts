import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import LevelScene from '@/environment/LevelScene';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';

import { GameEvents } from '@/events/GameEvents';
import { Assets } from '@/loaders/AssetsLoader';
import { Mesh } from 'three/src/objects/Mesh';

import { GLSL3 } from 'three/src/constants';
import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import Configs from '@/configs';

export default class Portals
{
  private readonly coords = LevelScene.portals;
  private readonly position = new Vector3();

  private readonly player = new Vector3();
  private readonly offset = new Vector2();

  private material!: ShaderMaterial;

  private readonly triggers = this.coords
    .filter((_, c) => !(c % 2))
    .map((coords, c, portals) => coords[0] + (
        +(c < portals.length / 2) * -2 + 1
      ) * -0.1
    );

  public constructor () {
    this.createPortals();
  }

  private async createPortals (): Promise<void> {
    this.material = await this.createMaterial();

    for (let p = 0, t = 0; t < this.triggers.length; p += 2, t++) {
      const z1 = this.coords[p][1];
      const z2 = this.coords[p + 1][1];

      const center = Math.abs(z1 - z2) / 2;
      const orientation = +(t < 2) * 2 -1;
      const radius = center + 0.52;

      const portal = new Mesh(new CircleGeometry(
        radius, 32, 0.0, Math.PI
      ), this.material);

      portal.renderOrder = 2.0;
      portal.position.x = this.triggers[t];
      portal.rotation.y = PI.d2 * orientation;

      portal.position.z = z1 + center * -orientation;
      portal.position.z += Configs.Level.portalsOffset[t];

      GameEvents.dispatch('Level::AddObject', portal);
    }
  }

  private async createMaterial (): Promise<ShaderMaterial> {
    // Development imports:
    /* const vertPortal = await (await import('../shaders/portal/main.vert')).default;
    const fragPortal = await (await import('../shaders/portal/main.frag')).default; */

    // Production imports:
    const vertPortal = await Assets.Loader.loadShader('portal/main.vert');
    const fragPortal = await Assets.Loader.loadShader('portal/main.frag');

    const backgroundColor = Color.getClass(Color.PORTAL);
    const spikesColor = Color.getClass(Color.MOON);

    return new ShaderMaterial({
      uniforms: {
        backgroundColor: { value: backgroundColor },
        spikesColor: { value: spikesColor },
        deltaTime: { value: 0.0 }
      },

      fragmentShader: fragPortal,
      vertexShader: vertPortal,

      glslVersion: GLSL3,
      transparent: true,
      depthWrite: false
    });
  }

  private updatePosition (x: number, z = x): void {
    const bound = this.coords[x][0];
    const step = Math.sign(bound) * -0.3;

    this.position.set(
      this.coords[x][0] - this.offset.x + step,
      this.player.y,
      this.coords[z][1] + this.offset.y
    );
  }

  public portalPassed (player: Vector3): boolean {
    this.player.copy(player);
    return this.topPortalArea() || this.bottomPortalArea();
  }

  public get playerPosition (): Vector3 {
    return this.position;
  }

  public update (delta: number): void {
    this.material.uniforms.deltaTime.value += delta / 10;
  }

  private bottomPortalArea (): boolean {
    if (this.player.z < this.coords[2][1]) {
      if (this.player.x <= this.triggers[1]) {
        this.offset.set(
          -(this.coords[2][0] - this.player.x),
          this.coords[2][1] - this.player.z
        );

        this.updatePosition(0, 1);
        return true;
      }

      else if (this.player.x >= this.triggers[2]) {
        this.offset.set(
          this.player.x - this.coords[4][0],
          this.coords[5][1] - this.player.z
        );

        this.updatePosition(6);
        return true;
      }
    }

    return false;
  }

  private topPortalArea (): boolean {
    if (this.player.z > this.coords[1][1]) {
      if (this.player.x <= this.triggers[0]) {
        this.offset.set(
          this.coords[0][0] - this.player.x,
          this.coords[0][1] - this.player.z
        );

        this.updatePosition(2, 3);
        return true;
      }

      else if (this.player.x >= this.triggers[3]) {
        this.offset.set(
          this.player.x - this.coords[6][0],
          this.coords[7][1] - this.player.z
        );

        this.updatePosition(4);
        return true;
      }
    }

    return false;
  }
}
