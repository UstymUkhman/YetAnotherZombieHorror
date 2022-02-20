'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const sveltePreprocess = require('svelte-preprocess');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  css: false,
  preprocess: sveltePreprocess({
    typescript: { tsconfigFile: './tsconfig.json' },
    globalStyle: { sourceMap: process.env.NODE_ENV !== 'production' },

    scss: { importer: [url => {
      return url.indexOf('@') ? url : {
        file: url.replace('@', path.resolve('./src/components/scss'))
      };
    }]}
  })
};
