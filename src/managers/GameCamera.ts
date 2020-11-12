import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { AudioListener } from '@three/audio/AudioListener';
type Object3D = import('@three/core/Object3D').Object3D;
import { Vector3 } from '@three/math/Vector3';

import { Config } from '@/config';
type RunCheck = () => boolean;
import anime from 'animejs';

class GameCamera {
  private ratio: number = window.innerWidth / window.innerHeight;
  private readonly onResize = this.updateAspectRatio.bind(this);
  private camera = new PerspectiveCamera(45, this.ratio);

  private readonly TPS = Config.Camera.tps as Vector3;
  private readonly AIM = Config.Camera.aim as Vector3;
  private readonly RUN = Config.Camera.run as Vector3;

  private audioListener = new AudioListener();
  private shake = 0;

  public constructor () {
    this.addAudioListener();
    this.createEvents();
    this.setCamera();
  }

  private addAudioListener (): void {
    this.camera.add(this.audioListener);
  }

  private createEvents (): void {
    window.addEventListener('resize', this.onResize, false);
  }

  private updateAspectRatio (): void {
    this.ratio = window.innerWidth / window.innerHeight;
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
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
    if (!this.shake && running === false) return;
    this.shake *= -1;

    if (running !== undefined) {
      const { x, y, z } = running ? this.RUN : this.TPS;
      this.shake = ~~running;

      anime({
        targets: this.camera.position,
        delay: this.shake * 100,
        easing: 'easeOutQuad',
        duration: 300,
        x, y, z
      });
    }

    anime({
      easing: running ?? true ? 'linear' : 'easeOutQuad',
      duration: ~~isRunning() * 250 + 250,
      y: Math.PI + this.shake * 0.025,
      targets: this.camera.rotation,
      delay: ~~!!running * 1000,

      complete: () => isRunning() &&
        this.runAnimation(isRunning)
    });
  }

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
