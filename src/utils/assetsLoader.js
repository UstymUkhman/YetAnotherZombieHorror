import { CubeTextureLoader } from '@three/loaders/CubeTextureLoader';
import { TextureLoader } from '@three/loaders/TextureLoader';
import { GLTFLoader } from '@loaders/GLTFLoader';
import { RGBFormat } from '@three/constants';
import { loading } from '@/utils/loading';
import { load } from '@/utils/promise';

import to from 'await-to-js';

const textureLoader = (file) => {
  return new Promise(async (resolve, reject) => {
    if (file) {
      let texture;

      if (typeof file === 'function') {
        let error;
        [error, texture] = await to(file());

        if (error) {
          reject(error);
          return;
        }

        texture = texture.default;
      } else {
        texture = file;
      }

      let loader = new TextureLoader(loading);
      let [error, img] = await to(load(loader, texture));

      if (error) {
        reject(error);
        return;
      }

      resolve(img);
    } else {
      reject(new Error('No Texture specified'));
    }
  });
};

const envMapLoader = (files) => {
  return new Promise(async (resolve, reject) => {
    let envmapFiles;

    if (typeof files[0] === 'function') {
      let error;
      [error, envmapFiles] = await to(Promise.all(files.map(f => f())));

      if (error) {
        reject(error);
        return;
      }

      envmapFiles = envmapFiles.map(file => file.default);
    } else {
      envmapFiles = files;
    }

    if (envmapFiles) {
      let [error, envMap] = await to(load(new CubeTextureLoader(), envmapFiles));

      if (error) {
        reject(error);
        return;
      }

      envMap.format = RGBFormat;
      resolve(envMap);
    }
  });
};

const gltfLoader = (file, envMap = null) => {
  return new Promise(async (resolve, reject) => {
    if (file) {
      let gltfFile;

      if (typeof file === 'function') {
        let error;
        [error, gltfFile] = await to(file());

        if (error) {
          reject(error);
          return;
        }

        gltfFile = gltfFile.default;
      } else {
        gltfFile = file;
      }

      let textureCube;
      let loader = new GLTFLoader(loading);
      let [error, gltf] = await to(load(loader, gltfFile));

      if (error) {
        reject(error);
        return;
      }

      if (envMap) {
        [error, textureCube] = await to(envMapLoader(envMap));

        if (error) {
          reject(error);
          return;
        }

        resolve({
          animations: gltf.animations,
          envMap: textureCube,
          scene: gltf.scene
        });
      }

      resolve(gltf);
    } else {
      reject(new Error('No GLTF specified'));
    }
  });
};

export {
  textureLoader,
  envMapLoader,
  gltfLoader
};
