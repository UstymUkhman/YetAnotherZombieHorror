import type { CanvasTexture } from 'three/src/textures/CanvasTexture';
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk';
import type { Shader } from 'three/src/renderers/shaders/ShaderLib';
import type { ShaderCompileCallback } from '@/environment/types';

import { FogExp2 } from 'three/src/scenes/FogExp2';
import { Assets } from '@/loaders/AssetsLoader';

import { Color } from '@/utils/Color';
import Settings from '@/settings';
import Configs from '@/configs';

export default class Fog extends FogExp2
{
  private readonly shaders: Array<Shader> = [];
  private noise?: CanvasTexture;

  private materials = 0;
  private time = 0.0;

  public constructor (private readonly volumetric: boolean) {
    super(Color.FOG, Configs.Level.fogDensity);

    if (this.volumetric) {
      this.loadShaders();

      Settings.getEnvironmentValue('bakedFog') &&
        Assets.Loader.loadTexture(Configs.Level.fog)
          .then(texture => this.noise = texture);
    }
  }

  private async loadShaders (): Promise<void> {
    // Development imports:
    /* const parsFrag = await (await import('../shaders/fog/pars.frag')).default;
    const parsVert = await (await import('../shaders/fog/pars.vert')).default;
    const fogFrag = await (await import('../shaders/fog/main.frag')).default;
    const fogVert = await (await import('../shaders/fog/main.vert')).default; */

    // Production imports:
    const parsFrag = await Assets.Loader.loadShader('fog/pars.frag');
    const parsVert = await Assets.Loader.loadShader('fog/pars.vert');
    const fogFrag = await Assets.Loader.loadShader('fog/main.frag');
    const fogVert = await Assets.Loader.loadShader('fog/main.vert');

    ShaderChunk.fog_pars_fragment = Settings.getEnvironmentValue('bakedFog')
      ? `#define USE_BAKED_FOG\n\n${parsFrag}` : parsFrag;

    ShaderChunk.fog_pars_vertex = parsVert;
    ShaderChunk.fog_fragment = fogFrag;
    ShaderChunk.fog_vertex = fogVert;
  }

  private setShaderUniforms (shader: Shader): void {
    shader.uniforms.noise = { value: this.noise };
    shader.uniforms.fogTime = { value: 0 };

    this.shaders.push(shader);
    this.materials = this.shaders.length;
  }

  public update (delta: number): void {
    if (!this.volumetric) return;
    this.time += delta * 0.025;

    for (let s = 0; s < this.materials; s++) {
      this.shaders[s].uniforms.fogTime.value = this.time;
    }
  }

  public dispose (): void {
    if (!this.volumetric) return;

    this.shaders.splice(0);
    this.noise?.dispose();
    this.materials = 0;
  }

  public get setUniforms (): ShaderCompileCallback {
    return this.setShaderUniforms.bind(this);
  }
}
