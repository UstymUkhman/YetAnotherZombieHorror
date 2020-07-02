import { CubeTextureLoader } from '@three/loaders/CubeTextureLoader';
import { LoadingManager } from '@three/loaders/LoadingManager';
import { TextureLoader } from '@three/loaders/TextureLoader';
import { CubeTexture } from '@three/textures/CubeTexture';

import { GLTFLoader } from '@loaders/GLTFLoader';
import { RGBFormat } from '@three/constants';

type AnimationClip = import('@three/animation/AnimationClip').AnimationClip;
type GLTFModel = { scene: Group, animations?: Array<AnimationClip> };
type Resolve<Asset> = (asset?: Asset | PromiseLike<Asset>) => void;

type Texture = import('@three/textures/Texture').Texture;
type Group = import('@three/objects/Group').Group;

type Assets = Texture | CubeTexture | GLTFModel;
type Reject = (error?: ErrorEvent) => void;

export interface Callbacks {
  onProgress: (event: ProgressEvent<EventTarget>) => void;
  onError: (error: ErrorEvent) => void;
  onLoad: (asset: Assets) => void;
}

export default class AssetsLoader extends LoadingManager {
  private readonly cubeTexture = new CubeTextureLoader(this);
  private readonly texture = new TextureLoader(this);
  private readonly gltf = new GLTFLoader(this);

  public textureBasePath = '/assets/images';
  public modelBasePath = '/assets/models/';

  public cubeTextures = [
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
  ];

  private getPromiseCallbacks (resolve: Resolve<Assets>, reject: Reject): Callbacks {
    return {
      onLoad: (asset: Assets) => {
        if (asset instanceof CubeTexture) {
          asset.format = RGBFormat;
        }

        resolve(asset);
      },

      onProgress: (event: ProgressEvent<EventTarget>) => this.onProgress(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event.target as any).responseURL, event.loaded, event.total
      ),

      onError: (error: ErrorEvent) => reject(error)
    };
  }

  public async loadCubeTexture (folder: string): Promise<CubeTexture> {
    return await new Promise((resolve: Resolve<CubeTexture>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

      this.cubeTexture.setPath(`${this.textureBasePath}/${folder}/`);
      this.cubeTexture.load(this.cubeTextures, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  public async loadTexture (file: string): Promise<Texture> {
    return await new Promise((resolve: Resolve<Texture>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

      this.texture.setPath(`${this.textureBasePath}/`);
      this.texture.load(file, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  public async loadGLTF (file: string): Promise<GLTFModel> {
    return await new Promise((resolve: Resolve<GLTFModel>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject);

      this.gltf.setPath(this.modelBasePath);
      this.gltf.load(file, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  public onProgress = (url: string, loaded: number, total: number): string => {
    const progress = (loaded * 100 / total).toFixed();
    console.info(`Loading... ${progress}%`);
    return progress;
  }

  public onError = (url: string): void => {
    console.error(`Error occurred loading ${url}.`);
  }

  public onStart = (): void => {
    console.info('Loading... 0%');
  }

  public onLoad = (): void => {
    console.info('Loaded!');
  }
}
