import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';

import type { Shader } from 'three/src/renderers/shaders/ShaderLib';
import type { Texture } from 'three/src/textures/Texture';

import { FogExp2 } from 'three/src/scenes/FogExp2';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/managers/AssetsLoader';

import parsFrag from '@/shaders/fog/pars.frag';
import parsVert from '@/shaders/fog/pars.vert';

import { BackSide } from 'three/src/constants';
import { Sphere } from 'three/src/math/Sphere';
import { Mesh } from 'three/src/objects/Mesh';

import fogFrag from '@/shaders/fog/main.frag';
import fogVert from '@/shaders/fog/main.vert';

import Limbo from '@/environment/Limbo';
import { Color } from '@/utils/Color';
import { Config } from '@/config';

export class VolumetricFog extends FogExp2
{
  private readonly minCoord = new Vector3(
    Limbo.minCoords[0], Config.Limbo.height, Limbo.minCoords[1]
  );

  private readonly maxCoord = new Vector3(
    Limbo.maxCoords[0], Config.Limbo.height, Limbo.maxCoords[1]
  );

  private readonly loader = new Assets.Loader();
  private readonly sphere = this.createSkybox();
  private readonly shaders: Array<Shader> = [];

  private noise?: Texture;
  private materials = 0;
  private time = 0.0;

  public constructor () {
    super(Color.GREY, 0.005);

    if (Config.Settings.bakedFog) {
      this.loader.loadTexture('simplex.jpg').then(
        noise => this.noise = noise
      );
    }

    ShaderChunk.fog_pars_fragment = Config.Settings.bakedFog
      ? `#define USE_BAKED_FOG\n\n${parsFrag}` : parsFrag;

    ShaderChunk.fog_pars_vertex   = parsVert;
    ShaderChunk.fog_fragment      = fogFrag;
    ShaderChunk.fog_vertex        = fogVert;
  }

  private setShaderUniforms (shader: Shader): void {
    shader.uniforms.noise = { value: this.noise };
    shader.uniforms.fogTime = { value: 0 };

    this.shaders.push(shader);
    this.materials = this.shaders.length;
  }

  private createSkybox (): Mesh {
    const sphere = new Sphere();

    sphere.expandByPoint(this.minCoord.multiplyScalar(1.55));
    sphere.expandByPoint(this.maxCoord.multiplyScalar(1.55));

    const skybox = new Mesh(
      new SphereGeometry(sphere.radius, 32, 32),
      new MeshBasicMaterial({
        transparent: true,
        color: this.color,
        side: BackSide,
        opacity: 0.9
      })
    );

    skybox.material.onBeforeCompile = this.setUniforms;
    skybox.position.copy(sphere.center);
    return skybox;
  }

  public update (delta: number): void {
    this.time += delta * 0.01;

    for (let s = 0; s < this.materials; s++) {
      this.shaders[s].uniforms.fogTime.value = this.time;
    }
  }

  public get setUniforms (): (shader: Shader) => void {
    return this.setShaderUniforms.bind(this);
  }

  public get skybox (): Mesh {
    return this.sphere;
  }
}
