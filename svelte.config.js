const path = require('path');
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  css: false,
  preprocess: sveltePreprocess({
    globalStyle: { sourceMap: true },
    typescript: { tsconfigFile: './tsconfig.json' },

    scss: { importer: [url => {
      return url.indexOf('@scss') ? url : {
        file: url.replace('@scss', path.resolve('./src/components/scss'))
      };
    }]}
  })
};
