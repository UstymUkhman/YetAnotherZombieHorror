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
  console.log(`Loading Started: ${toLoad} of ${total}.`);
  dispatchEvent(0, total);
};

loading.onProgress = function (url, loaded, total) {
  console.log(`Loaded: ${loaded} of ${total}.`);
  dispatchEvent(loaded, total);
};

loading.onError = function (url) {
  console.log(`Error occurred loading: ${url}.`);
};

loading.onLoad = function () {
  console.log('Loading complete!');
};

export { loading };
