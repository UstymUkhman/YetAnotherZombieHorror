import { CubeTextureLoader } from '@three/loaders/CubeTextureLoader';
import { LoadingManager } from '@three/loaders/LoadingManager';
import { AnimationClip } from '@three/animation/AnimationClip';
import { TextureLoader } from '@three/loaders/TextureLoader';
import { CubeTexture } from '@three/textures/CubeTexture';
import { Texture } from '@three/textures/Texture';

import { GLTFLoader } from '@loaders/GLTFLoader';
import { RGBFormat } from '@three/constants';
import { Group } from '@three/objects/Group';

type GLTFModel = { scene: Group, animations?: Array<AnimationClip> };
type Resolve<Asset> = (asset?: Asset | PromiseLike<Asset>) => void;

type LoadCallback<Asset> = (asset: Asset) => void;
type Assets = Texture | CubeTexture | GLTFModel;
type Reject = (error?: ErrorEvent) => void;

export default class AssetsLoader extends LoadingManager {
  public readonly cubeTextures = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
  private readonly cubeTexture = new CubeTextureLoader(this);
  private readonly texture = new TextureLoader(this);
  private readonly gltf = new GLTFLoader(this);

  private readonly gltfModelsBasePath = '/assets/models/';
  private readonly textureBasePath = '/assets/images';

  private loading = false;

  public async loadCubeTexture (folder: string, callback?: LoadCallback<Assets>): Promise<CubeTexture> {
    return await new Promise((resolve: Resolve<CubeTexture>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject, callback);

      this.cubeTexture.setPath(`${this.textureBasePath}/${folder}/`);
      this.cubeTexture.load(this.cubeTextures, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  public async loadTexture (file: string, callback?: LoadCallback<Assets>): Promise<Texture> {
    return await new Promise((resolve: Resolve<Texture>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject, callback);

      this.texture.setPath(`${this.textureBasePath}/`);
      this.texture.load(file, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  public async loadGLTF (file: string, callback?: LoadCallback<Assets>): Promise<GLTFModel> {
    return await new Promise((resolve: Resolve<GLTFModel>, reject: Reject) => {
      const promise = this.getPromiseCallbacks(resolve as Resolve<Assets>, reject, callback);

      this.gltf.setPath(this.gltfModelsBasePath);
      this.gltf.load(file, promise.onLoad, promise.onProgress, promise.onError);
    });
  }

  private getPromiseCallbacks (resolve: Resolve<Assets>, reject: Reject, callback?: LoadCallback<Assets>) {
    return {
      onLoad: (result: Assets) => {
        if (result instanceof CubeTexture) {
          result.format = RGBFormat;
        }

        if (callback) callback(result);
        resolve(result);
      },

      onProgress: (event: ProgressEvent<EventTarget>) => this.onProgress(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event.target as any).responseURL, event.loaded, event.total
      ),

      onError: (error: ErrorEvent) => reject(error)
    };
  }

  public onProgress = (url: string, loaded: number, total: number): void => {
    const progress = (loaded * 100 / total).toFixed();
    console.info(`Loading... ${progress}%`);
  }

  public onError = (url: string): void => {
    console.info(`Error occurred loading ${url}.`);
    this.loading = false;
  }

  public onStart = (): void => {
    console.info('Loading... 0%');
    this.loading = true;
  }

  public isLoading (): boolean {
    return this.loading;
  }

  public onLoad = (): void => {
    console.info('Loaded!');
    this.loading = false;
  }
}
