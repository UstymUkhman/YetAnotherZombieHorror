# Yet Another Zombie Horror #
*or simply ***YAZH*** [jɑːʒ], is a first / third person zombie survival shooter.*

<br />

![GitHub deployments](https://img.shields.io/github/deployments/UstymUkhman/YetAnotherZombieHorror/github-pages)
![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/UstymUkhman/YetAnotherZombieHorror/.github/workflows/check-commit-message.yml?branch=main)
![GitHub repo size](https://img.shields.io/github/repo-size/UstymUkhman/YetAnotherZombieHorror)
![GitHub package.json version](https://img.shields.io/github/package-json/v/UstymUkhman/YetAnotherZombieHorror)
![GitHub](https://img.shields.io/github/license/UstymUkhman/YetAnotherZombieHorror)

[![Gameplay Trailer](./public/assets/images/thumbnail.jpg)](https://www.youtube.com/watch?v=DzxZ0I5d7_0)

## Download ##

```sh
git clone https://github.com/UstymUkhman/YetAnotherZombieHorror.git
cd YetAnotherZombieHorror
pnpm i
```

## Develop ##

```sh
pnpm run setup # Config physics engine and compile shaders
pnpm start:web # Run in development in a default browser
pnpm start:app # Run in development in Electron application
```

## Lint ##

```sh
pnpm lint:js  # TS, JS and Svelte files
pnpm lint:css # SCSS, CSS and Svelte files
```

## Build ##

```sh
pnpm build:web # Build for browsers
pnpm build:app # Build as Electron app
pnpm serve:web # Preview builded web version
```

## Distribute ##

```sh
pnpm pack:app
pnpm dist:app -l # for Linux, or:
pnpm dist:app -w # for Windows desktops
```

## Controls ##

| Action          | Desktop                 |
| --------------- | ----------------------- |
| Move Forward    | W                       |
| Move Left       | A                       |
| Move Backward   | S                       |
| Move Right      | D                       |
| Run             | Left Shift              |
| Shoot           | Mouse Left Button       |
| Aim             | Mouse Right Button      |
| Previous Weapon | Q *or* Mouse Wheel Up   |
| Next Weapon     | E *or* Mouse Wheel Down |
| Reload          | R                       |
| Change Camera   | C                       |
| Change Shoulder | V                       |

## Settings ##

### Physics ###

| Option | Type              | Default Value |
| ------ | ----------------- | ------------- |
| Engine | *"ammo" \| "bvh"* | `"bvh"`       |

**Note:** *This option can only be changed manually in `src/settings/physics.json` before launching the game. Every time this setting is updated, you will need to run `pnpm run setup` in order to use the corresponding physics engine [in here](https://github.com/UstymUkhman/YetAnotherZombieHorror/blob/main/src/physics/index.ts). If set to:*

  - `"ammo"` - [**ammo.js**](https://github.com/kripken/ammo.js), a direct port of [Bullet Physics Engine](https://pybullet.org/) will be used.
  - `"bvh"` - [**three-mesh-bvh**](https://github.com/gkjohnson/three-mesh-bvh) will be used, which may lead to slightly better performance.

### Visuals ###

| Option          | Type      | Default Value | Description |
| --------------- | --------- | ------------- | ----------- |
| Bullet          | *Boolean* | `true`        | Whether there will be visible projectile meshes. Setting this to `false` may lead to slightly better performance. |
| Bullet Path     | *Boolean* | `false`       | Whether there will be visible bullet's trajectory from the barrel of the weapon to the projectile. Setting this to `true` may lead to slightly worse performance on low-end devices. |
| Bullet Holes    | *Boolean* | `false`       | Whether there will be visible bullets holes on buildings, walls and ground. Setting this to `true` may lead to slightly worse performance on low-end devices. |
| Fog             | *Boolean* | `true`        | Whether there will be fog on the level. |
| Volumetric Fog  | *Boolean* | `false`       | Whether to use [Volumetric Fog](https://www.gamedeveloper.com/programming/atmospheric-scattering-and-volumetric-fog-algorithm-part-1) instead of the [exponential squared](https://threejs.org/docs/#api/en/scenes/FogExp2) on the level. Setting this to `true` will lead to worse performance on low-end devices. **Can be `true` only if `fog` is `true`.** |
| Raining         | *Boolean* | `true`        | Whether it will be raining on the level. Setting this to `false` will lead to better performance. |
| Raindrops       | *Boolean* | `false`       | Whether there will be an overlay of raindrops on the camera. Setting this to `true` will lead to slightly worse performance on low-end devices. **Can be `true` only if `raining` is `true`.** |
| Soft Particles  | *Boolean* | `false`       | Whether to use [Soft Particles](https://developer.download.nvidia.com/whitepapers/2007/SDK10/SoftParticles_hi.pdf) effect on raindrops on the level. Setting this to `true` may lead to slightly worse performance on low-end devices. **Can be `true` only if `raining` is `true`.** |
| Clouds         | *Number*  | `0`            | Amount of cloud sprites that will be covering the skybox. Incrementing this number may lead to slightly worse performance on low-end devices. **Min value is `0`; max value is `300`.** |
| Dynamic Clouds  | *Boolean* | `false`       | Whether clouds will be rotating. Setting this to `true` may lead to slightly worse performance on low-end devices. **Can be `true` only if `clouds` is greater than `0`.** |
| Lighting        | *Boolean* | `false`       | Whether there will be lightning strikes on the level. Setting this to `true` may lead to slightly worse performance on low-end devices. **Can be `true` only if `clouds` is greater than `0`.** |
| Physical Lights | *Boolean* | `false`       | Whether to use physically correct lighting mode. Setting this to `true` will lead to worse performance on low-end devices. |
