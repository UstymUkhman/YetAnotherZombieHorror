const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  emitCss: true,
  hotReload: true,
  preprocess: sveltePreprocess({
    typescript: { tsconfigFile: './tsconfig.json' },
    globalStyle: { sourceMap: true }
  })
}
