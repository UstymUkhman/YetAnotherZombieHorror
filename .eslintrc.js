module.exports = {
  root: true,

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,

    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true
    }
  },

  settings: {
    'svelte3/ignore-styles': () => {
      return { ignore: true }
    }
  },

  plugins: ['svelte3', 'prettier'],
  extends: ['prettier'],

  overrides: [{
    processor: 'svelte3/svelte3',
    files: ['**/*.svelte']
  }],

  parser: 'babel-eslint',

  globals: {
    navigator: false,
    document: false,
    unescape: false,
    describe: true,
    escape: false,
    window: false,
    before: true,
    expect: true,
    THREE: false,
    sinon: true,
    it: true
  },

  env: {
    browser: true,
    node: true,
    es6: true
  }
};
