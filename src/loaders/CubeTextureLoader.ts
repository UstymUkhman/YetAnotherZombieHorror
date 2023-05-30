import { CubeTextureLoader as ThreeCubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import type { ProgressCallback, CubeTextureLoadCallback, ErrorCallback } from '@/loaders/types';
import { ImageBitmapLoader } from 'three/src/loaders/ImageBitmapLoader';
import { CubeTexture } from 'three/src/textures/CubeTexture';

export default class CubeTextureLoader extends ThreeCubeTextureLoader
{
  public override load (
    urls: Array<string>,
    onLoad?: CubeTextureLoadCallback,
    onProgress?: ProgressCallback,
    onError?: ErrorCallback
  ): CubeTexture {
    const loader = new ImageBitmapLoader(this.manager);
    const texture = new CubeTexture();

    loader.setPath(this.path);
    let loaded = 0;

    function loadTexture (index: number): void {
			loader.load(urls[index], (imageBitmap: ImageBitmap): void => {
				texture.images[index] = imageBitmap;

				if (++loaded === 6) {
					texture.needsUpdate = true;
					onLoad?.(texture);
				}
			}, onProgress, onError);
		}

		for (let u = 0; u < urls.length; u++)
			loadTexture(u);

		return texture;
  }
}
