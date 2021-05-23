import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { AudioListener } from 'three/src/audio/AudioListener';
type Object3D = import('three/src/core/Object3D').Object3D;

import { Vector3 } from 'three/src/math/Vector3';
import { Clock } from 'three/src/core/Clock';
import { Vector } from '@/utils/Vector';
import { Config } from '@/config';

type RunCheck = () => boolean;
import anime from 'animejs';

class GameCamera
{
  private run = 0;
  private shakeDuration = 0.0;
  private fps = Config.Settings.fpCamera;

  private readonly shakePower = 0.025;
  private readonly shakeAttenuation = 1.0;

  private readonly clock = new Clock();
  private readonly camera: PerspectiveCamera;

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
    const { idle, run, aim } = Config.Camera[this.fps ? 'fps' : 'tps'];
    const position = (running ? run : aiming ? aim : idle) as Vector3;
    return this.fps && aiming && rifle ? this.fpRifleAim : position;
  }

  public changeView (running: boolean, aiming: boolean, rifle: boolean): void {
    this.fps = !this.fps;

    const { x, y, z } = this.getPosition(running, aiming, rifle);

    this.updateNearPlane(aiming, rifle);

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
      ? rifle ? 0.5 : 0.315 : 0.1;

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

  public aimAnimation (aiming: boolean, rifle: boolean, duration = 400): void {
    const { x, y, z } = this.getPosition(false, aiming, rifle);

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

  public runAnimation (isRunning: RunCheck, running?: boolean): void {
    if (!this.run && running === false) return;
    this.run *= -1;

    if (running !== undefined) {
      const { x, y, z } = this.getPosition(running);
      this.run = +running;

      anime({
        targets: this.camera.position,
        delay: this.run * 100,
        easing: 'easeOutQuad',
        duration: 300,
        x, y, z
      });
    }

    anime({
      easing: running ?? true ? 'linear' : 'easeOutQuad',
      duration: +(isRunning() && !this.fps) * 250 + 250,
      y: Math.PI + this.run * 0.025,
      targets: this.camera.rotation,
      delay: +!!running * 1000,

      complete: () => isRunning() &&
        this.runAnimation(isRunning)
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
