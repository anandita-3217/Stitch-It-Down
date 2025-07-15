const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs').promises;

/**
 * Window Management System for Electron Productivity Tool
 * Provides centralized window creation, management, and IPC handling
 */
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.settings = new Map();
        this.windowConfigs = this.initializeWindowConfigs();
        this.entryPoints = this.initializeEntryPoints();
        this.setupIpcHandlers();
    }

    /**
     * Initialize window configurations for different page types
     */
    initializeWindowConfigs() {
        return {
            main: {
                width: 800,
                height: 600,
                minWidth: 800,
                minHeight: 600,
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            timer: {
                width: 800,
                height: 600,
                minWidth: 600,
                minHeight: 400,
                resizable: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: TIMER_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            tasks: {
                width: 800,
                height: 600,
                minWidth: 700,
                minHeight: 500,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: TASKS_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            notes: {
                width: 800,
                height: 600,
                minWidth: 600,
                minHeight: 400,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: NOTES_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            calendar: {
                width: 800,
                height: 600,
                minWidth: 800,
                minHeight: 600,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: CALENDAR_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            stats: {
                width: 800,
                height: 600,
                minWidth: 700,
                minHeight: 500,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: STATS_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            },
            settings: {
                width: 800,
                height: 600,
                minWidth: 600,
                minHeight: 400,
                resizable: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    webSecurity: true
                }
            }
        };
    }

    /**
     * Initialize entry points mapping for webpack entries
     */
    initializeEntryPoints() {
        return {
            index: {
                url: MAIN_WINDOW_WEBPACK_ENTRY,
                configKey: 'main'
            },
            timer: {
                url: TIMER_WINDOW_WEBPACK_ENTRY,
                configKey: 'timer'
            },
            tasks: {
                url: TASKS_WINDOW_WEBPACK_ENTRY,
                configKey: 'tasks'
            },
            notes: {
                url: NOTES_WINDOW_WEBPACK_ENTRY,
                configKey: 'notes'
            },
            calendar: {
                url: CALENDAR_WINDOW_WEBPACK_ENTRY,
                configKey: 'calendar'
            },
            stats: {
                url: STATS_WINDOW_WEBPACK_ENTRY,
                configKey: 'stats'
            },
            settings: {
                url: SETTINGS_WINDOW_WEBPACK_ENTRY,
                configKey: 'settings'
            }
        };
    }

    /**
     * Create a new window for the specified page
     * @param {string} pageName - Name of the page to create window for
     * @returns {BrowserWindow|null} - Created window or null if failed
     */
    createWindow(pageName = 'index') {
        try {
            const entryPoint = this.entryPoints[pageName];
            if (!entryPoint) {
                console.error(`No entry point found for page: ${pageName}`);
                return null;
            }

            const config = this.windowConfigs[entryPoint.configKey];
            if (!config) {
                console.error(`No configuration found for page: ${pageName}`);
                return null;
            }

            const window = new BrowserWindow({
                ...config,
                show: false,
                icon: path.join(__dirname, 'assets/icon.png'),
                titleBarStyle: 'default'
            });

            // Load the appropriate URL
            window.loadURL(entryPoint.url);

            // Handle window ready
            window.once('ready-to-show', () => {
                window.show();
                if (pageName === 'index') {
                    window.focus();
                }
            });

            // Handle window closed
            window.on('closed', () => {
                this.windows.delete(pageName);
                // console.log(`Window closed: ${pageName}`);
            });

            // Handle window focus/blur events
            window.on('focus', () => {
                window.webContents.send('window-focus');
            });

            window.on('blur', () => {
                window.webContents.send('window-blur');
            });

            // Store window reference
            this.windows.set(pageName, window);
            // console.log(`Window created: ${pageName}`);

            return window;
        } catch (error) {
            console.error(`Error creating window for ${pageName}:`, error);
            return null;
        }
    }

    /**
     * Navigate to a specific page (focus existing or create new window)
     * @param {string} pageName - Name of the page to navigate to
     * @returns {Object} - Result object with success status and message
     */
    async navigateToPage(pageName) {
        try {
            // console.log(`Navigation request to: ${pageName}`);

            // Check if window already exists
            if (this.windows.has(pageName)) {
                const existingWindow = this.windows.get(pageName);
                if (!existingWindow.isDestroyed()) {
                    existingWindow.focus();
                    return { success: true, message: `Focused existing ${pageName} window` };
                } else {
                    // Clean up destroyed window reference
                    this.windows.delete(pageName);
                }
            }

            // Create new window
            const newWindow = this.createWindow(pageName);
            if (newWindow) {
                return { success: true, message: `Created new ${pageName} window` };
            } else {
                return { success: false, message: `Failed to create ${pageName} window` };
            }
        } catch (error) {
            console.error('Navigation error:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Close a specific window
     * @param {string} pageName - Name of the page window to close
     * @returns {Object} - Result object with success status and message
     */
    async closeWindow(pageName) {
        try {
            if (this.windows.has(pageName)) {
                const window = this.windows.get(pageName);
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
    }

    /**
     * Get list of open windows
     * @returns {Array} - Array of open window information
     */
    getOpenWindows() {
        const openWindows = [];
        for (const [pageName, window] of this.windows) {
            if (!window.isDestroyed()) {
                openWindows.push({
                    pageName,
                    title: window.getTitle(),
                    focused: window.isFocused()
                });
            }
        }
        return openWindows;
    }

    /**
     * Get window from web contents
     * @param {WebContents} webContents - Web contents to get window from
     * @returns {BrowserWindow|null} - Browser window or null
     */
    getWindowFromWebContents(webContents) {
        return BrowserWindow.fromWebContents(webContents);
    }

    /**
     * Setup all IPC handlers
     */
    setupIpcHandlers() {
        // Navigation handler
        ipcMain.handle('navigate-to-page', async (event, pageName) => {
            return await this.navigateToPage(pageName);
        });

        // Window management handlers
        ipcMain.handle('close-page-window', async (event, pageName) => {
            return await this.closeWindow(pageName);
        });

        ipcMain.handle('get-open-windows', async () => {
            return this.getOpenWindows();
        });

        // Window control handlers
        ipcMain.handle('window-minimize', async (event) => {
            const window = this.getWindowFromWebContents(event.sender);
            if (window) {
                window.minimize();
            }
        });

        ipcMain.handle('window-maximize', async (event) => {
            const window = this.getWindowFromWebContents(event.sender);
            if (window) {
                if (window.isMaximized()) {
                    window.unmaximize();
                } else {
                    window.maximize();
                }
            }
        });

        ipcMain.handle('window-close', async (event) => {
            const window = this.getWindowFromWebContents(event.sender);
            if (window) {
                window.close();
            }
        });

        // App info handler
        ipcMain.handle('get-app-version', async () => {
            return app.getVersion();
        });

        // File system handlers
        ipcMain.handle('read-file', async (event, filePath) => {
            try {
                const data = await fs.readFile(filePath, 'utf8');
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('write-file', async (event, filePath, data) => {
            try {
                await fs.writeFile(filePath, data, 'utf8');
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        // Notification handler
        ipcMain.handle('show-notification', async (event, { title, body }) => {
            if (Notification.isSupported()) {
                new Notification({ title, body }).show();
                return { success: true };
            }
            return { success: false, error: 'Notifications not supported' };
        });

        // Settings handlers
        ipcMain.handle('get-setting', async (event, key) => {
            return this.settings.get(key);
        });

        ipcMain.handle('set-setting', async (event, key, value) => {
            this.settings.set(key, value);
            return { success: true };
        });
    }

    /**
     * Initialize the main window
     */
    initializeMainWindow() {
        const mainWindow = this.createWindow('index');
        if (mainWindow) {
            console.log('Main window created successfully');
        } else {
            console.error('Failed to create main window');
        }
    }

    /**
     * Clean up all windows
     */
    closeAllWindows() {
        for (const [pageName, window] of this.windows) {
            if (!window.isDestroyed()) {
                window.close();
            }
        }
        this.windows.clear();
    }
}

// Initialize window manager
const windowManager = new WindowManager();

// Handle electron-squirrel-startup
if (require('electron-squirrel-startup')) {
    app.quit();
}

// App event handlers
app.whenReady().then(() => {
    console.log('App is ready, initializing main window...');
    windowManager.initializeMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowManager.initializeMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    console.log('App is about to quit, cleaning up...');
    windowManager.closeAllWindows();
});

// Handle app errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing purposes
module.exports = {
    WindowManager,
    windowManager
};