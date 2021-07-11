import type { RainParams, RainParticles, RainParticle } from '@/managers/worker/types.d';
import { Vector3 } from 'three/src/math/Vector3';
import { random } from '@/utils/Number';

// private readonly alphaSpline = new Spline();

// this.alphaSpline.addPoint(0.0, 0.0);
// this.alphaSpline.addPoint(0.2, 1.0);
// this.alphaSpline.addPoint(0.9, 1.0);
// this.alphaSpline.addPoint(1.0, 0.0);

// this.alphaSpline.dispose();

let rainDrops: Array<RainParticle> = [];
const position = new Vector3();
let timeElapsed = 0.0;

export const updateRainParticles = (params: RainParams): RainParticles => {
  position.copy(params.camera);
  timeElapsed += params.delta;

  addParticles(params);
  updateParticles(params);
  return updateGeometry();
};

const addParticles = (params: RainParams): void => {
  const { minCoords, top, maxCoords } = params;
  const time = Math.floor(timeElapsed * 100.0);

  timeElapsed -= time / 100.0;
  const particles = time * 50.0;

  for (let i = 0; i < particles; i++) {
    const offset = Math.random();
    const life = 5.25 - offset * 1.5;
    const velocity = Math.random() * 25 + 25;

    rainDrops.push({
      velocity: new Vector3(0.0, -velocity, 0.0),

      position: new Vector3(
        random(minCoords[0], maxCoords[0]),
        top - offset * 50,
        random(minCoords[1], maxCoords[1])
      ),

      maxLife: life,
      alpha: 1, // 0
      life
    });
  }
};

const updateParticles = (params: RainParams): void => {
  for (let p = 0; p < rainDrops.length; p++) {
    const particle = rainDrops[p];
    const { delta } = params;

    if ((particle.life -= delta) <= 0.0) continue;

    // const deltaLife = 1.0 - particle.life / particle.maxLife;
    const drag = particle.velocity.clone();
    const { x, y, z } = drag;

    // particle.alpha = this.alphaSpline.getValue(deltaLife);
    particle.position.add(drag.multiplyScalar(delta));

    drag.multiplyScalar(0.1).set(
      Math.sign(x) * Math.min(Math.abs(drag.x), Math.abs(x)),
      Math.sign(y) * Math.min(Math.abs(drag.y), Math.abs(y)),
      Math.sign(z) * Math.min(Math.abs(drag.z), Math.abs(z))
    );

    particle.velocity.sub(drag);
  }

  rainDrops = rainDrops.filter(
    particle => particle.life > 0.0
  )
    .sort((a: RainParticle, b: RainParticle) => {
      const aDistance = position.distanceToSquared(a.position);
      const bDistance = position.distanceToSquared(b.position);

      return aDistance > bDistance ? -1 : aDistance < bDistance ? 1 : 0;
    }
  );
};

const updateGeometry = (): RainParticles => {
  const position = [];
  const alpha = [];

  for (let p = 0, l = rainDrops.length; p < l; p++) {
    const particle = rainDrops[p];
    alpha.push(particle.alpha);

    position.push(
      particle.position.x,
      particle.position.y,
      particle.position.z
    );
  }

  return [position, alpha];
};
