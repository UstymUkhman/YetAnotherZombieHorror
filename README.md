# [Yet Another Zombie Horror](http://35.158.218.205/experiments/YetAnotherZombieHorror/) #
> or simply ***YAZH*** [[jɑːʒ](http://35.158.218.205/experiments/YetAnotherZombieHorror/assets/sounds/YAZH.mp3)], is a first / third person zombie survival shooter.

<br />

![GitHub deployments](https://img.shields.io/github/deployments/UstymUkhman/YetAnotherZombieHorror/github-pages)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/UstymUkhman/YetAnotherZombieHorror/Check%20commit%20message%20style/main)
![GitHub repo size](https://img.shields.io/github/repo-size/UstymUkhman/YetAnotherZombieHorror)
![GitHub package.json version](https://img.shields.io/github/package-json/v/UstymUkhman/YetAnotherZombieHorror)
![GitHub](https://img.shields.io/github/license/UstymUkhman/YetAnotherZombieHorror)

## Download ##

`git clone https://github.com/UstymUkhman/YetAnotherZombieHorror.git`

`cd YetAnotherZombieHorror`

`yarn`

## Develop ##

`yarn setup`

`yarn start:web`

`yarn start:app`

`yarn lint:js`

`yarn lint:css`

## Build ##

`yarn build:web`

`yarn build:app`

## Test ##

`yarn test:run`

`yarn test:cover`

`yarn serve:web`

## Distribute ##

`yarn pack:app`

  - **Linux:** `yarn dist:app -l`

  - **Windows:** `yarn dist:app -w`

## Settings ##

### Environment ###

| Option         | Type      | Default Value | Description |
| -------------- | --------- | ------------- | ------ |
| raining        | *Boolean* | `true`        | Whether it will be raining in the level. Setting this to `false` will lead to better performance. |
| lighting       | *Boolean* | `true`        | Whether there will be lightning strikes in the level. Setting this to `false` will lead to slightly better performance. **Can be `true` only if `clouds` is greater than `0`.** |
| raindrops      | *Boolean* | `true`        | Whether there will an overlay of raindrops on the camera. Setting this to `false` will lead to better performance. **Can be `true` only if `raining` is `true`.** |
| softParticles  | *Boolean* | `true`        | Whether to use [Soft Particles](https://developer.download.nvidia.com/whitepapers/2007/SDK10/SoftParticles_hi.pdf) effect on raindrops in the level. Setting this to `false` will lead to better performance. **Can be `true` only if `raining` is `true`.** |
| fog            | *Boolean* | `true`        | Whether there will be fog in the level. |
| bakedFog       | *Boolean* | `true`        | Whether to use noise texture instead of the [Fractional Brownian Motion](https://www.iquilezles.org/www/articles/fbm/fbm.htm) algorithm to generate Volumetric Fog effect. Setting this to `true` will lead to better performance. **Can be `true` only if `fog` and `volumetricFog` are `true`.** |
| volumetricFog  | *Boolean* | `true`        | Whether to use [Volumetric Fog](https://www.gamedeveloper.com/programming/atmospheric-scattering-and-volumetric-fog-algorithm-part-1) instead of the [exponential squared](https://threejs.org/docs/#api/en/scenes/FogExp2) in the level. Setting this to `false` will lead to better performance. **Can be `true` only if `fog` is `true`.** |
| clouds         | *Number*  | `300`         | Amount of cloud sprites that will be covering the skybox. Reducing this number may lead to slightly better performance. **Min value is `0`; max value is `300`.** |
| dynamicClouds  | *Boolean* | `true`        | Whether clouds will be rotating. Setting this to `false` will lead to slightly better performance. **Can be `true` only if `clouds` is greater than `0`.** |
| physicalLights | *Boolean* | `true`        | Whether to use physically correct lighting mode. Setting this to `false` will lead to slightly better performance. |

### Physics ###

| Option | Type      | Default Value |
| ------ | --------- | ------------- |
| ammo   | *Boolean* | `false`       |

**Note:** *This option can only be changed manually in `src/settings/physics.json` before launching the game. Every time this setting is updated, you will need to run `yarn setup` in order to use the corresponding Physics Engine [in here](https://github.com/UstymUkhman/YetAnotherZombieHorror/blob/main/src/physics/index.ts). If set to:*

  - `true` - [**ammo.js**](https://github.com/kripken/ammo.js), a direct port of [Bullet Physics Engine](https://pybullet.org/) will be used.
  - `false` - [**three-mesh-bvh**](https://github.com/gkjohnson/three-mesh-bvh) will be used, which may lead to slightly better performance.

## Controls ##

| Action          | Desktop PC              |
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

## Credits ##

  - *Dependencies:*

    - [ammo.js](https://github.com/kripken/ammo.js)
    - [animejs](https://github.com/juliangarnier/anime/)
    - [raindrop-fx](https://github.com/SardineFish/raindrop-fx)
    - [three.js](https://github.com/mrdoob/three.js)
    - [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)
    - [three-pathfinding](https://github.com/donmccurdy/three-pathfinding)

  - *Level:*

    - 

  - *Skybox:*

    - [wwwtyro](https://github.com/wwwtyro) - [space-3d](https://github.com/wwwtyro/space-3d)

  - *Characters & Animations:*
  
    - [Mixamo](https://www.mixamo.com/#/)

  - *Weapons:*

    - 

  - *Music:*

    - [Hollywood Undead](https://www.hollywoodundead.com/) - Day Of The Dead
  
  - *SFX:*

    - [Storyblocks](https://www.storyblocks.com/)
    - [mixkit](https://mixkit.co/)

  - *Physics:*

    - [ammo.js](https://github.com/kripken/ammo.js)
    - [three-mesh-bvh](https://gkjohnson.github.io/three-mesh-bvh/example/bundle/characterMovement.html)

  - *Effects:*

    - [SardineFish](https://github.com/SardineFish) - [Screen Raindrops](https://cdn-lab.sardinefish.com/rain/)
    - [simondev](https://github.com/simondevyoutube) - [Volumetric Fog](https://www.youtube.com/watch?v=k1zGz55EqfU) | [Soft Particles](https://www.youtube.com/watch?v=arn_3WzCJQ8) | [Custom Blending](https://www.youtube.com/watch?v=AxopC4yW4uY)
