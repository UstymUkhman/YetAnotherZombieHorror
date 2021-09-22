import { updateRainParticles } from '@/worker/updateRainParticles';
import LevelScene from '@/environment/LevelScene';
import { CameraObject } from '@/managers/Camera';

describe('updateRainParticles', () => {
  test('updateRainParticles', () => {
    const maxCoords = LevelScene.maxCoords;
    const minCoords = LevelScene.minCoords;

    for (let i = 0; i < 10; i++) {
      const particles = updateRainParticles({
        camera: CameraObject.position,
        minCoords: minCoords,
        maxCoords: maxCoords,
        delta: i
      });

      const position = particles[0];
      const angle = particles[1];
      const opacity = particles[2];

      expect(position.length).toBeGreaterThanOrEqual(0);
      expect(position.length).toBeLessThanOrEqual(i * 25000);

      expect(angle.length).toBeGreaterThanOrEqual(0);
      expect(angle.length).toBeLessThanOrEqual(i * 25000);

      expect(opacity.length).toBeGreaterThanOrEqual(0);
      expect(opacity.length).toBeLessThanOrEqual(i * 25000);
    }
  });
});
