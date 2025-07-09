const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Store references to all windows
const windows = new Map();

// Define window configurations
const windowConfigs = {
    main: {
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    timer: {
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    tasks: {
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    notes: {
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    calendar: {
        width: 1100,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    stats: {
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    },
    settings: {
        width: 700,
        height: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    }
};

// Map page names to their webpack entry points
const pageEntryPoints = {
    index: 'main_window',
    timer: 'timer_window',
    tasks: 'tasks_window',
    notes: 'notes_window',
    calendar: 'calendar_window',
    stats: 'stats_window',
    settings: 'settings_window'
};

function createWindow(pageName = 'index') {
    const entryPoint = pageEntryPoints[pageName];
    if (!entryPoint) {
        console.error(`No entry point found for page: ${pageName}`);
        return null;
    }

    const config = windowConfigs[pageName === 'index' ? 'main' : pageName] || windowConfigs.main;
    
    const win = new BrowserWindow({
        ...config,
        show: false,
        icon: path.join(__dirname, 'assets/icon.png'), // Add your app icon path
        titleBarStyle: 'default',
        webSecurity: true
    });

    // Load the webpack entry point
    if (MAIN_WINDOW_WEBPACK_ENTRY) {
        // In development, use the webpack dev server
        const url = MAIN_WINDOW_WEBPACK_ENTRY.replace('main_window', entryPoint);
        win.loadURL(url);
    } else {
        // In production, load the built files
        win.loadFile(path.join(__dirname, `../renderer/${entryPoint}/index.html`));
    }

    // Show window when ready
    win.once('ready-to-show', () => {
        win.show();
        if (pageName === 'index') {
            win.focus();
        }
    });

    // Handle window closed
    win.on('closed', () => {
        windows.delete(pageName);
    });

    // Store window reference
    windows.set(pageName, win);

    return win;
}

// IPC handlers
ipcMain.handle('navigate-to-page', async (event, pageName) => {
    try {
        console.log(`Navigation request to: ${pageName}`);
        
        // Check if window already exists
        if (windows.has(pageName)) {
            const existingWindow = windows.get(pageName);
            if (!existingWindow.isDestroyed()) {
                existingWindow.focus();
                return { success: true, message: `Focused existing ${pageName} window` };
            } else {
                // Remove destroyed window reference
                windows.delete(pageName);
            }
        }

        // Create new window
        const newWindow = createWindow(pageName);
        if (newWindow) {
            return { success: true, message: `Created new ${pageName} window` };
        } else {
            return { success: false, message: `Failed to create ${pageName} window` };
        }
    } catch (error) {
        console.error('Navigation error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('close-page-window', async (event, pageName) => {
    try {
        if (windows.has(pageName)) {
            const window = windows.get(pageName);
            if (!window.isDestroyed()) {
                window.close();
                return { success: true, message: `Closed ${pageName} window` };
            }
        }
        return { success: false, message: `Window ${pageName} not found or already closed` };
    } catch (error) {
        console.error('Close window error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-open-windows', async () => {
    const openWindows = [];
    for (const [pageName, window] of windows) {
        if (!window.isDestroyed()) {
            openWindows.push({
                pageName,
                title: window.getTitle(),
                focused: window.isFocused()
            });
        }
    }
    return openWindows;
});

// Window control handlers
ipcMain.handle('window-minimize', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
        window.minimize();
    }
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
    if (window) {
        window.close();
    }
});

// App handlers
ipcMain.handle('get-app-version', async () => {
    return app.getVersion();
});

// File system handlers (add as needed)
ipcMain.handle('read-file', async (event, filePath) => {
    const fs = require('fs').promises;
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
    const fs = require('fs').promises;
    try {
        await fs.writeFile(filePath, data, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Notification handler
ipcMain.handle('show-notification', async (event, { title, body }) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return { success: true };
    }
    return { success: false, error: 'Notifications not supported' };
});

// Settings handlers (you might want to use electron-store for this)
const settings = new Map();

ipcMain.handle('get-setting', async (event, key) => {
    return settings.get(key);
});

ipcMain.handle('set-setting', async (event, key, value) => {
    settings.set(key, value);
    return { success: true };
});

// App event handlers
app.whenReady().then(() => {
    // Create main window
    createWindow('index');

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow('index');
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Export for testing or additional configuration
module.exports = {
    createWindow,
    windows,
    windowConfigs
};