let execute = function (loader, fn, ...args) {
  return new Promise((resolve, reject) => {
    let onComplete = (result) => {
      resolve(result);
    };

    let onError = (error) => {
      reject(error);
    };

    let loaderCallbacks = fn === 'load' ? [onComplete, null, onError] : [onComplete, onError];
    loader[fn].apply(loader, args.concat(loaderCallbacks));
  });
};

let load = function (loader, ...args) {
  return execute.apply(null, [loader, 'load'].concat(args));
};

let parse = function (loader, ...args) {
  return execute.apply(null, [loader, 'parse'].concat(args));
};

export { load, parse };
