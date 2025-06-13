// const { FusesPlugin } = require('@electron-forge/plugin-fuses');
// const { FuseV1Options, FuseVersion } = require('@electron/fuses');

// module.exports = {
//   packagerConfig: {
//     asar: true,
//     icon: './src/assets/images/characters/stitch-wink'
//   },
//   rebuildConfig: {},
//   makers: [
//     {
//       name: '@electron-forge/maker-squirrel',
//       config: {
//         iconUrl: './src/assets/images/characters/stitch-wink.ico',
//         setupIcon: './src/assets/images/characters/stitch-wink.ico'

//       },
//     },
//     {
//       name: '@electron-forge/maker-zip',
//       platforms: ['darwin'],
//     },
//     {
//       name: '@electron-forge/maker-deb',
//       config: {
//         icon: './src/assets/images/characters/stitch-wink.png'

//       },
//     },
//     {
//       name: '@electron-forge/maker-rpm',
//       config: {},
//     },
//   ],
//   plugins: [
//     {
//       name: '@electron-forge/plugin-auto-unpack-natives',
//       config: {},
//     },
//     {
//       name: '@electron-forge/plugin-webpack',
//       config: {
//         mainConfig: './webpack.main.config.js',
//         devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
//         renderer: {
//           config: './webpack.renderer.config.js',
//           entryPoints: [
//             {
//               html: './src/pages/index.html',
//               js: './src/js/renderer.js',
//               name: 'main_window',
//               preload: {
//                 js: './src/preload.js',
//               },
//             },
//             {
//               html: './src/pages/timer.html',
//               js: './src/js/timer-renderer.js',
//               name: 'timer',
//               preload: {
//                 js: './src/preload.js',
//               },
//             },
//           ],
//         },
//       },
//     },
//     // Fuses are used to enable/disable various Electron functionality
//     // at package time, before code signing the application
//     new FusesPlugin({
//       version: FuseVersion.V1,
//       [FuseV1Options.RunAsNode]: false,
//       [FuseV1Options.EnableCookieEncryption]: true,
//       [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
//       [FuseV1Options.EnableNodeCliInspectArguments]: false,
//       [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
//       [FuseV1Options.OnlyLoadAppFromAsar]: true,
//     }),
//   ],
// };

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          // entryPoints: [
          //   {
          //     html: './src/pages/index.html',
          //     js: './src/js/renderer.js',
          //     name: 'main_window',
          //     preload: {
          //       js: './src/preload.js',
          //     },
          //   },
          //   {
          //     html: './src/pages/timer.html',
          //     js: './src/js/timer-renderer.js',
          //     name: 'timer_window',
          //     preload: {
          //       js: './src/preload.js',
          //     },
          //   },
          // ],

                    entryPoints: [
            {
              html: './src/pages/index.html',
              js: './src/js/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/timer.html',
              js: './src/js/timer-renderer.js',
              name: 'timer_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/tasks.html',
              js: './src/js/tasks-renderer.js',
              name: 'tasks_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/notes.html',
              js: './src/js/notes-renderer.js',
              name: 'notes_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/calendar.html',
              js: './src/js/calendar-renderer.js',
              name: 'calendar_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/stats.html',
              js: './src/js/stats-renderer.js',
              name: 'stats_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/settings.html',
              js: './src/js/settings-renderer.js',
              name: 'settings_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],

        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};