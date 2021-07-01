import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk';
import type { Shader } from 'three/src/renderers/shaders/ShaderLib';

import { TextureLoader } from 'three/src/loaders/TextureLoader';
import type { Texture } from 'three/src/textures/Texture';
import { FogExp2 } from 'three/src/scenes/FogExp2';

import parsFrag from '@/shaders/fog/pars.frag';
import parsVert from '@/shaders/fog/pars.vert';

import fogFrag from '@/shaders/fog/main.frag';
import fogVert from '@/shaders/fog/main.vert';

import Settings from '@/config/settings';
import { Color } from '@/utils/Color';

export class VolumetricFog extends FogExp2
{
  private readonly loader = new TextureLoader();
  private readonly shaders: Array<Shader> = [];

  private noise?: Texture;
  private materials = 0;
  private time = 0.0;

  public constructor () {
    super(Color.GRAY, 0.01);

    if (Settings.bakedFog) {
      this.noise = this.loader.load('./assets/images/simplex.jpg');
    }

    ShaderChunk.fog_pars_fragment = Settings.bakedFog
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
    this.time += delta * 0.025;

    for (let s = 0; s < this.materials; s++) {
      this.shaders[s].uniforms.fogTime.value = this.time;
    }
  }

  public get setUniforms (): (shader: Shader) => void {
    return this.setShaderUniforms.bind(this);
  }
}
