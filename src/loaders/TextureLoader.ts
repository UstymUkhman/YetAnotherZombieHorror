import { ImageBitmapLoader } from 'three/src/loaders/ImageBitmapLoader';
import type { LoadingManager } from 'three/src/loaders/LoadingManager';
import { CanvasTexture } from 'three/src/textures/CanvasTexture';

import { Loader } from 'three/src/loaders/Loader';
import { RGBAFormat } from 'three/src/constants';

type ProgressCallback = (event: ProgressEvent) => void;
type LoadCallback = (texture: CanvasTexture) => void;
type ErrorCallback = (event: ErrorEvent) => void;

export default class TextureLoader extends Loader
{
  constructor (manager: LoadingManager) {
		super(manager);
	}

  public load (url: string, onLoad?: LoadCallback, onProgress?: ProgressCallback, onError?: ErrorCallback): Promise<ImageBitmap> {
    const loader = new ImageBitmapLoader(this.manager).setPath(this.path);
    loader.setOptions({ imageOrientation: 'flipY' });

    return loader.load(url, imageBitmap => {
      const texture = new CanvasTexture(imageBitmap);
      texture.image = imageBitmap;

			texture.format = RGBAFormat;
			texture.needsUpdate = true;

      onLoad && onLoad(texture);
      return texture;

    }, onProgress, onError);
  }
}
