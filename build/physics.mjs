import { join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const PHYSICS_FILE = join(resolve(), 'src/physics/index.ts');
const SETTINGS_FILE = join(resolve(), 'src/configs/settings.json');

const Physics = readFileSync(PHYSICS_FILE).toString();
const Settings = readFileSync(SETTINGS_FILE).toString();

writeFileSync(PHYSICS_FILE,
  JSON.parse(Settings).ammoPhysics
  ? Physics.replace(/BVH/g, 'Ammo')
  : Physics.replace(/Ammo/g, 'BVH')
);
