module.exports = {
  env: {
    test: {
      plugins: [
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
};
