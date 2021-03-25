import PhysicsWorld from './PhysicsWorld';
import { Config } from '@/config';

export default new (
  (Config.Settings.ammoPhysics
    ? require('./AmmoPhysics')
    : require('./BVHPhysics')
  ).default as {
    new (): PhysicsWorld
  }
);
