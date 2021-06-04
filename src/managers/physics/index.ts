import { Config } from '@/config';
import type PhysicsWorld from './PhysicsWorld';

export default new (await import(
  Config.Settings.ammoPhysics
    ? './AmmoPhysics' : './BVHPhysics'
  ) as {
    default: { new (): PhysicsWorld }
  }
).default;
