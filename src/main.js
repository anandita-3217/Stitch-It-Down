// // const { app, BrowserWindow } = require('electron');
// // const { ipcMain } = require('electron');
// // const path = require('path');

// // const iconPath = path.join(process.resourcesPath, 'assets/images/characters/stitch-wink.png');

// // let mainWindow;

// // function createWindow() {
// //   // Create the browser window
// //   mainWindow = new BrowserWindow({
// //     width: 800,
// //     height: 600,
// //     webPreferences: {
// //       nodeIntegration: false,
// //       contextIsolation: true,
// //       enableRemoteModule: false,
// //       preload: path.join(__dirname, 'preload.js')
// //     },
// //     // icon: path.resolve(__dirname, 'assets/images/characters/stitch-wink.png'), // Optional: app icon
// //     // icon: iconPath,
// //     show: false
// //   });

// //   if (MAIN_WINDOW_WEBPACK_ENTRY) {
// //     mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
// //   } else {
// //     mainWindow.loadFile('src/pages/index.html');
// //   }

// //   mainWindow.once('ready-to-show', () => {
// //     mainWindow.show();
// //   });

// //   // Open DevTools in development
// //   // if (process.env.NODE_ENV === 'development') {
// //   //   mainWindow.webContents.openDevTools();
// //   // }

// //   mainWindow.on('closed', () => {
// //     // Dereference the window object
// //     mainWindow = null;
// //   });
// // }

// // // Add this function to create timer window
// // function createTimerWindow() {
// //   const timerWindow = new BrowserWindow({
// //     width: 800,
// //     height: 600,
// //     webPreferences: {
// //       contextIsolation: true,
// //       preload: path.join(__dirname, 'preload.js'),
// //     }
// //   });

// //   // If you're using Webpack (MAIN_WINDOW_WEBPACK_ENTRY)
// //   if (TIMER_WINDOW_WEBPACK_ENTRY) {
// //     timerWindow.loadURL(TIMER_WINDOW_WEBPACK_ENTRY);
// //   } else {
// //     timerWindow.loadFile(path.join(__dirname, 'src/pages/timer.html'));
// //   }
// // }


// // // Handle navigation IPC
// // ipcMain.handle('navigate-to', async (event, page) => {
// //   if (page === 'timer') {
// //     createTimerWindow();
// //   }
// //   // Add other pages as needed
// // });

// // // App event handlers
// // app.whenReady().then(() => {
// //   createWindow();

// //   // On macOS, re-create window when dock icon is clicked
// //   app.on('activate', () => {
// //     if (BrowserWindow.getAllWindows().length === 0) {
// //       createWindow();
// //     }
// //   });
// // });

// // // Quit when all windows are closed
// // app.on('window-all-closed', () => {
// //   // On macOS, keep app running even when all windows are closed
// //   if (process.platform !== 'darwin') {
// //     app.quit();
// //   }
// // });

// // // Security: Prevent new window creation
// // app.on('web-contents-created', (event, contents) => {
// //   contents.on('new-window', (event, navigationUrl) => {
// //     // Prevent opening new windows
// //     event.preventDefault();
// //   });
// // });

// // // Handle app second instance (single instance lock)
// // const gotTheLock = app.requestSingleInstanceLock();

// // if (!gotTheLock) {
// //   app.quit();
// // } else {
// //   app.on('second-instance', (event, commandLine, workingDirectory) => {
// //     // Someone tried to run a second instance, focus our window instead
// //     if (mainWindow) {
// //       if (mainWindow.isMinimized()) mainWindow.restore();
// //       mainWindow.focus();
// //     }
// //   });
// // }

// // main.js
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');

// let mainWindow;
// const openWindows = new Map();

// // Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// const createMainWindow = () => {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
//     },
//   });

//   // Load the index.html of the app using the webpack entry point
//   mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

//   // Open the DevTools in development
//   if (process.env.NODE_ENV === 'development') {
//     mainWindow.webContents.openDevTools();
//   }
// };

// const createPageWindow = (pageName) => {
//   // Check if window already exists and focus it
//   if (openWindows.has(pageName)) {
//     const existingWindow = openWindows.get(pageName);
//     if (!existingWindow.isDestroyed()) {
//       existingWindow.focus();
//       return;
//     } else {
//       openWindows.delete(pageName);
//     }
//   }

//   // Map page names to webpack entry points
//   const entryPointMap = {
//     timer: {
//       url: TIMER_WINDOW_WEBPACK_ENTRY,
//       preload: TIMER_WINDOW_PRELOAD_WEBPACK_ENTRY
//     },
//     tasks: {
//       url: TASKS_WINDOW_WEBPACK_ENTRY,
//       preload: TASKS_WINDOW_PRELOAD_WEBPACK_ENTRY
//     },
//     notes: {
//       url: NOTES_WINDOW_WEBPACK_ENTRY,
//       preload: NOTES_WINDOW_PRELOAD_WEBPACK_ENTRY
//     },
//     calendar: {
//       url: CALENDAR_WINDOW_WEBPACK_ENTRY,
//       preload: CALENDAR_WINDOW_PRELOAD_WEBPACK_ENTRY
//     },
//     stats: {
//       url: STATS_WINDOW_WEBPACK_ENTRY,
//       preload: STATS_WINDOW_PRELOAD_WEBPACK_ENTRY
//     },
//     settings: {
//       url: SETTINGS_WINDOW_WEBPACK_ENTRY,
//       preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY
//     }
//   };

//   const entryPoint = entryPointMap[pageName];
//   if (!entryPoint) {
//     console.error(`No entry point found for page: ${pageName}`);
//     return;
//   }

//   // Create the new window
//   const pageWindow = new BrowserWindow({
//     width: 1000,
//     height: 700,
//     parent: mainWindow,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: entryPoint.preload,
//     },
//   });

//   // Load the page using the webpack entry point
//   pageWindow.loadURL(entryPoint.url);

//   // Store window reference
//   openWindows.set(pageName, pageWindow);

//   // Clean up when window is closed
//   pageWindow.on('closed', () => {
//     openWindows.delete(pageName);
//   });

//   // Open DevTools in development
//   if (process.env.NODE_ENV === 'development') {
//     pageWindow.webContents.openDevTools();
//   }
// };

// // IPC handler for navigation
// ipcMain.handle('navigate-to-page', async (event, pageName) => {
//   if (pageName === 'index') {
//     // Focus main window if it exists
//     if (mainWindow && !mainWindow.isDestroyed()) {
//       mainWindow.focus();
//     }
//   } else {
//     createPageWindow(pageName);
//   }
// });

// // App event handlers
// app.whenReady().then(() => {
//   createMainWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createMainWindow();
//     }
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// // Additional IPC handlers for window management
// ipcMain.handle('close-page-window', async (event, pageName) => {
//   if (openWindows.has(pageName)) {
//     const window = openWindows.get(pageName);
//     if (!window.isDestroyed()) {
//       window.close();
//     }
//   }
// });

// ipcMain.handle('get-open-windows', async () => {
//   return Array.from(openWindows.keys());
// });

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const openWindows = new Map();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // Load the index.html of the app using the webpack entry point
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

const createPageWindow = (pageName) => {
  // Check if window already exists and focus it
  if (openWindows.has(pageName)) {
    const existingWindow = openWindows.get(pageName);
    if (!existingWindow.isDestroyed()) {
      existingWindow.focus();
      return;
    } else {
      openWindows.delete(pageName);
    }
  }

  // Map page names to webpack entry points
  const entryPointMap = {
    timer: {
      url: TIMER_WINDOW_WEBPACK_ENTRY,
      preload: TIMER_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    tasks: {
      url: TASKS_WINDOW_WEBPACK_ENTRY,
      preload: TASKS_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    notes: {
      url: NOTES_WINDOW_WEBPACK_ENTRY,
      preload: NOTES_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    calendar: {
      url: CALENDAR_WINDOW_WEBPACK_ENTRY,
      preload: CALENDAR_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    stats: {
      url: STATS_WINDOW_WEBPACK_ENTRY,
      preload: STATS_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    settings: {
      url: SETTINGS_WINDOW_WEBPACK_ENTRY,
      preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  };

  const entryPoint = entryPointMap[pageName];
  if (!entryPoint) {
    console.error(`No entry point found for page: ${pageName}`);
    return;
  }

  // Create the new window
  const pageWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: entryPoint.preload,
    },
  });

  // Load the page using the webpack entry point
  pageWindow.loadURL(entryPoint.url);

  // Store window reference
  openWindows.set(pageName, pageWindow);

  // Clean up when window is closed
  pageWindow.on('closed', () => {
    openWindows.delete(pageName);
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    pageWindow.webContents.openDevTools();
  }
};

// IPC handler for navigation
ipcMain.handle('navigate-to-page', async (event, pageName) => {
  console.log(`Navigation requested for: ${pageName}`);
  
  if (pageName === 'index') {
    // Focus main window if it exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
    }
  } else {
    createPageWindow(pageName);
  }
});

// App event handlers
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Additional IPC handlers for window management
ipcMain.handle('close-page-window', async (event, pageName) => {
  if (openWindows.has(pageName)) {
    const window = openWindows.get(pageName);
    if (!window.isDestroyed()) {
      window.close();
    }
  }
});

ipcMain.handle('get-open-windows', async () => {
  return Array.from(openWindows.keys());
});

// Add more IPC handlers as needed for your other electronAPI functions
ipcMain.handle('window-minimize', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) window.minimize();
});

ipcMain.handle('window-maximize', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-close', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) window.close();
});