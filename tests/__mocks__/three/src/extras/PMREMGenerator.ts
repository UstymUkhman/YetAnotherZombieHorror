import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import type { CubeTexture } from 'three/src/textures/CubeTexture';
import type { Scene } from 'three/src/scenes/Scene';

const renderTarget = new WebGLRenderTarget(0.0, 0.0);

class PMREMGenerator {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  public fromCubemap (cubemap: CubeTexture): WebGLRenderTarget {
    return renderTarget;
  }

  public fromScene (
    scene: Scene,
    sigma?: number | undefined,
    near?: number | undefined,
    far?: number | undefined
  ): WebGLRenderTarget {
    return renderTarget;
  }

  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export { PMREMGenerator };
