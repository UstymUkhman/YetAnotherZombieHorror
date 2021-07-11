import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { AudioListener } from 'three/src/audio/AudioListener';
import type { Object3D } from 'three/src/core/Object3D';

import { Vector3 } from 'three/src/math/Vector3';
import { Clock } from 'three/src/core/Clock';
import { Vector } from '@/utils/Vector';
import { Config } from '@/config';
import anime from 'animejs';

class GameCamera
{
  private fps = false;
  private raf!: number;

  private runDelta!: number;
  private shakeDuration = 0.0;
  private rightShoulder = true;

  private position = new Vector3();
  private readonly shakePower = 0.025;
  private readonly clock = new Clock();

  private readonly shakeAttenuation = 1.0;
  private readonly camera: PerspectiveCamera;

  private readonly onRunning = this.run.bind(this);
  private readonly audioListener = new AudioListener();
  private ratio = window.innerWidth / window.innerHeight;

  private readonly onResize = this.updateAspectRatio.bind(this);
  private readonly fpRifleAim = new Vector3(-0.1541, 1.524, 0.5);

  public constructor () {
    const near = +this.fps * 0.215 + 0.1;
    this.camera = new PerspectiveCamera(45, this.ratio, near);

    this.addAudioListener();
    this.createEvents();
    this.setCamera();
  }

  private updateAspectRatio (): void {
    this.ratio = window.innerWidth / window.innerHeight;
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
  }

  private addAudioListener (): void {
    this.camera.add(this.audioListener);
  }

  private createEvents (): void {
    window.addEventListener('resize', this.onResize, false);
  }

  private setCamera (): void {
    const idle = this.getPosition();
    const focalLength = +!this.fps * 2.5 + 22.5;

    this.camera.rotation.set(0.0, Math.PI, 0.0);
    this.camera.setFocalLength(focalLength);
    this.camera.position.copy(idle);
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

    aiming && cancelAnimationFrame(this.raf);
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
      complete: () => running && requestAnimationFrame(this.onRunning),
      begin: () => !running && cancelAnimationFrame(this.raf),

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
    this.raf = requestAnimationFrame(this.onRunning);
  }

  public deathAnimation (): void { return; }

  public setTo (target: Object3D): void {
    target.add(this.camera);
  }

  public destroy (): void {
    window.removeEventListener('resize', this.onResize, false);
  }

  public get object (): PerspectiveCamera {
    return this.camera;
  }

  public get listener (): AudioListener {
    return this.audioListener;
  }

  public get isFPS (): boolean {
    return this.fps;
  }
}

export const Camera = new GameCamera();
export const CameraObject = Camera.object;
export const CameraListener = Camera.listener;
