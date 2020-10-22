import { BufferGeometry } from '@three/core/BufferGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';

describe('CapsuleGeometry', () => {
  test('create', () => {
    const capsule = new CapsuleGeometry(0.25, 1.2);

    expect(capsule).toBeInstanceOf(BufferGeometry);
    expect(capsule.radius).toStrictEqual(0.25);
    expect(capsule.height).toStrictEqual(1.2);
  });
});
