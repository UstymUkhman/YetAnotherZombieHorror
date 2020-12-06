'use strict';

const path = require('path');
const env = require('yargs').argv.env;
const build = env === 'build' || env === 'app';
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  css: false,
  preprocess: sveltePreprocess({
    globalStyle: { sourceMap: !build },
    typescript: { tsconfigFile: './tsconfig.json' },

    scss: { importer: [url => {
      return url.indexOf('@') ? url : {
        file: url.replace('@', path.resolve('./src/components/utils'))
      };
    }]}
  })
};
