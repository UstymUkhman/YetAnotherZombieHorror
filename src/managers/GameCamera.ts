import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { AudioListener } from 'three/src/audio/AudioListener';

type Object3D = import('three/src/core/Object3D').Object3D;
type Vector3 = import('three/src/math/Vector3').Vector3;

import { Clock } from 'three/src/core/Clock';
import { Vector } from '@/utils/Vector';
import { Config } from '@/config';

type RunCheck = () => boolean;
import anime from 'animejs';

class GameCamera
{
  private run = 0;
  private shakeDuration = 0.0;

  private readonly shakePower = 0.025;
  private readonly shakeAttenuation = 1.0;

  private readonly clock = new Clock();
  private readonly audioListener = new AudioListener();

  private readonly TPS = Config.Camera.tps as Vector3;
  private readonly AIM = Config.Camera.aim as Vector3;
  private readonly RUN = Config.Camera.run as Vector3;

  private readonly onResize = this.updateAspectRatio.bind(this);
  private ratio: number = window.innerWidth / window.innerHeight;
  private readonly camera = new PerspectiveCamera(45, this.ratio);

  public constructor () {
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
    this.camera.rotation.set(0, Math.PI, 0);
    this.camera.position.copy(this.TPS);
    this.camera.setFocalLength(25.0);
  }

  public aimAnimation (running: boolean, aiming: boolean, duration: number): void {
    const { x, y, z } = aiming ? this.AIM : this.TPS;
    anime.running.length = 0;

    running && aiming && anime({
      targets: this.camera.rotation,
      easing: 'linear',
      duration: 250,
      y: Math.PI
    });

    anime({
      targets: this.camera.position,
      easing: 'easeInOutQuad',
      delay: ~~aiming * 100,
      duration, x, y, z
    });
  }

  public runAnimation (isRunning: RunCheck, running?: boolean): void {
    if (!this.run && running === false) return;
    this.run *= -1;

    if (running !== undefined) {
      const { x, y, z } = running ? this.RUN : this.TPS;
      this.run = ~~running;

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
      duration: ~~isRunning() * 250 + 250,
      y: Math.PI + this.run * 0.025,
      targets: this.camera.rotation,
      delay: ~~!!running * 1000,

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
      this.camera.position.copy(this.TPS);
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
}

export const Camera = new GameCamera();
export const CameraObject = Camera.object;
export const CameraListener = Camera.listener;
