import type { MeshPhongMaterialParameters } from 'three/src/materials/MeshPhongMaterial';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import type { Shader } from 'three/src/renderers/shaders/ShaderLib';

// Development imports
import fragPars from '@/shaders/ground/pars.frag';
import vertPars from '@/shaders/ground/pars.vert';
import fragMain from '@/shaders/ground/main.frag';
import vertMain from '@/shaders/ground/main.vert';

// import { Assets } from '@/loaders/AssetsLoader';
import { Color } from '@/utils/Color';

export namespace Material
{
  export class Ground extends MeshPhongMaterial
  {
    public constructor (parameters: MeshPhongMaterialParameters = {}) {
      super(parameters);
      this.setValues(parameters);
    }

    private async updateDefaultFragmentShader (shader: Shader): Promise<void> {
      // Production imports:
      // const fragPars = await Assets.Loader.loadShader('ground/pars.frag');
      // const fragMain = await Assets.Loader.loadShader('ground/main.frag');

      shader.fragmentShader = `${fragPars}
      ${shader.fragmentShader.replace(
        '#include <output_fragment>', `
        ${fragMain}`
      )}`;
    }

    private async updateDefaultVertexShader (shader: Shader): Promise<void> {
      // Production imports:
      // const vertPars = await Assets.Loader.loadShader('ground/pars.vert');
      // const vertMain = await Assets.Loader.loadShader('ground/main.vert');

      shader.vertexShader = `${vertPars}
      ${shader.vertexShader.replace(
        'void main() {',
        `void main() {
          ${vertMain}`
      )}`;
    }

    public override onBeforeCompile (shader: Shader): void {
      this.updateDefaultFragmentShader(shader);
      this.updateDefaultVertexShader(shader);
      this.needsUpdate = true;
    }
  }

  export const DynamicCollider = new MeshBasicMaterial({
    color: Color.RED,
    wireframe: true,
    visible: DEBUG,
    opacity: 0.33
  });

  export const StaticCollider = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    color: Color.RAIN,
    visible: DEBUG,
    opacity: 0.5
  });

  export const Transparent = new MeshBasicMaterial({
    color: Color.BLACK,
    transparent: true,
    depthWrite: false,
    visible: false,
    opacity: 0.0
  });

  export const HitBox = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    color: Color.RED,
    visible: DEBUG,
    opacity: 0.75
  });
}
