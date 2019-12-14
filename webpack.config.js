const path = require('path');
const webpack = require('webpack');
const config = require('./package.json');

const build = require('yargs').argv.env === 'build';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

process.env.NODE_ENV = build ? 'production' : 'development';
const PORT = process.env.PORT && Number(process.env.PORT);
const HOST = process.env.HOST;

const productionPlugins = [
  new UglifyJsPlugin({
    sourceMap: true,
    parallel: true,

    uglifyOptions: {
      sourceMap: true,
      parallel: true,

      compress: {
        drop_console: true,
        conditionals: true,
        comparisons: true,
        dead_code: true,
        if_return: true,
        join_vars: true,
        warnings: false,
        unused: true
      },

      output: {
        comments: false
      }
    }
  }),

  new webpack.optimize.ModuleConcatenationPlugin()
];

module.exports = {
  devtool: build ? '#source-map' : 'cheap-module-eval-source-map',
  mode: build ? 'production' : 'development',
  entry: path.resolve('./src/main.js'),

  module: {
    rules: [{
      enforce: 'pre',
      test: /(\.js)$/,
      loader: 'eslint-loader',
      include: [path.resolve('./src')],

      options: {
        emitWarning: !build,
        formatter: require('eslint-friendly-formatter')
      }
    }, {
      test: /\.svelte$/,
      loader: 'svelte-loader',

      options: {
        emitCss: true,
        hotReload: false,
      }
    }, {
      test: /\.css$/,
      use: [
        build ? MiniCssExtractPlugin.loader : 'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: [
        path.resolve('./src'),
        path.resolve('./node_modules/webpack-dev-server/client'),
        path.resolve('./node_modules/three/src')
      ]
    }, {
      test: /\.(mp4|webm)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('assets/music', '[name].[ext]')
      }
    }, {
      test: /\.(ogg|mp3|wav|flac|aac)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('assets/sfx', '[name].[ext]')
      }
    }, {
      test: /\.(glsl|vert|frag)$/i,
      loader: 'threejs-glsl-loader'
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('assets/fonts', '[name].[ext]')
      }
    }, {
      test: /\.(gltf)$/i,
      loader: 'gltf-loader-2'
    }, {
      test: /\.(bin|gif|glb)(\?.*)?$/i,
      loader: 'file-loader',
      options: {
        name: path.posix.join('assets/models', '[name].[ext]')
      }
    }, {
      test: /\.(png|jpe?g|cube)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          name: path.posix.join('assets/img', '[name].png')
        }
      }, {
        loader: 'lut-loader'
      }]
    }]
  },

  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    extensions: ['.svelte', '.mjs', '.js', '.json'],

    alias: {
      '@controls': path.resolve('./node_modules/three/examples/jsm/controls'),
      '@loaders': path.resolve('./node_modules/three/examples/jsm/loaders'),
      '@utils': path.resolve('./node_modules/three/examples/jsm/utils'),
      '@three': path.resolve('./node_modules/three/src'),
      '@': path.resolve('./src')
    }
  },

  plugins: [
    new MiniCssExtractPlugin({
			filename: 'main.css'
		}),

    new webpack.DefinePlugin({
      BROWSER_SUPPORTS_HTML5: true,
      PRODUCTION: JSON.stringify(build),
      VERSION: JSON.stringify(config.version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    ...(build ? productionPlugins : [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])
  ],

  output: {
    globalObject: build ? 'typeof self !== \'undefined\' ? self : this' : 'window',
    libraryTarget: build ? 'umd' : 'var',
    library: build ? config.name : '',
    publicPath: build ? './' : '/',

    path: path.resolve('./public'),
    libraryExport: 'default',
    umdNamedDefine: true,
    filename: 'main.js'
  },

  optimization: {
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    removeEmptyChunks: true,
    namedModules: true,
    namedChunks: true,
    minimize: build
  },

  devServer: {
    contentBase: path.join(__dirname, './public'),
    clientLogLevel: 'warning',
    host: HOST || 'localhost',
    watchContentBase: true,
    port: PORT || 8080,
    publicPath: '/',

    compress: true,
    overlay: true,
    quiet: false,
    open: false,
    hot: true,

    watchOptions: {
      poll: false,
    }
  },

  node: {
    child_process: 'empty',
    setImmediate: false,
    dgram: 'empty',
    net: 'empty',
    tls: 'empty',
    fs: 'empty'
  }
};
