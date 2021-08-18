import { LoadingManager as ThreeLoadingManager } from 'three/src/loaders/LoadingManager';
import type { AnimationClip } from 'three/src/animation/AnimationClip';
import type { CanvasTexture } from 'three/src/textures/CanvasTexture';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { CubeTexture } from 'three/src/textures/CubeTexture';
import { AudioLoader } from 'three/src/loaders/AudioLoader';
import CubeTextureLoader from '@/loaders/CubeTextureLoader';

import { generateUUID } from 'three/src/math/MathUtils';
import type { Group } from 'three/src/objects/Group';

import TextureLoader from '@/loaders/TextureLoader';
import { GameEvents } from '@/events/GameEvents';
import { RGBFormat } from 'three/src/constants';

export namespace Assets
{
  type Assets = CanvasTexture | CubeTexture | GLTFModel | AudioBuffer;
  type Resolve<Asset> = (asset?: Asset | PromiseLike<Asset>) => void;
  type ProgressEventTarget = EventTarget & { responseURL: string };
  type Reject = (error: ErrorEvent) => void;

  type Callbacks = {
    onProgress: (event: ProgressEvent<EventTarget>) => void
    onLoad: (asset: Assets) => void
    onError: Reject
  }

  class LoadingManager extends ThreeLoadingManager
  {
    private readonly cubeTexture = new CubeTextureLoader(this);
    private readonly texture = new TextureLoader(this);
    private readonly gltf = new GLTFLoader(this);
    private readonly audio = new AudioLoader();

    private readonly textureBasePath = '/assets/images/';
    private readonly modelBasePath = '/assets/models/';
    private readonly audioBasePath = '/assets/sounds/';

    private readonly uuid = generateUUID();

    private readonly cubeTextures = [
      'px.png', 'nx.png',
      'py.png', 'ny.png',
      'pz.png', 'nz.png'
    ];

    private getPromiseCallbacks (resolve: Resolve<Assets>, reject: Reject): Callbacks {
      return {
        onLoad: asset => {
          if (asset instanceof CubeTexture) {
            asset.format = RGBFormat;
          }

          resolve(asset);
        },

        onProgress: event => this.onProgress(
          (event.target as ProgressEventTarget).responseURL, event.loaded, event.total
        ),

        onError: error => reject(error)
      };
    }

    public async loadCubeTexture (folder: string): Promise<CubeTexture> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.cubeTexture.setPath(`${this.textureBasePath + folder}/`);
        this.cubeTexture.load(this.cubeTextures, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadTexture (file: string): Promise<CanvasTexture> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.texture.setPath(this.textureBasePath);
        this.texture.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadAudio (file: string): Promise<AudioBuffer> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.audio.setPath(this.audioBasePath);
        this.audio.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadGLTF (file: string): Promise<GLTFModel> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.gltf.setPath(this.modelBasePath);
        this.gltf.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public override onProgress = (url: string, loaded: number, total: number): void => {
      const progress = loaded * 100 / total;

      GameEvents.dispatch('Asset::LoadingProgress', {
        uuid: this.uuid,
        progress
      }, true);
    }

    public override onError = (url: string): void => {
      console.error(`Error occurred loading ${url}.`);
    }

    public override onStart = (): void => {
      GameEvents.dispatch('Asset::LoadingStart', this.uuid, true);
    }

    public override onLoad = (): void => {
      GameEvents.dispatch('Asset::LoadingComplete', this.uuid, true);
    }
  }

  export type GLTFModel = { scene: GLTF, animations?: Animations };
  export type Animations = Array<AnimationClip>;
  export type GLTF = Group;

  export const Loader = new LoadingManager();
}
