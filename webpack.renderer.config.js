// const rules = require('./webpack.rules');
// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// rules.push({
//   test: /\.css$/,
//   use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
// });

// // Add rule for handling assets (images, gifs, sounds)
// rules.push({
//   test: /\.(png|jpe?g|gif|svg|ico)$/i,
//   type: 'asset/resource',
//   generator: {
//     filename: 'assets/images/[name][ext]'
//   }
// });
// rules.push({
//   test: /\.(mp3|wav|ogg|m4a)$/i,
//   type: 'asset/resource',
//   generator: {
//     filename: 'assets/sounds/[name][ext]'
//   }
// });
// rules.push({
//   test: /\.(woff|woff2|eot|ttf|otf)$/i,
//   type: 'asset/resource',
//   generator: {
//     filename: 'assets/fonts/[name][ext]'
//   }
// });
// module.exports = {
//   // Define multiple entry points for your different pages
//   entry: {
//     // index: './src/js/renderer.js',
//     // timer: './src/js/timer-renderer.js',
//     // // Add other page entries if you have separate JS files for them
//     // // calendar: './src/js/pages/calendar.js',
//     // // notes: './src/js/pages/notes.js',
//     // // etc.
//     entry: {
//     main_window: './src/js/renderer.js',
//     timer_window: './src/js/timer-renderer.js',
//     // tasks_window: './src/js/tasks-renderer.js',
//     // notes_window: './src/js/notes-renderer.js',
//     // calendar_window: './src/js/calendar-renderer.js',
//     // stats_window: './src/js/stats-renderer.js',
//     // settings_window: './src/js/settings-renderer.js'
//   }

//   },
  
//   module: {
//     rules,
//   },
  
//   resolve: {
//     // Add aliases for cleaner imports
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//       '@assets': path.resolve(__dirname, 'src/assets'),
//       '@css': path.resolve(__dirname, 'src/css'),
//       '@js': path.resolve(__dirname, 'src/js'),
//       '@pages': path.resolve(__dirname, 'src/pages'),
//       '@components': path.resolve(__dirname, 'src/js/components'),
//       '@modules': path.resolve(__dirname, 'src/js/modules'),
//     },
//     extensions: ['.js', '.json', '.css']
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       filename: 'index.html',
//       chunks: ['index'],
//       template: './src/pages/index.html',
//     }),
//     new HtmlWebpackPlugin({
//       filename: 'timer.html',
//       chunks: ['timer'],
//       template: './src/pages/timer.html',
//     }),
//   ],

  
//   // Optimize for development
//   devtool: 'source-map',
  
//   // Performance hints
//   performance: {
//     hints: false
//   }
// };
const rules = require('./webpack.rules');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    extensions: ['.js', '.json', '.css']
  },
  
  // Optimize for development
  devtool: 'source-map',
  
  // Performance hints
  performance: {
    hints: false
  }
};