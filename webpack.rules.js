// module.exports = [
//   // Add support for native node modules
//   {
//     // We're specifying native_modules in the test because the asset relocator loader generates a
//     // "fake" .node file which is really a cjs file.
//     test: /native_modules[/\\].+\.node$/,
//     use: 'node-loader',
//   },
//   {
//     test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
//     parser: { amd: false },
//     use: {
//       loader: '@vercel/webpack-asset-relocator-loader',
//       options: {
//         outputAssetBase: 'native_modules',
//       },
//     },
//   },
//   // Put your webpack loader rules in this array.  This is where you would put
//   // your ts-loader configuration for instance:
//   /**
//    * Typescript Example:
//    *
//    * {
//    *   test: /\.tsx?$/,
//    *   exclude: /(node_modules|.webpack)/,
//    *   loaders: [{
//    *     loader: 'ts-loader',
//    *     options: {
//    *       transpileOnly: true
//    *     }
//    *   }]
//    * }
//    */
// ];
module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  // CSS loader
  {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  },
  // Image and asset loaders
  {
    test: /\.(png|jpe?g|gif|svg|ico)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/images/[name][ext]'
    }
  },
  // Font loader
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/fonts/[name][ext]'
    }
  },
  // Audio files
  {
    test: /\.(mp3|wav|ogg)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/sounds/[name][ext]'
    }
  }
];
