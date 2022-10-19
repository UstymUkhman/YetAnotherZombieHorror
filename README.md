# [Yet Another Zombie Horror](http://35.158.218.205/experiments/YetAnotherZombieHorror/) #
*or simply ***YAZH*** [[jɑːʒ](http://35.158.218.205/experiments/YetAnotherZombieHorror/assets/sounds/YAZH.mp3)], is a first / third person zombie survival shooter.*

<br />

![GitHub deployments](https://img.shields.io/github/deployments/UstymUkhman/YetAnotherZombieHorror/github-pages)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/UstymUkhman/YetAnotherZombieHorror/Check%20commit%20message%20style/main)
![GitHub repo size](https://img.shields.io/github/repo-size/UstymUkhman/YetAnotherZombieHorror)
![GitHub package.json version](https://img.shields.io/github/package-json/v/UstymUkhman/YetAnotherZombieHorror)
![GitHub](https://img.shields.io/github/license/UstymUkhman/YetAnotherZombieHorror)

## Download ##

`git clone https://github.com/UstymUkhman/YetAnotherZombieHorror.git`

`cd YetAnotherZombieHorror`

`pnpm i`

## Develop ##

`pnpm run setup`

`pnpm start:web`

`pnpm start:app`

`pnpm lint:js`

`pnpm lint:css`

## Build ##

`pnpm build:web`

`pnpm build:app`

## Test ##

`pnpm test:run`

`pnpm test:cover`

`pnpm serve:web`

## Distribute ##

`pnpm pack:app`

  - **Linux:** `pnpm dist:app -l`

  - **Windows:** `pnpm dist:app -w`

## Settings ##

### Environment ###

| Option          | Type      | Default Value | Description |
| --------------- | --------- | ------------- | ----------- |
| Raining         | *Boolean* | `true`        | Whether it will be raining in the level. Setting this to `false` will lead to better performance. |
| Lighting        | *Boolean* | `true`        | Whether there will be lightning strikes in the level. Setting this to `false` will lead to slightly better performance. **Can be `true` only if `clouds` is greater than `0`.** |
| Raindrops       | *Boolean* | `false`       | Whether there will be an overlay of raindrops on the camera. Setting this to `true` will lead to slightly worse performance on low-end devices. **Can be `true` only if `raining` is `true`.** |
| Soft Particles  | *Boolean* | `false`       | Whether to use [Soft Particles](https://developer.download.nvidia.com/whitepapers/2007/SDK10/SoftParticles_hi.pdf) effect on raindrops in the level. Setting this to `true` will lead to slightly worse performance on low-end devices. **Can be `true` only if `raining` is `true`.** |
| Fog             | *Boolean* | `false`       | Whether there will be fog in the level. |
| Baked Fog       | *Boolean* | `false`       | Whether to use noise texture instead of the [Fractional Brownian Motion](https://www.iquilezles.org/www/articles/fbm/fbm.htm) algorithm to generate Volumetric Fog effect. Setting this to `true` will lead to better performance. **Can be `true` only if `fog` and `volumetricFog` are `true`.** |
| Volumetric Fog  | *Boolean* | `false`       | Whether to use [Volumetric Fog](https://www.gamedeveloper.com/programming/atmospheric-scattering-and-volumetric-fog-algorithm-part-1) instead of the [exponential squared](https://threejs.org/docs/#api/en/scenes/FogExp2) in the level. Setting this to `true` will lead to worse performance on low-end devices. **Can be `true` only if `fog` is `true`.** |
| Clouds         | *Number*  | `300`          | Amount of cloud sprites that will be covering the skybox. Reducing this number may lead to slightly better performance. **Min value is `0`; max value is `300`.** |
| Dynamic Clouds  | *Boolean* | `true`        | Whether clouds will be rotating. Setting this to `false` will lead to slightly better performance. **Can be `true` only if `clouds` is greater than `0`.** |
| Physical Lights | *Boolean* | `false`       | Whether to use physically correct lighting mode. Setting this to `true` will lead to slightly worse performance on low-end devices. |

### Physics ###

| Option | Type      | Default Value |
| ------ | --------- | ------------- |
| ammo   | *Boolean* | `false`       |

**Note:** *This option can only be changed manually in `src/settings/physics.json` before launching the game. Every time this setting is updated, you will need to run `pnpm run setup` in order to use the corresponding Physics Engine [in here](https://github.com/UstymUkhman/YetAnotherZombieHorror/blob/main/src/physics/index.ts). If set to:*

  - `true` - [**ammo.js**](https://github.com/kripken/ammo.js), a direct port of [Bullet Physics Engine](https://pybullet.org/) will be used.
  - `false` - [**three-mesh-bvh**](https://github.com/gkjohnson/three-mesh-bvh) will be used, which may lead to slightly better performance.

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
