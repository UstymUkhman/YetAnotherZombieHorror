type WebGLRenderer = import('three/src/renderers/WebGLRenderer').WebGLRenderer;
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';

import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { CameraUtils } from 'three/examples/jsm/utils/CameraUtils';
import { LinearFilter, RGBFormat } from 'three/src/constants';
import { CameraObject } from '@/managers/GameCamera';
type Scene = import('three/src/scenes/Scene').Scene;

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Mesh } from 'three/src/objects/Mesh';
import Limbo from '@/environment/Limbo';
import { PI } from '@/utils/Number';
import { Config } from '@/config';

const TEXTURE_SIZE = 2 ** 12;
const TRIGGER_OFFSET = -1.0;

export default class Portals
{
  private readonly portalTextures: Array<WebGLRenderTarget> = [];
  private readonly camera = new PerspectiveCamera(45, 1.0);
  private readonly portalTriggers: Array<number> = [];
  private readonly portalMeshes: Array<Mesh> = [];

  private readonly bottomRight = new Vector3();
  private readonly bottomLeft = new Vector3();
  private readonly topLeft = new Vector3();

  private readonly reflection = new Vector3();
  private readonly position = new Vector3();
  private readonly portals = Limbo.portals;

  private readonly player = new Vector3();
  private readonly offset = new Vector2();

  constructor (private readonly renderer: WebGLRenderer, private readonly scene: Scene) {
    this.scene.add(this.camera);

    for (let p = 0, l = this.portals.length - 1; p < l; p += 2) {
      const thisZ = this.portals[p    ][1];
      const nextZ = this.portals[p + 1][1];

      this.createPortal(
        Math.abs(thisZ - nextZ) * 1.25,
        this.portals[p][0],
        nextZ + (thisZ - nextZ) / 2
      );

      this.portalTriggers.push(
        this.portals[p][0] +
        Math.sign(this.portals[p][0]) *
        TRIGGER_OFFSET
      );
    }
  }

  private createPortal (size: number, x: number, z: number) {
    const portalTarget = new WebGLRenderTarget(TEXTURE_SIZE, TEXTURE_SIZE, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBFormat
    });

    const portalMesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({
        map: portalTarget.texture,
        toneMapped: false,
        fog: false
      })
    );

    portalMesh.rotateY(PI.d2 * Math.sign(x) * -1);
    portalMesh.position.set(x, size / 2, z);

    this.portalTextures.push(portalTarget);
    this.portalMeshes.push(portalMesh);
    this.scene.add(portalMesh);
  }

  private updatePosition (x: number, z = x): void {
    const trigger = this.portalTriggers[x / 2];
    const step = Math.sign(trigger) * TRIGGER_OFFSET;

    this.position.set(
      trigger - this.offset.x + step,
      this.player.y,
      this.portals[z][1] + this.offset.y
    );
  }

  private bottomPortalArea (): boolean {
    if (this.player.z < this.portals[2][1]) {
      if (this.player.x < this.portalTriggers[1]) {
        this.offset.set(
          -(this.portals[2][0] - this.player.x),
          this.portals[2][1] - this.player.z
        );

        this.updatePosition(0, 1);
        return true;
      }

      else if (this.player.x > this.portalTriggers[2]) {
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
      if (this.player.x < this.portalTriggers[0]) {
        this.offset.set(
          this.portals[0][0] - this.player.x,
          this.portals[0][1] - this.player.z
        );

        this.updatePosition(2, 3);
        return true;
      }

      else if (this.player.x > this.portalTriggers[3]) {
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

  private renderPortal (entry: Mesh, exit: Mesh, target: WebGLRenderTarget): void {
    const { width, height } = (exit.geometry as PlaneGeometry).parameters;

    !Config.freeCamera
      ? CameraObject.getWorldPosition(this.reflection)
      : this.reflection.copy(CameraObject.position);

    const x = width / 2.0, y = height / 2.0;
    entry.worldToLocal(this.reflection);

    this.reflection.x *= - 1.0;
    this.reflection.z *= - 1.0;

    exit.localToWorld(this.reflection);
    this.camera.position.copy(this.reflection);

    exit.localToWorld(this.bottomRight.set(-x, -y, 0));
    exit.localToWorld(this.bottomLeft.set(x, -y, 0));
    exit.localToWorld(this.topLeft.set(x, y, 0));

    CameraUtils.frameCorners(this.camera, this.bottomLeft, this.bottomRight, this.topLeft);
    target.texture.encoding = this.renderer.outputEncoding;
    this.renderer.setRenderTarget(target);

    this.renderer.state.buffers.depth.setMask(true);
    !this.renderer.autoClear && this.renderer.clear();

    entry.visible = false;
    this.renderer.render(this.scene, this.camera);
    entry.visible = true;
  }

  public render (): void {
    for (let p = 0, l = this.portalMeshes.length; p < l; p++) {
      const target = p % 2 * -2 + 1;

      this.renderPortal(
        this.portalMeshes[p],
        this.portalMeshes[p + target],
        this.portalTextures[p]
      );
    }
  }

  public portalPassed (player: Vector3): boolean {
    this.player.copy(player);
    return this.topPortalArea() || this.bottomPortalArea();
  }

  public get playerPosition (): Vector3 {
    return this.position;
  }
}
