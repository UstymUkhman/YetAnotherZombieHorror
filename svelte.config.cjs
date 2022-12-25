/* eslint-disable @typescript-eslint/no-var-requires */
const resolve = require('path').resolve;
const svelte = require('svelte-preprocess');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  css: false,
  preprocess: svelte({
    typescript: { tsconfigFile: './tsconfig.json' },
    globalStyle: { sourceMap: process.env.NODE_ENV !== 'production' },

    scss: {
      importer: [url => {
        return url.indexOf('@') ? url : {
          file: url.replace('@', resolve('./src/components/scss'))
        };
      }]
    }
  })
};
