import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { AudioListener } from '@three/audio/AudioListener';
import { Vector3 } from '@three/math/Vector3';

type Object3D = import('@three/core/Object3D').Object3D;
type Euler = import('@three/math/Euler').Euler;
type RunCheck = () => boolean;

import anime from 'animejs';

const DEFAULT = new Vector3(-0.625, 1.5, -1.5);
// const AIM = new Vector3(-0.6, 2.85, -1);
const RUN = new Vector3(-1.135, 1.25, -3);

class Camera {
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

  public shakeAnimation (isRunning: RunCheck, delay = 0): void {
    const speed = this.shake || !isRunning() ? 250 : 500;
    const torque = this.shake * 0.025;
    const oscillation = this.shake;

    anime({
      targets: this.rotation,
      y: Math.PI + torque,
      easing: 'linear',
      duration: speed,
      delay,

      complete: () => {
        if (!isRunning()) return;
        this.shake = oscillation * -1;
        this.shakeAnimation(isRunning);
      }
    });
  }

  public runAnimation (running: boolean): void {
    const { x, y, z } = running ? RUN : DEFAULT;
    this.shake = ~~running;

    anime({
      delay: running ? 100 : 0,
      targets: this.position,
      easing: 'easeOutQuad',
      duration: 300,
      x, y, z
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

const camera = new Camera();

export const listener = camera.listener;
export const object = camera.object;
export default camera;
