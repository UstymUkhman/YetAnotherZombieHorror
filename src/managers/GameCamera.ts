import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { AudioListener } from '@three/audio/AudioListener';
import { Vector3 } from '@three/math/Vector3';

type Object3D = import('@three/core/Object3D').Object3D;
type Euler = import('@three/math/Euler').Euler;
type RunCheck = () => boolean;

import anime from 'animejs';

const DEFAULT = new Vector3(-0.625, 0.7, -1.5);
// const AIM = new Vector3(-0.6, 2.85, -1);
const RUN = new Vector3(-1.135, 0.7, -3);

class GameCamera {
  private audioListener = new AudioListener();
  private readonly onResize = this.updateAspectRatio.bind(this);

  private ratio: number = window.innerWidth / window.innerHeight;
  private camera = new PerspectiveCamera(45, this.ratio);

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
    this.camera.position.copy(DEFAULT);
    this.camera.setFocalLength(25.0);
  }

  public runAnimation (isRunning: RunCheck, running?: boolean): void {
    this.shake *= -1;

    if (running !== undefined) {
      const { x, y, z } = running ? RUN : DEFAULT;
      this.shake = ~~running;

      anime({
        delay: this.shake * 100,
        targets: this.position,
        easing: 'easeOutQuad',
        duration: 300,
        x, y, z
      });
    }

    anime({
      easing: running ?? true ? 'linear' : 'easeOutQuad',
      duration: ~~isRunning() * 250 + 250,
      y: Math.PI + this.shake * 0.025,
      targets: this.rotation,

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

  public get position (): Vector3 {
    return this.camera.position;
  }

  public get rotation (): Euler {
    return this.camera.rotation;
  }
}

export const Camera = new GameCamera();
export const CameraObject = Camera.object;
export const CameraListener = Camera.listener;
