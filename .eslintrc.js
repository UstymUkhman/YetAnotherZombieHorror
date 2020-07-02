module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,

  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended'
  ],

  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },

  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/no-namespace': 0,
    'generator-star-spacing': 0,
    'quotes': [2, 'single'],
    'comma-dangle': 2,
    'no-debugger': 0,
    'no-console': 0,
    'semi': 2
  },

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
