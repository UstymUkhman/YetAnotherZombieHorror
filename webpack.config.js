'use strict';

const path = require('path');
const webpack = require('webpack');
const config = require('./package.json');
const app = require('yargs').argv.env === 'app';
const svelteConfig = require('./svelte.config.js');
const ESLintPlugin = require('eslint-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const build = require('yargs').argv.env === 'build' || app;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThreeMinifierPlugin = require('@yushijinhun/three-minifier-webpack');

process.env.NODE_ENV = build ? 'production' : 'development';
const PORT = process.env.PORT && Number(process.env.PORT);
const threeMinifierPlugin = new ThreeMinifierPlugin();
const HOST = process.env.HOST;

module.exports = {
  devtool: build ? false : 'eval-cheap-module-source-map',
  entry: path.resolve('./src/main.ts'),
  name: 'YetAnotherZombieHorror',
  mode: process.env.NODE_ENV,

  module: {
    rules: [{
      test: /\.svelte$/,
      loader: 'svelte-loader',
      exclude: /node_modules/,
      options: {
        emitCss: true,
        ...svelteConfig,
        hotReload: false
      }
    }, {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }, {
      test: /\.s?css$/,
      use: !build ? ['style-loader', 'css-loader', 'sass-loader'] : [{
        loader: MiniCssExtractPlugin.loader,
        options: { publicPath: '../' }
      }, {
        options: { sourceMap: false },
        loader: 'css-loader'
      }]
    }, {
      test: /\.(mp4|webm)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('assets/videos', '[name].[ext]')
      }
    }, {
      test: /\.(ogg|mp3|wav|flac|aac)(\?.*)?$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('assets/sounds', '[name].[ext]')
      }
    }, {
      test: /\.(vs|fs|vert|frag|glsl)$/i,
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
          name: path.posix.join('assets/images', '[name].png')
        }
      }, {
        loader: 'lut-loader'
      }]
    }]
  },

  plugins: [
    threeMinifierPlugin,

    new ESLintPlugin({
      emitWarning: !build,
      formatter: require('eslint-friendly-formatter'),
    }),

    new MiniCssExtractPlugin({
      chunkFilename: 'styles/[name].css',
      filename: 'styles/index.css'
		}),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      BUILD: JSON.stringify(config.version),
      BROWSER_SUPPORTS_HTML5: true,
      PRODUCTION: build && !app
    }),

    ...(build ? [
      new webpack.optimize.ModuleConcatenationPlugin()
    ] : [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])
  ],

  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.svelte', '.mjs', '.ts', '.tsx', '.js', '.json'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    plugins: [threeMinifierPlugin.resolver],

    alias: {
      '@components': path.resolve('./src/components'),
      '@scss': path.resolve('./src/components/scss'),
      '@': path.resolve('./src')
    }
  },

  output: {
    libraryTarget: build ? 'umd' : 'var',
    chunkFilename: 'scripts/[name].js',
    library: build ? config.name : '',
    path: path.resolve('./public'),

    publicPath: build ? './' : '/',
    filename: 'scripts/index.js',
    libraryExport: 'default',

    umdNamedDefine: true,
    globalObject: 'this'
  },

  optimization: {
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    removeEmptyChunks: true,
    namedModules: true,
    namedChunks: true,
    minimize: build,

    minimizer: [
      new TerserPlugin({
        sourceMap: !build,
        parallel: true,

        terserOptions: {
          toplevel: true,

          parse: {
            html5_comments: false
          },

          compress: {
            keep_infinity: true,
            drop_console: true
          },

          output: {
            comments: false
          }
        }
      })
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, './public'),
    headers: { 'Content-Encoding': 'none' },
    watchOptions: { poll: false },
    clientLogLevel: 'warning',

    host: HOST || 'localhost',
    watchContentBase: true,
    port: PORT || 8080,
    publicPath: '/',

    compress: true,
    overlay: true,
    quiet: false,
    open: false,
    hot: true
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
