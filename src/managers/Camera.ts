import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import type { Object3D } from 'three/src/core/Object3D';
import type { Matrix4 } from 'three/src/math/Matrix4';

import { Vector3 } from 'three/src/math/Vector3';
import { Clock } from 'three/src/core/Clock';
import { Vector } from '@/utils/Vector';

import Viewport from '@/utils/Viewport';
import { Config } from '@/config';

import RAF from '@/managers/RAF';
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
    this.camera = new PerspectiveCamera(45, Viewport.ratio, +this.fps * 0.215 + 0.1);
    this.camera.far = Config.Level.depth;

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
    const { idle, run, aim } = Config.Camera[this.fps ? 'fps' : 'tps'];

    this.position.copy((running ? run : aiming ? aim : idle) as Vector3);
    this.position.x *= +(!this.fps && !this.rightShoulder) * -2 + 1;

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
    const duration = +fpRifle * -300 + 400;

    const near = aiming ? 0.1 : this.fps
      ? rifle ? 0.5 : 0.32 : 0.1;

    if (this.fps && running && rifle) {
      this.camera.position.z = 0.2;
    }

    this.camera.near !== near &&
      this.setNearPlane(near, duration);
  }

  public setNearPlane (near: number, duration: number): void {
    anime({
      update: () => this.camera.updateProjectionMatrix(),
      targets: this.camera,
      easing: 'linear',
      duration, near
    });
  }

  public changeShoulder (): void {
    if (this.fps) return;
    this.rightShoulder = !this.rightShoulder;

    anime({
      targets: this.camera.position,
      x: -this.camera.position.x,
      easing: 'easeInOutQuad',
      duration: 500
    });
  }

  public aimAnimation (aiming: boolean, rifle: boolean, duration = 400): void {
    const { x, y, z } = this.getPosition(false, aiming, rifle);

    aiming && RAF.remove(this.onRunning);
    anime.running.length = 0;

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

  public shakeAnimation (duration: number): void {
    this.shakeDuration = Math.max(duration, 0);

    if (this.shakeDuration) {
      const delta = this.clock.getDelta();
      const offset = Vector.random().multiplyScalar(this.shakePower);

      setTimeout(() => this.shakeAnimation(this.shakeDuration), delta);
      this.shakeDuration -= delta * this.shakeAttenuation;
      this.camera.position.add(offset);
    }

    else {
      this.camera.position.copy(this.getPosition());
    }
  }

  public runAnimation (running: boolean): void {
    const { x, y, z } = this.getPosition(running);

    this.runDelta = 0;

    anime({
      begin: () => !running && RAF.remove(this.onRunning),
      complete: () => running && RAF.add(this.onRunning),

      targets: this.camera.position,
      delay: +running * 100,
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

  public deathAnimation (): void { return; }

  public setTo (target: Object3D): void {
    target.add(this.camera);
  }

  public resize (): void {
    this.camera.updateProjectionMatrix();
  }

  public dispose (): void {
    RAF.remove(this.onRunning);
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
