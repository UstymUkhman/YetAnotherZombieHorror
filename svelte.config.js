const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  emitCss: true,
  hotReload: false,
  preprocess: sveltePreprocess({
    typescript: { tsconfigFile: './tsconfig.json' },
    globalStyle: { sourceMap: true }
  })
}
