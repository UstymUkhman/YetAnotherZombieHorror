/**
 * This file is dynamically configured by the "yarn setup" script.
 *
 * Avoid any change to lines 9 - 11 as they are generated via "build/physics.mjs"
 * script which relies on the "ammoPhysics" option in "src/configs/settings.json".
 */

import Configs from '@/configs';
import AmmoPhysics from '@/physics/AmmoPhysics';

const Physics = new AmmoPhysics();

const { ammoPhysics } = Configs.Settings;
const physics = Physics.constructor.name;
const isAmmo = physics.includes('Ammo');

const ammo = ammoPhysics && !isAmmo;
const bvh = isAmmo && !ammoPhysics;

if (!PRODUCTION && (ammo || bvh)) {
  console.warn(
    'Physics settings don\'t match the actual engine in use.', '\n',
    'Please run "yarn setup" if you\'ve changed physics settings in JSON file', '\n',
    'or update "ammoPhysics" option if you have changed \'src/physics/index.ts\' manually.'
  );
}

export default Physics;
