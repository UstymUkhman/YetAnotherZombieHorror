import type { CanvasTexture } from 'three/src/textures/CanvasTexture';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';

import { CubeTexture } from 'three/src/textures/CubeTexture';
import { AudioLoader } from 'three/src/loaders/AudioLoader';
import CubeTextureLoader from '@/loaders/CubeTextureLoader';
import { generateUUID } from 'three/src/math/MathUtils';

import TextureLoader from '@/loaders/TextureLoader';
import { GameEvents } from '@/events/GameEvents';
import { RGBAFormat } from 'three/src/constants';
import Configs from '@/configs';

export namespace Assets
{
  type Resolve<Asset> = (asset?: Asset | PromiseLike<Asset>) => void;
  type ProgressEventTarget = EventTarget & { responseURL: string };
  type Assets = GLTF | AudioBuffer | CubeTexture | CanvasTexture;

  type Callbacks = {
    onProgress: (event: ProgressEvent<EventTarget>) => void;
    onError: (error: ErrorEvent) => void;
    onLoad: (asset: Assets) => void;
  }

  class Manager extends LoadingManager
  {
    private readonly imageBasePath   = `${BASE_PATH}/images/`;
    private readonly modelBasePath   = `${BASE_PATH}/models/`;
    private readonly soundBasePath   = `${BASE_PATH}/sounds/`;
    private readonly shaderBasePath  = `${BASE_PATH}/shaders/`;

    private readonly cubeTexture = new CubeTextureLoader(this);
    private readonly texture = new TextureLoader(this);
    private readonly audio = new AudioLoader(this);
    private readonly gltf = new GLTFLoader(this);

    private readonly uuid = generateUUID();

    private readonly cubeTextures = [
      'px.png', 'nx.png',
      'py.png', 'ny.png',
      'pz.png', 'nz.png'
    ];

    private getPromiseCallbacks (resolve: Resolve<Assets>, reject: (error: ErrorEvent) => void): Callbacks {
      return {
        onLoad: asset => {
          if (asset instanceof CubeTexture) {
            asset.format = RGBAFormat;
          }

          resolve(asset);
        },

        onProgress: event => this.onProgress(
          (event.target as ProgressEventTarget)?.responseURL, event.loaded, event.total
        ),

        onError: error => reject(error)
      };
    }

    public async loadCubeTexture (folder: string): Promise<CubeTexture> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.cubeTexture.setPath(`${this.imageBasePath + folder}/`);
        this.cubeTexture.load(this.cubeTextures, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadTexture (file: string): Promise<CanvasTexture> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.texture.setPath(this.imageBasePath);
        this.texture.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadAudio (file: string): Promise<AudioBuffer> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.audio.setPath(this.soundBasePath);
        this.audio.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public async loadShader (file: string): Promise<string> {
      return await (await fetch(`${this.shaderBasePath + file}`)).text();
    }

    public async loadGLTF (file: string): Promise<GLTF> {
      return await new Promise((resolve, reject) => {
        const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

        this.gltf.setPath(this.modelBasePath);
        this.gltf.load(file, promise.onLoad, promise.onProgress, promise.onError);
      });
    }

    public override onProgress = (url: string, loaded: number, total: number): void => {
      GameEvents.dispatch(Loading.Progress, {
        progress: loaded * 100 / total,
        uuid: this.uuid
      }, true);
    };

    public override onError = (url: string): void => {
      console.error(`Error occurred loading ${url}.`);
    };

    public override onStart = (): void => {
      GameEvents.dispatch(Loading.Start, this.uuid, true);
    };

    public override onLoad = (): void => {
      GameEvents.dispatch(Loading.Complete, this.uuid, true);
    };
  }

  const BASE_PATH = Configs.basePath();

  export const Loader = new Manager();

  export enum Loading {
    Complete = 'Loading::Complete',
    Progress = 'Loading::Progress',
    Start    = 'Loading::Start'
  }
}
