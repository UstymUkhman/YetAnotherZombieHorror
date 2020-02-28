import { LoadingManager } from '@three/loaders/LoadingManager';
import Events from '@/managers/Events';

const loading = new LoadingManager();

loading.onStart = function (url, toLoad, total) {
  Events.dispatch('loading', 0);
  console.info('Loading... 0%');
};

loading.onProgress = function (url, loaded, total) {
  const progress = (loaded * 100 / total).toFixed();

  Events.dispatch('loading', progress);
  console.info(`Loading... ${progress}%`);
};

loading.onError = function (url) {
  console.info(`Error occurred loading ${url}.`);
};

loading.onLoad = function () { };

export { loading };
