const rules = require('./webpack.rules');
const path = require('path');


rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Add rule for handling assets (images, gifs, sounds)
rules.push({
  test: /\.(png|jpe?g|gif|svg|ico)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'assets/images/[name][ext]'
  }
});

rules.push({
  test: /\.(mp3|wav|ogg|m4a)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'assets/sounds/[name][ext]'
  }
});

rules.push({
  test: /\.(woff|woff2|eot|ttf|otf)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'assets/fonts/[name][ext]'
  }
});

module.exports = {
  module: {
    rules,
  },
  
  resolve: {
    // Add aliases for cleaner imports
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@css': path.resolve(__dirname, 'src/css'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/js/components'),
      '@modules': path.resolve(__dirname, 'src/js/modules'),
    },
    extensions: ['.js', '.json', '.css'],
    fallback: {
      // Add fallbacks for Node.js modules if needed
      "path": false,
      "fs": false
    }

  },
  externals: {
    electron: 'commonjs electron'
  },

  
  // Optimize for development
  devtool: 'source-map',
  
  // Performance hints
  performance: {
    hints: false
  },
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named'
  }

};