import type { ProgressCallback, CanvasTextureLoadCallback, ErrorCallback } from '@/loaders/types';
import { ImageBitmapLoader } from 'three/src/loaders/ImageBitmapLoader';
import { CanvasTexture } from 'three/src/textures/CanvasTexture';
import { Loader } from 'three/src/loaders/Loader';
import { RGBAFormat } from 'three/src/constants';

export default class TextureLoader extends Loader
{
  public load (
    url: string,
    onLoad?: CanvasTextureLoadCallback,
    onProgress?: ProgressCallback,
    onError?: ErrorCallback
  ): Promise<ImageBitmap> {
    const loader = new ImageBitmapLoader(this.manager);
    loader.setOptions({ imageOrientation: 'flipY' });
    loader.setPath(this.path);

    return loader.load(url, imageBitmap => {
      const texture = new CanvasTexture(imageBitmap);

      texture.image = imageBitmap;
			texture.format = RGBAFormat;
			texture.needsUpdate = true;

      onLoad?.(texture);
      return texture;
    }, onProgress, onError);
  }
}
