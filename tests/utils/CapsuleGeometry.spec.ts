import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { Geometry } from '@three/core/Geometry';

describe('CapsuleGeometry', () => {
  test('create', () => {
    const capsule = CapsuleGeometry(20, 50);
    expect(capsule).toBeInstanceOf(Geometry);
  });
});
