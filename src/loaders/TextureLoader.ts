import { ImageBitmapLoader } from 'three/src/loaders/ImageBitmapLoader';
import type { LoadingManager } from 'three/src/loaders/LoadingManager';

import { CanvasTexture } from 'three/src/textures/CanvasTexture';
import { RGBAFormat, RGBFormat } from 'three/src/constants';
import { Loader } from 'three/src/loaders/Loader';

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

      // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
			const isJPEG = url.search( /\.jpe?g($|\?)/i ) > 0 || url.search( /^data:image\/jpeg/ ) === 0;

			texture.format = isJPEG ? RGBFormat : RGBAFormat;
			texture.needsUpdate = true;

      onLoad && onLoad(texture);
      return texture;

    }, onProgress, onError);
  }
}
