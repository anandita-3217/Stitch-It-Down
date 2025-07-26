// const { app, BrowserWindow, ipcMain, Notification } = require('electron');
// const path = require('path');
// const fs = require('fs').promises;

// /**
//  * Window Management System for Electron Productivity Tool
//  * Provides centralized window creation, management, and IPC handling
//  */
// class WindowManager {
//     constructor() {
//         this.windows = new Map();
//         this.settings = new Map();
//         this.windowConfigs = this.initializeWindowConfigs();
//         this.entryPoints = this.initializeEntryPoints();
//         this.setupIpcHandlers();
//     }

//     /**
//      * Initialize window configurations for different page types
//      */
//     initializeWindowConfigs() {
//         return {
//             main: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 800,
//                 minHeight: 600,
//                 show: false,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             timer: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 600,
//                 minHeight: 400,
//                 resizable: true,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: TIMER_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             tasks: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 700,
//                 minHeight: 500,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: TASKS_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             notes: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 600,
//                 minHeight: 400,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: NOTES_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             calendar: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 800,
//                 minHeight: 600,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: CALENDAR_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             stats: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 700,
//                 minHeight: 500,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: STATS_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             },
//             settings: {
//                 width: 800,
//                 height: 600,
//                 minWidth: 600,
//                 minHeight: 400,
//                 resizable: true,
//                 webPreferences: {
//                     nodeIntegration: false,
//                     contextIsolation: true,
//                     preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY,
//                     webSecurity: true
//                 }
//             }
//         };
//     }

//     /**
//      * Initialize entry points mapping for webpack entries
//      */
//     initializeEntryPoints() {
//         return {
//             index: {
//                 url: MAIN_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'main'
//             },
//             timer: {
//                 url: TIMER_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'timer'
//             },
//             tasks: {
//                 url: TASKS_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'tasks'
//             },
//             notes: {
//                 url: NOTES_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'notes'
//             },
//             calendar: {
//                 url: CALENDAR_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'calendar'
//             },
//             stats: {
//                 url: STATS_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'stats'
//             },
//             settings: {
//                 url: SETTINGS_WINDOW_WEBPACK_ENTRY,
//                 configKey: 'settings'
//             }
//         };
//     }

//     /**
//      * Create a new window for the specified page
//      * @param {string} pageName - Name of the page to create window for
//      * @returns {BrowserWindow|null} - Created window or null if failed
//      */
//     createWindow(pageName = 'index') {
//         try {
//             const entryPoint = this.entryPoints[pageName];
//             if (!entryPoint) {
//                 console.error(`No entry point found for page: ${pageName}`);
//                 return null;
//             }

//             const config = this.windowConfigs[entryPoint.configKey];
//             if (!config) {
//                 console.error(`No configuration found for page: ${pageName}`);
//                 return null;
//             }

//             const window = new BrowserWindow({
//                 ...config,
//                 show: false,
//                 icon: path.join(__dirname, 'assets/icon.png'),
//                 titleBarStyle: 'default'
//             });

//             // Load the appropriate URL
//             window.loadURL(entryPoint.url);

//             // Handle window ready
//             window.once('ready-to-show', () => {
//                 window.show();
//                 if (pageName === 'index') {
//                     window.focus();
//                 }
//             });

//             // Handle window closed
//             window.on('closed', () => {
//                 this.windows.delete(pageName);
//                 // console.log(`Window closed: ${pageName}`);
//             });

//             // Handle window focus/blur events
//             window.on('focus', () => {
//                 window.webContents.send('window-focus');
//             });

//             window.on('blur', () => {
//                 window.webContents.send('window-blur');
//             });

//             // Store window reference
//             this.windows.set(pageName, window);
//             // console.log(`Window created: ${pageName}`);

//             return window;
//         } catch (error) {
//             console.error(`Error creating window for ${pageName}:`, error);
//             return null;
//         }
//     }

//     /**
//      * Navigate to a specific page (focus existing or create new window)
//      * @param {string} pageName - Name of the page to navigate to
//      * @returns {Object} - Result object with success status and message
//      */
//     async navigateToPage(pageName) {
//         try {
//             // console.log(`Navigation request to: ${pageName}`);

//             // Check if window already exists
//             if (this.windows.has(pageName)) {
//                 const existingWindow = this.windows.get(pageName);
//                 if (!existingWindow.isDestroyed()) {
//                     existingWindow.focus();
//                     return { success: true, message: `Focused existing ${pageName} window` };
//                 } else {
//                     // Clean up destroyed window reference
//                     this.windows.delete(pageName);
//                 }
//             }

//             // Create new window
//             const newWindow = this.createWindow(pageName);
//             if (newWindow) {
//                 return { success: true, message: `Created new ${pageName} window` };
//             } else {
//                 return { success: false, message: `Failed to create ${pageName} window` };
//             }
//         } catch (error) {
//             console.error('Navigation error:', error);
//             return { success: false, message: error.message };
//         }
//     }

//     /**
//      * Close a specific window
//      * @param {string} pageName - Name of the page window to close
//      * @returns {Object} - Result object with success status and message
//      */
//     async closeWindow(pageName) {
//         try {
//             if (this.windows.has(pageName)) {
//                 const window = this.windows.get(pageName);
//                 if (!window.isDestroyed()) {
//                     window.close();
//                     return { success: true, message: `Closed ${pageName} window` };
//                 }
//             }
//             return { success: false, message: `Window ${pageName} not found or already closed` };
//         } catch (error) {
//             console.error('Close window error:', error);
//             return { success: false, message: error.message };
//         }
//     }

//     /**
//      * Get list of open windows
//      * @returns {Array} - Array of open window information
//      */
//     getOpenWindows() {
//         const openWindows = [];
//         for (const [pageName, window] of this.windows) {
//             if (!window.isDestroyed()) {
//                 openWindows.push({
//                     pageName,
//                     title: window.getTitle(),
//                     focused: window.isFocused()
//                 });
//             }
//         }
//         return openWindows;
//     }

//     /**
//      * Get window from web contents
//      * @param {WebContents} webContents - Web contents to get window from
//      * @returns {BrowserWindow|null} - Browser window or null
//      */
//     getWindowFromWebContents(webContents) {
//         return BrowserWindow.fromWebContents(webContents);
//     }

//     /**
//      * Setup all IPC handlers
//      */
//     setupIpcHandlers() {
//         // Navigation handler
//         ipcMain.handle('navigate-to-page', async (event, pageName) => {
//             return await this.navigateToPage(pageName);
//         });

//         // Window management handlers
//         ipcMain.handle('close-page-window', async (event, pageName) => {
//             return await this.closeWindow(pageName);
//         });

//         ipcMain.handle('get-open-windows', async () => {
//             return this.getOpenWindows();
//         });

//         // Window control handlers
//         ipcMain.handle('window-minimize', async (event) => {
//             const window = this.getWindowFromWebContents(event.sender);
//             if (window) {
//                 window.minimize();
//             }
//         });

//         ipcMain.handle('window-maximize', async (event) => {
//             const window = this.getWindowFromWebContents(event.sender);
//             if (window) {
//                 if (window.isMaximized()) {
//                     window.unmaximize();
//                 } else {
//                     window.maximize();
//                 }
//             }
//         });

//         ipcMain.handle('window-close', async (event) => {
//             const window = this.getWindowFromWebContents(event.sender);
//             if (window) {
//                 window.close();
//             }
//         });

//         // App info handler
//         ipcMain.handle('get-app-version', async () => {
//             return app.getVersion();
//         });

//         // File system handlers
//         ipcMain.handle('read-file', async (event, filePath) => {
//             try {
//                 const data = await fs.readFile(filePath, 'utf8');
//                 return { success: true, data };
//             } catch (error) {
//                 return { success: false, error: error.message };
//             }
//         });

//         ipcMain.handle('write-file', async (event, filePath, data) => {
//             try {
//                 await fs.writeFile(filePath, data, 'utf8');
//                 return { success: true };
//             } catch (error) {
//                 return { success: false, error: error.message };
//             }
//         });

//         // Notification handler
//         ipcMain.handle('show-notification', async (event, { title, body }) => {
//             if (Notification.isSupported()) {
//                 new Notification({ title, body }).show();
//                 return { success: true };
//             }
//             return { success: false, error: 'Notifications not supported' };
//         });

//         // Settings handlers
//         ipcMain.handle('get-setting', async (event, key) => {
//             return this.settings.get(key);
//         });

//         ipcMain.handle('set-setting', async (event, key, value) => {
//             this.settings.set(key, value);
//             return { success: true };
//         });
//     }

//     /**
//      * Initialize the main window
//      */
//     initializeMainWindow() {
//         const mainWindow = this.createWindow('index');
//         if (mainWindow) {
//             console.log('Main window created successfully');
//         } else {
//             console.error('Failed to create main window');
//         }
//     }

//     /**
//      * Clean up all windows
//      */
//     closeAllWindows() {
//         for (const [pageName, window] of this.windows) {
//             if (!window.isDestroyed()) {
//                 window.close();
//             }
//         }
//         this.windows.clear();
//     }
// }

// // const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
// // const path = require('path');
// // const fs = require('fs').promises;

// // Settings store
// // class SettingsStore {
// //   constructor() {
// //     this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
// //     this.defaultSettings = {
// //       general: {
// //         launchOnStartup: false,
// //         defaultWindow: 'Dashboard',
// //         alwaysOnTop: false,
// //         minimizeToTray: true,
// //         autoSaveInterval: '1 minute'
// //       },
// //       timer: {
// //         workDuration: 25,
// //         shortBreak: 5,
// //         longBreak: 15,
// //         soundEnabled: true,
// //         volume: 0.8,
// //         soundType: 'bell',
// //         customSoundPath: null,
// //         doNotDisturb: false
// //       },
// //       tasks: {
// //         defaultPriority: 'medium',
// //         defaultSort: 'due-date',
// //         reminderDays: 3,
// //         dailyGoal: 5,
// //         timeEstimation: true,
// //         completionTracking: true
// //       },
// //       notes: {
// //         defaultFont: 'Inter',
// //         fontSize: 14,
// //         markdownEnabled: true,
// //         spellCheck: true,
// //         autoSave: true
// //       },
// //       calendar: {
// //         defaultView: 'month',
// //         weekStartsOn: 'monday',
// //         timeFormat: '12-hour',
// //         defaultEventDuration: '1 hour',
// //         defaultReminder: '15 minutes'
// //       },
// //       integration: {
// //         linkTasksToCalendar: true,
// //         timerIntegration: true,
// //         noteLinking: false
// //       },
// //       accessibility: {
// //         highContrast: false,
// //         fontScaling: 'medium',
// //         keyboardShortcuts: true
// //       },
// //       advanced: {
// //         hardwareAcceleration: true,
// //         memoryManagement: true,
// //         dataEncryption: false,
// //         analytics: true,
// //         crashReporting: true
// //       }
// //     };
// //     this.currentSettings = { ...this.defaultSettings };
// //     this.loadSettings();
// //   }

// //   async loadSettings() {
// //     try {
// //       const data = await fs.readFile(this.settingsPath, 'utf-8');
// //       this.currentSettings = { ...this.defaultSettings, ...JSON.parse(data) };
// //     } catch (error) {
// //       console.log('Using default settings');
// //       await this.saveSettings();
// //     }
// //   }

// //   async saveSettings(newSettings = null) {
// //     if (newSettings) {
// //       this.currentSettings = { ...this.currentSettings, ...newSettings };
// //     }
    
// //     try {
// //       await fs.writeFile(this.settingsPath, JSON.stringify(this.currentSettings, null, 2));
// //       this.broadcastSettingsUpdate();
// //       return true;
// //     } catch (error) {
// //       console.error('Failed to save settings:', error);
// //       return false;
// //     }
// //   }

// //   getSettings() {
// //     return this.currentSettings;
// //   }

// //   resetSettings() {
// //     this.currentSettings = { ...this.defaultSettings };
// //     return this.saveSettings();
// //   }

// //   broadcastSettingsUpdate() {
// //     BrowserWindow.getAllWindows().forEach(window => {
// //       window.webContents.send('settings-updated', this.currentSettings);
// //     });
// //   }
// // }

// // // Audio manager for timer sounds
// // class AudioManager {
// //   constructor() {
// //     this.soundsPath = path.join(__dirname, 'assets', 'sounds');
// //     this.builtInSounds = {
// //       'bell': 'bell.wav',
// //       'chime': 'chime.wav',
// //       'tweet': 'tweet.wav',
// //       'gong': 'gong.wav'
// //     };
// //     this.currentVolume = 0.8;
// //     this.currentSound = 'bell';
// //   }

// //   async getAvailableSounds() {
// //     const sounds = [];
    
// //     // Add built-in sounds
// //     for (const [name, file] of Object.entries(this.builtInSounds)) {
// //       sounds.push({
// //         name: name.charAt(0).toUpperCase() + name.slice(1),
// //         type: 'builtin',
// //         path: path.join(this.soundsPath, file),
// //         id: name
// //       });
// //     }
    
// //     return sounds;
// //   }

// //   async selectCustomSound() {
// //     const result = await dialog.showOpenDialog({
// //       title: 'Select Custom Timer Sound',
// //       filters: [
// //         { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'aac'] }
// //       ],
// //       properties: ['openFile']
// //     });

// //     if (!result.canceled && result.filePaths.length > 0) {
// //       return {
// //         name: path.basename(result.filePaths[0]),
// //         type: 'custom',
// //         path: result.filePaths[0],
// //         id: 'custom'
// //       };
// //     }
    
// //     return null;
// //   }

// //   setVolume(volume) {
// //     this.currentVolume = Math.max(0, Math.min(1, volume));
// //   }

// //   setSound(soundId, customPath = null) {
// //     this.currentSound = soundId;
// //     if (soundId === 'custom' && customPath) {
// //       this.customSoundPath = customPath;
// //     }
// //   }

// //   async playTestSound(soundPath) {
// //     // In a real implementation, you'd use a library like node-wav or similar
// //     // For now, we'll just return success
// //     return true;
// //   }
// // }

// // // Initialize managers
// // const settingsStore = new SettingsStore();
// // const audioManager = new AudioManager();

// // // IPC Handlers
// // ipcMain.handle('save-settings', async (event, settings) => {
// //   return await settingsStore.saveSettings(settings);
// // });

// // ipcMain.handle('load-settings', async () => {
// //   return settingsStore.getSettings();
// // });

// // ipcMain.handle('reset-settings', async () => {
// //   return await settingsStore.resetSettings();
// // });

// // // Audio-related handlers
// // ipcMain.handle('set-timer-volume', async (event, volume) => {
// //   audioManager.setVolume(volume);
// //   const settings = settingsStore.getSettings();
// //   settings.timer.volume = volume;
// //   return await settingsStore.saveSettings(settings);
// // });

// // ipcMain.handle('set-timer-sound', async (event, soundData) => {
// //   audioManager.setSound(soundData.id, soundData.path);
// //   const settings = settingsStore.getSettings();
// //   settings.timer.soundType = soundData.id;
// //   if (soundData.path) {
// //     settings.timer.customSoundPath = soundData.path;
// //   }
// //   return await settingsStore.saveSettings(settings);
// // });

// // ipcMain.handle('play-test-sound', async (event, soundPath) => {
// //   return await audioManager.playTestSound(soundPath);
// // });

// // ipcMain.handle('get-available-sounds', async () => {
// //   return await audioManager.getAvailableSounds();
// // });

// // ipcMain.handle('select-custom-sound', async () => {
// //   return await audioManager.selectCustomSound();
// // });

// // // File operations
// // ipcMain.handle('select-folder', async () => {
// //   const result = await dialog.showOpenDialog({
// //     properties: ['openDirectory']
// //   });
  
// //   if (!result.canceled && result.filePaths.length > 0) {
// //     return result.filePaths[0];
// //   }
// //   return null;
// // });

// // ipcMain.handle('export-data', async () => {
// //   const result = await dialog.showSaveDialog({
// //     title: 'Export Data',
// //     defaultPath: 'stitch-it-down-backup.json',
// //     filters: [
// //       { name: 'JSON Files', extensions: ['json'] }
// //     ]
// //   });

// //   if (!result.canceled) {
// //     try {
// //       const settings = settingsStore.getSettings();
// //       // In a real app, you'd also export tasks, notes, etc.
// //       const exportData = {
// //         settings,
// //         exportDate: new Date().toISOString(),
// //         version: '1.2.3'
// //       };
      
// //       await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2));
// //       return { success: true, path: result.filePath };
// //     } catch (error) {
// //       return { success: false, error: error.message };
// //     }
// //   }
  
// //   return { success: false, cancelled: true };
// // });

// // ipcMain.handle('import-data', async () => {
// //   const result = await dialog.showOpenDialog({
// //     title: 'Import Data',
// //     filters: [
// //       { name: 'JSON Files', extensions: ['json'] }
// //     ],
// //     properties: ['openFile']
// //   });

// //   if (!result.canceled && result.filePaths.length > 0) {
// //     try {
// //       const data = await fs.readFile(result.filePaths[0], 'utf-8');
// //       const importData = JSON.parse(data);
      
// //       if (importData.settings) {
// //         await settingsStore.saveSettings(importData.settings);
// //         return { success: true };
// //       }
      
// //       return { success: false, error: 'Invalid backup file' };
// //     } catch (error) {
// //       return { success: false, error: error.message };
// //     }
// //   }
  
// //   return { success: false, cancelled: true };
// // });

// // // Cross-feature communication handlers
// // ipcMain.handle('update-timer-settings', async (event, settings) => {
// //   const currentSettings = settingsStore.getSettings();
// //   currentSettings.timer = { ...currentSettings.timer, ...settings };
  
// //   // Broadcast to timer window specifically
// //   BrowserWindow.getAllWindows().forEach(window => {
// //     if (window.webContents.getURL().includes('timer.html')) {
// //       window.webContents.send('timer-settings-updated', currentSettings.timer);
// //     }
// //   });
  
// //   return await settingsStore.saveSettings(currentSettings);
// // });

// // ipcMain.handle('update-task-settings', async (event, settings) => {
// //   const currentSettings = settingsStore.getSettings();
// //   currentSettings.tasks = { ...currentSettings.tasks, ...settings };
// //   return await settingsStore.saveSettings(currentSettings);
// // });

// // ipcMain.handle('update-notes-settings', async (event, settings) => {
// //   const currentSettings = settingsStore.getSettings();
// //   currentSettings.notes = { ...currentSettings.notes, ...settings };
// //   return await settingsStore.saveSettings(currentSettings);
// // });

// // ipcMain.handle('update-calendar-settings', async (event, settings) => {
// //   const currentSettings = settingsStore.getSettings();
// //   currentSettings.calendar = { ...currentSettings.calendar, ...settings };
// //   return await settingsStore.saveSettings(currentSettings);
// // });

// // // Window management
// // ipcMain.handle('close-window', async (event) => {
// //   const window = BrowserWindow.fromWebContents(event.sender);
// //   if (window) {
// //     window.close();
// //   }
// // });

// // ipcMain.handle('minimize-window', async (event) => {
// //   const window = BrowserWindow.fromWebContents(event.sender);
// //   if (window) {
// //     window.minimize();
// //   }
// // });

// // // Notifications
// // ipcMain.handle('show-notification', async (event, options) => {
// //   if (Notification.isSupported()) {
// //     const notification = new Notification(options);
// //     notification.show();
// //     return true;
// //   }
// //   return false;
// // });

// // // Export for use in main process
// // module.exports = { settingsStore, audioManager };

// // Initialize window manager
// const windowManager = new WindowManager();

// // Handle electron-squirrel-startup
// if (require('electron-squirrel-startup')) {
//     app.quit();
// }

// // App event handlers
// app.whenReady().then(() => {
//     console.log('App is ready, initializing main window...');
//     windowManager.initializeMainWindow();

//     app.on('activate', () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             windowManager.initializeMainWindow();
//         }
//     });
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('before-quit', () => {
//     console.log('App is about to quit, cleaning up...');
//     windowManager.closeAllWindows();
// });

// // Handle app errors
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// // Export for testing purposes
// module.exports = {
//     WindowManager,
//     windowManager
// };
const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Settings store
class SettingsStore {
    constructor() {
        this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
        this.defaultSettings = {
            general: {
                launchOnStartup: false,
                defaultWindow: 'Dashboard',
                alwaysOnTop: false,
                minimizeToTray: true,
                autoSaveInterval: '1 minute'
            },
            timer: {
                workDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                soundEnabled: true,
                volume: 0.8,
                soundType: 'bell',
                customSoundPath: null,
                doNotDisturb: false
            },
            tasks: {
                defaultPriority: 'medium',
                defaultSort: 'due-date',
                reminderDays: 3,
                dailyGoal: 5,
                timeEstimation: true,
                completionTracking: true
            },
            notes: {
                defaultFont: 'Inter',
                fontSize: 14,
                markdownEnabled: true,
                spellCheck: true,
                autoSave: true
            },
            calendar: {
                defaultView: 'month',
                weekStartsOn: 'monday',
                timeFormat: '12-hour',
                defaultEventDuration: '1 hour',
                defaultReminder: '15 minutes'
            },
            integration: {
                linkTasksToCalendar: true,
                timerIntegration: true,
                noteLinking: false
            },
            accessibility: {
                highContrast: false,
                fontScaling: 'medium',
                keyboardShortcuts: true
            },
            advanced: {
                hardwareAcceleration: true,
                memoryManagement: true,
                dataEncryption: false,
                analytics: true,
                crashReporting: true
            }
        };
        this.currentSettings = { ...this.defaultSettings };
        this.loadSettings();
    }

    async loadSettings() {
        try {
            const data = await fs.readFile(this.settingsPath, 'utf-8');
            this.currentSettings = { ...this.defaultSettings, ...JSON.parse(data) };
        } catch (error) {
            console.log('Using default settings');
            await this.saveSettings();
        }
    }

    async saveSettings(newSettings = null) {
        if (newSettings) {
            this.currentSettings = { ...this.currentSettings, ...newSettings };
        }
        
        try {
            await fs.writeFile(this.settingsPath, JSON.stringify(this.currentSettings, null, 2));
            this.broadcastSettingsUpdate();
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    getSettings() {
        return this.currentSettings;
    }

    resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        return this.saveSettings();
    }

    broadcastSettingsUpdate() {
        BrowserWindow.getAllWindows().forEach(window => {
            window.webContents.send('settings-updated', this.currentSettings);
        });
    }
}

// Audio manager for timer sounds
class AudioManager {
    constructor() {
        this.soundsPath = path.join(__dirname, 'assets', 'sounds');
        this.builtInSounds = {
            'bell': 'bell.wav',
            'chime': 'chime.wav',
            'tweet': 'tweet.wav',
            'gong': 'gong.wav'
        };
        this.currentVolume = 0.8;
        this.currentSound = 'bell';
    }

    async getAvailableSounds() {
        const sounds = [];
        
        // Add built-in sounds
        for (const [name, file] of Object.entries(this.builtInSounds)) {
            sounds.push({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                type: 'builtin',
                path: path.join(this.soundsPath, file),
                id: name
            });
        }
        
        return sounds;
    }

    async selectCustomSound() {
        const result = await dialog.showOpenDialog({
            title: 'Select Custom Timer Sound',
            filters: [
                { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'aac'] }
            ],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return {
                name: path.basename(result.filePaths[0]),
                type: 'custom',
                path: result.filePaths[0],
                id: 'custom'
            };
        }
        
        return null;
    }

    setVolume(volume) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
    }

    setSound(soundId, customPath = null) {
        this.currentSound = soundId;
        if (soundId === 'custom' && customPath) {
            this.customSoundPath = customPath;
        }
    }

    async playTestSound(soundPath) {
        // In a real implementation, you'd use a library like node-wav or similar
        // For now, we'll just return success
        return true;
    }
}

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.settings = new Map();
        this.windowConfigs = this.initializeWindowConfigs();
        this.entryPoints = this.initializeEntryPoints();
        this.setupIpcHandlers();
    }

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

            window.loadURL(entryPoint.url);

            window.once('ready-to-show', () => {
                window.show();
                if (pageName === 'index') {
                    window.focus();
                }
            });

            window.on('closed', () => {
                this.windows.delete(pageName);
            });

            window.on('focus', () => {
                window.webContents.send('window-focus');
            });

            window.on('blur', () => {
                window.webContents.send('window-blur');
            });

            this.windows.set(pageName, window);
            return window;
        } catch (error) {
            console.error(`Error creating window for ${pageName}:`, error);
            return null;
        }
    }

    async navigateToPage(pageName) {
        try {
            if (this.windows.has(pageName)) {
                const existingWindow = this.windows.get(pageName);
                if (!existingWindow.isDestroyed()) {
                    existingWindow.focus();
                    return { success: true, message: `Focused existing ${pageName} window` };
                } else {
                    this.windows.delete(pageName);
                }
            }

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

    getWindowFromWebContents(webContents) {
        return BrowserWindow.fromWebContents(webContents);
    }

    setupIpcHandlers() {
        // Existing window management handlers
        ipcMain.handle('navigate-to-page', async (event, pageName) => {
            return await this.navigateToPage(pageName);
        });

        ipcMain.handle('close-page-window', async (event, pageName) => {
            return await this.closeWindow(pageName);
        });

        ipcMain.handle('get-open-windows', async () => {
            return this.getOpenWindows();
        });

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

        ipcMain.handle('get-app-version', async () => {
            return app.getVersion();
        });

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

        ipcMain.handle('show-notification', async (event, { title, body }) => {
            if (Notification.isSupported()) {
                new Notification({ title, body }).show();
                return { success: true };
            }
            return { success: false, error: 'Notifications not supported' };
        });

        // Legacy settings handlers (for backward compatibility)
        ipcMain.handle('get-setting', async (event, key) => {
            return this.settings.get(key);
        });

        ipcMain.handle('set-setting', async (event, key, value) => {
            this.settings.set(key, value);
            return { success: true };
        });

        // New comprehensive settings handlers
        ipcMain.handle('save-settings', async (event, settings) => {
            return await settingsStore.saveSettings(settings);
        });

        ipcMain.handle('load-settings', async () => {
            return settingsStore.getSettings();
        });

        ipcMain.handle('reset-settings', async () => {
            return await settingsStore.resetSettings();
        });

        // Audio-related handlers
        ipcMain.handle('set-timer-volume', async (event, volume) => {
            audioManager.setVolume(volume);
            const settings = settingsStore.getSettings();
            settings.timer.volume = volume;
            return await settingsStore.saveSettings(settings);
        });

        ipcMain.handle('set-timer-sound', async (event, soundData) => {
            audioManager.setSound(soundData.id, soundData.path);
            const settings = settingsStore.getSettings();
            settings.timer.soundType = soundData.id;
            if (soundData.path) {
                settings.timer.customSoundPath = soundData.path;
            }
            return await settingsStore.saveSettings(settings);
        });

        ipcMain.handle('play-test-sound', async (event, soundPath) => {
            return await audioManager.playTestSound(soundPath);
        });

        ipcMain.handle('get-available-sounds', async () => {
            return await audioManager.getAvailableSounds();
        });

        ipcMain.handle('select-custom-sound', async () => {
            return await audioManager.selectCustomSound();
        });

        // File operations
        ipcMain.handle('select-folder', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
                return result.filePaths[0];
            }
            return null;
        });

        ipcMain.handle('export-data', async () => {
            const result = await dialog.showSaveDialog({
                title: 'Export Data',
                defaultPath: 'stitch-it-down-backup.json',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] }
                ]
            });

            if (!result.canceled) {
                try {
                    const settings = settingsStore.getSettings();
                    const exportData = {
                        settings,
                        exportDate: new Date().toISOString(),
                        version: app.getVersion()
                    };
                    
                    await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2));
                    return { success: true, path: result.filePath };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            
            return { success: false, cancelled: true };
        });

        ipcMain.handle('import-data', async () => {
            const result = await dialog.showOpenDialog({
                title: 'Import Data',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
                try {
                    const data = await fs.readFile(result.filePaths[0], 'utf-8');
                    const importData = JSON.parse(data);
                    
                    if (importData.settings) {
                        await settingsStore.saveSettings(importData.settings);
                        return { success: true };
                    }
                    
                    return { success: false, error: 'Invalid backup file' };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            
            return { success: false, cancelled: true };
        });

        // Cross-feature communication handlers
        ipcMain.handle('update-timer-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.timer = { ...currentSettings.timer, ...settings };
            
            // Broadcast to timer window specifically
            BrowserWindow.getAllWindows().forEach(window => {
                if (window.webContents.getURL().includes('timer')) {
                    window.webContents.send('timer-settings-updated', currentSettings.timer);
                }
            });
            
            return await settingsStore.saveSettings(currentSettings);
        });

        ipcMain.handle('update-task-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.tasks = { ...currentSettings.tasks, ...settings };
            return await settingsStore.saveSettings(currentSettings);
        });

        ipcMain.handle('update-notes-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.notes = { ...currentSettings.notes, ...settings };
            return await settingsStore.saveSettings(currentSettings);
        });

        ipcMain.handle('update-calendar-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.calendar = { ...currentSettings.calendar, ...settings };
            return await settingsStore.saveSettings(currentSettings);
        });

        // Broadcast events to all windows
        ipcMain.handle('broadcast-event', async (event, eventName, data) => {
            BrowserWindow.getAllWindows().forEach(window => {
                if (window.webContents !== event.sender) {
                    window.webContents.send(eventName, data);
                }
            });
            return { success: true };
        });
    }

    initializeMainWindow() {
        const mainWindow = this.createWindow('index');
        if (mainWindow) {
            console.log('Main window created successfully');
        } else {
            console.error('Failed to create main window');
        }
    }

    closeAllWindows() {
        for (const [pageName, window] of this.windows) {
            if (!window.isDestroyed()) {
                window.close();
            }
        }
        this.windows.clear();
    }
}

// Initialize managers
const settingsStore = new SettingsStore();
const audioManager = new AudioManager();
const windowManager = new WindowManager();

if (require('electron-squirrel-startup')) {
    app.quit();
}

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

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = {
    WindowManager,
    windowManager,
    settingsStore,
    audioManager
};