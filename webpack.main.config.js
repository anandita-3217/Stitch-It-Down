const path = require('path');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js', 
  
  
  module: {
    rules: require('./webpack.rules'),
  },
  
  resolve: {
    // Add aliases for easier imports in main process
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    extensions: ['.js', '.json']
  },
  target: 'electron-main',
  devtool: 'source-map'

  
};