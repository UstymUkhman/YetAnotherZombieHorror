import { LoadingManager } from '@three/loaders/LoadingManager';

const dispatchEvent = function (loaded, total) {
  document.dispatchEvent(
    new CustomEvent('assets:loading', {
      detail: {
        loaded: loaded,
        total: total
      }
    })
  );
};

const loading = new LoadingManager();
dispatchEvent(0, 0);

loading.onStart = function (url, toLoad, total) {
  console.info('Loading... 0%');
  dispatchEvent(0, total);
};

loading.onProgress = function (url, loaded, total) {
  const progress = (loaded * 100 / total).toFixed();
  console.info(`Loading... ${progress}%`);
  dispatchEvent(loaded, total);
};

loading.onError = function (url) {
  console.info(`Error occurred loading: ${url}.`);
};

loading.onLoad = function () { };

export { loading };
