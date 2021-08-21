import { CubeTextureLoader as ThreeCubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { ImageBitmapLoader } from 'three/src/loaders/ImageBitmapLoader';
import type { LoadingManager } from 'three/src/loaders/LoadingManager';
import { CubeTexture } from 'three/src/textures/CubeTexture';

type ProgressCallback = (event: ProgressEvent) => void;
type LoadCallback = (texture: CubeTexture) => void;
type ErrorCallback = (event: ErrorEvent) => void;

export default class CubeTextureLoader extends ThreeCubeTextureLoader
{
  constructor (manager: LoadingManager) {
		super(manager);
	}

  public override load (urls: Array<string>, onLoad?: LoadCallback, onProgress?: ProgressCallback, onError?: ErrorCallback): CubeTexture {
    const loader = new ImageBitmapLoader(this.manager).setPath(this.path);

    const texture = new CubeTexture();
    let loaded = 0;

    function loadTexture (index: number): void {
			loader.load(urls[index], (imageBitmap: ImageBitmap): void => {
				texture.images[index] = imageBitmap;
				loaded++;

				if (loaded === 6) {
					texture.needsUpdate = true;
					onLoad && onLoad(texture);
				}
			}, onProgress, onError);
		}

		for (let u = 0; u < urls.length; ++u) {
			loadTexture(u);
		}

		return texture;
  }
}
