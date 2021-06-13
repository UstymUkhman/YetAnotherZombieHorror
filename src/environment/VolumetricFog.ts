import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';

import { FogExp2 } from 'three/src/scenes/FogExp2';
import { Vector3 } from 'three/src/math/Vector3';

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

  private readonly sphere = this.createSkybox();
  public override readonly name = 'Volumetric';

  public constructor () {
    super(Color.GREY, 0.1);

    ShaderChunk.fog_pars_fragment = parsFrag;
    ShaderChunk.fog_pars_vertex   = parsVert;
    ShaderChunk.fog_fragment      = fogFrag;
    ShaderChunk.fog_vertex        = fogVert;
  }

  private createSkybox (): Mesh {
    const sphere = new Sphere();

    sphere.expandByPoint(this.minCoord.multiplyScalar(1.5));
    sphere.expandByPoint(this.maxCoord.multiplyScalar(1.5));

    const skybox = new Mesh(
      new SphereGeometry(sphere.radius, 32, 32),
      new MeshBasicMaterial({
        transparent: true,
        color: this.color,
        side: BackSide,
        opacity: 0.9
      })
    );

    skybox.position.copy(sphere.center);
    return skybox;
  }

  public get skybox (): Mesh {
    return this.sphere;
  }
}
