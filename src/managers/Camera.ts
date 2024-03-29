import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import type { Object3D } from 'three/src/core/Object3D';
import type { HitDirection } from '@/characters/types';
import type { Matrix4 } from 'three/src/math/Matrix4';

import { Vector3 } from 'three/src/math/Vector3';
import { GAME_RATIO } from '@/scenes/WhiteBox';
import { Direction } from '@/utils/Direction';
import { Clock } from 'three/src/core/Clock';

import Viewport from '@/utils/Viewport';
import RAF from '@/managers/RAF';
import Configs from '@/configs';
import anime from 'animejs';

type CameraState = {
  matrix: Matrix4,
  aspect: number,
  near: number,
  far: number,
  fov: number
};

export class CameraManager
{
  private fps = false;

  private runTimeout = 0.0;
  private runDelta!: number;
  private shakeDuration = 0.0;
  private rightShoulder = true;

  private position = new Vector3();
  private static state: CameraState;

  private readonly shakePower = 0.025;
  private readonly clock = new Clock();

  private readonly shakeAttenuation = 1.0;
  private readonly camera: PerspectiveCamera;

  private readonly onRunning = this.run.bind(this);
  private readonly fpRifleAim = new Vector3(-0.1541, 1.524, 0.5);

  public constructor () {
    const ratio = (TEST && !GAME_RATIO) ? innerWidth / innerHeight : Viewport.size.ratio;
    this.camera = new PerspectiveCamera(45, ratio, +this.fps * 0.215 + 0.1);
    this.camera.far = Configs.Level.depth;

    this.setCamera();
    this.updateState();
  }

  private setCamera (): void {
    const idle = this.getPosition();
    const focalLength = +!this.fps * 2.5 + 22.5;

    this.camera.rotation.set(0.0, Math.PI, 0.0);
    this.camera.setFocalLength(focalLength);
    this.camera.position.copy(idle);
  }

  public updateState (): void {
    const { aspect, near, far, fov } = this.camera;

    CameraManager.state = {
      matrix: this.camera.matrixWorld,
      aspect, near, far, fov
    };
  }

  private getPosition (running = false, aiming = false, rifle = false): Vector3 {
    if (this.fps && aiming && rifle) return this.fpRifleAim;

    const { idle, run, aim } = Configs.Camera[this.fps ? 'fps' : 'tps'];
    this.position.copy((running ? run : aiming ? aim : idle) as Vector3);

    this.position.x -= +(!this.fps && this.rightShoulder && aiming && rifle) * 0.125;
    this.position.x *= +(!this.fps && !this.rightShoulder) * -2.0 + 1.0;

    return this.position;
  }

  public changeView (running: boolean, aiming: boolean, rifle: boolean): void {
    this.fps = !this.fps;
    this.updateNearPlane(aiming, rifle);
    const { x, y, z } = this.getPosition(running, aiming, rifle);

    anime({
      targets: this.camera.position,
      easing: 'easeInOutQuad',
      duration: 500,
      x, y, z
    });
  }

  public updateNearPlane (aiming: boolean, rifle: boolean, running?: boolean): void {
    const fpRifle = this.camera.near === 0.5;
    const duration = +fpRifle * -300.0 + 400.0;

    const near = aiming ? 0.03 : this.fps
      ? rifle ? 0.5 : 0.315 : 0.1;

    if (this.fps && running && rifle) {
      this.camera.position.z = 0.2;
    }

    this.camera.near !== near &&
      this.setNearPlane(near, duration);
  }

  public setNearPlane (near: number, duration: number): void {
    anime({
      complete: () => this.camera.updateProjectionMatrix(),
      update: () => this.camera.updateProjectionMatrix(),

      targets: this.camera,
      easing: 'linear',
      duration, near
    });
  }

  public changeShoulder (aiming: boolean, rifle: boolean): void {
    if (this.fps) return;
    let { x } = this.camera.position;
    this.rightShoulder = !this.rightShoulder;

    if (aiming && rifle) {
      x = Configs.Camera.tps.aim.x;
      x -= +this.rightShoulder * 0.125;
      x *= +this.rightShoulder * -2.0 + 1.0;
    }

    anime({
      targets: this.camera.position,
      easing: 'easeInOutQuad',
      duration: 500,
      x: -x
    });
  }

  public aimAnimation (aiming: boolean, rifle: boolean, duration = 400): void {
    const { x, y, z } = this.getPosition(false, aiming, rifle);
    aiming && RAF.remove(this.onRunning);

    aiming && anime({
      targets: this.camera.rotation,
      easing: 'linear',
      duration: 250,
      y: Math.PI
    });

    anime({
      targets: this.camera.position,
      easing: 'easeInOutQuad',
      delay: +aiming * 100,
      duration, x, y, z
    });
  }

  public headAnimation (direction: HitDirection, duration: number): void {
    const { x: px, y: py, z: pz } = this.camera.position;
    const { x: rx, y: ry, z: rz } = this.camera.rotation;

    const dp = { x: 0.0, y: 0.0, z: 0.0 };
    const dr = { x: 0.0, y: 0.0, z: 0.0 };

    switch (direction) {
      case 'Front':
        dp.y = 0.2;
        dr.x = -0.2;
      break;

      case 'Left':
        dp.x = -0.5;
        dp.y = 0.5;
        dr.x = 0.5;
        dr.y = -1.0;
      break;

      case 'Right':
        dp.x = 0.36;
        dp.y = -0.2;
        dr.x = 0.5;
        dr.y = 0.55;
      break;
    }

    anime({
      targets: this.camera.position,
      direction: 'alternate',
      easing: 'easeOutSine',
      duration,
      x: px + dp.x,
      y: py + dp.y,
      z: pz + dp.z
    });

    anime({
      targets: this.camera.rotation,
      direction: 'alternate',
      easing: 'easeOutSine',
      duration,
      x: rx + dr.x,
      y: ry + dr.y,
      z: rz + dr.z
    });
  }

  public shakeAnimation (duration: number): void {
    this.shakeDuration = Math.max(duration, 0);

    if (this.shakeDuration) {
      const delta = this.clock.getDelta();
      const offset = Direction.random().multiplyScalar(this.shakePower);

      setTimeout(() => this.shakeAnimation(this.shakeDuration), delta);
      this.shakeDuration -= delta * this.shakeAttenuation;
      this.camera.position.add(offset);
    }

    else {
      this.camera.position.copy(this.getPosition());
    }
  }

  public runAnimation (running: boolean): void {
    if (running && this.runTimeout) return;

    this.runTimeout = running
      ? setTimeout(() =>
          RAF.add(this.onRunning), 500
        ) as unknown as number
      : this.dispose();

    const position = this.getPosition(running);
    const { x, y, z } = position;
    this.runDelta = 0;

    !this.camera.position.equals(position) && anime({
      targets: this.camera.position,
      easing: 'easeOutQuad',
      duration: 300,
      x, y, z
    });
  }

  private run (): void {
    this.runDelta += 0.25;
    const offset = +this.fps + 1;

    const sin = Math.sin(this.runDelta);
    const cos = Math.cos(this.runDelta / 2);

    this.camera.position.y += sin * offset / 100;
    this.camera.rotation.y -= cos * offset / 500;
  }

  public deathAnimation (delay: number): void {
    const { x, z } = Configs.Camera.tps.idle;

    anime({
      targets: this.camera.position,
      easing: 'easeInOutQuad',
      duration: 500.0,
      z: z - 1.0,
      y: 0.75,
      delay,
      x
    });
  }

  public setTo (target: Object3D): void {
    target.add(this.camera);
  }

  public resize (): void {
    this.camera.updateProjectionMatrix();
  }

  public dispose (): number {
    clearTimeout(this.runTimeout);
    RAF.remove(this.onRunning);
    return 0.0;
  }

  public static get config (): CameraState {
    return CameraManager.state;
  }

  public get object (): PerspectiveCamera {
    return this.camera;
  }

  public get isFPS (): boolean {
    return this.fps;
  }
}

const Camera = new CameraManager();

export const CameraObject = Camera.object;
export default Camera;
