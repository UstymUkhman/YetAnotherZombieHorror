import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { AudioListener } from '@three/audio/AudioListener';

type Object3D = import('@three/core/Object3D').Object3D;
type Vector3 = import('@three/math/Vector3').Vector3;
type Euler = import('@three/math/Euler').Euler;

class Camera {
  private audioListener = new AudioListener();
  private readonly onResize = this.updateAspectRatio.bind(this);

  private ratio: number = window.innerWidth / window.innerHeight;
  private camera = new PerspectiveCamera(45, this.ratio, 0.1, 500);

  constructor () {
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
    this.camera.position.set(-1.1, 2.75, -2.5);
    this.camera.rotation.set(0, Math.PI, 0);
    this.camera.setFocalLength(25.0);
  }

  public setTo (target: Object3D): void {
    target.add(this.camera);
  }

  public destroy (): void {
    window.removeEventListener('resize', this.onResize, false);

    delete this.audioListener;
    delete this.camera;
  }

  public get listener (): AudioListener {
    return this.audioListener;
  }

  public get object (): PerspectiveCamera {
    return this.camera;
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
