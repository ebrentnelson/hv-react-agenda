var webpack = require('webpack');

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.COMPRESS) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
}

module.exports = {

  output: {
    library: 'HvReactAgenda',
    libraryTarget: 'var'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader?harmony' }
    ]
  },

  externals: {
    'react/addons': 'React',
    moment: 'moment',
    underscore: '_'
  },

  node: {
    Buffer: false
  },

  plugins: plugins

};
