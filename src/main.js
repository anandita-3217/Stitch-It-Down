const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

const path = require('path');

const iconPath = path.join(process.resourcesPath, 'assets/images/characters/stitch-wink.png');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true, 
      enableRemoteModule: false, 
      preload: path.join(__dirname, 'preload.js') 
    },
    // icon: path.resolve(__dirname, 'assets/images/characters/stitch-wink.png'), // Optional: app icon
    icon: iconPath,

    show: false 
  });

  
  if (MAIN_WINDOW_WEBPACK_ENTRY) {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  } else {
    mainWindow.loadFile('src/pages/index.html');
  }

  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }

  
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}
// Add this function to create timer window
function createTimerWindow() {
  const timerWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  timerWindow.loadFile('src/pages/timer.html');
  return timerWindow;
}

// Handle navigation IPC
ipcMain.handle('navigate-to', async (event, page) => {
  if (page === 'timer') {
    createTimerWindow();
  }
  // Add other pages as needed
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    // Prevent opening new windows
    event.preventDefault();
  });
});

// Handle app second instance (single instance lock)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}