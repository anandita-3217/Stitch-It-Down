// main.js
// const stitchIcon = require('./assets/images/icons/stitch-wink.ico')
const stitchIcon = require('@assets/images/icons/stitch-wink.ico');
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
            window.webContents.send('app-settings-updated', this.currentSettings);
            
            // Send specific timer settings
            if (this.currentSettings.timer) {
                window.webContents.send('timer-settings-updated', this.currentSettings.timer);
            }
        });
    }
}
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
                icon: stitchIcon,
                titleBarStyle: 'default'
            });
            window.loadURL(entryPoint.url);
            window.once('ready-to-show', () => {
                window.show();
                this.sendInitialSettingsToWindow(window);
                if (pageName === 'index') {
                    window.focus();
                }
            });
                // Send settings when the DOM is ready too
            window.webContents.once('dom-ready', () => {
                setTimeout(() => {
                    this.sendInitialSettingsToWindow(window);
                }, 100);
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
    }    // NEW METHOD: Send initial settings to window
    sendInitialSettingsToWindow(window) {
        try {
            const currentSettings = settingsStore.getSettings();
            
            // Send complete settings
            window.webContents.send('app-settings-ready', {
                settings: currentSettings,
                timestamp: Date.now()
            });
            
            // Send timer-specific settings
            if (currentSettings.timer) {
                window.webContents.send('timer-settings-ready', currentSettings.timer);
            }
            
            // console.log('Sent initial settings to window');
        } catch (error) {
            console.error('Failed to send initial settings:', error);
        }
    }

    // NEW METHOD: Broadcast settings to all windows
    broadcastSettingsToAllWindows(settings) {
        this.windows.forEach((window, pageName) => {
            if (!window.isDestroyed()) {
                this.sendInitialSettingsToWindow(window);
            }
        });
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
        ipcMain.handle('get-setting', async (event, key) => {
            return this.settings.get(key);
        });
        ipcMain.handle('set-setting', async (event, key, value) => {
            this.settings.set(key, value);
            return { success: true };
        });
        // UPDATED: Enhanced save settings handler
        // ipcMain.handle('save-settings', async (event, settings) => {
        //     const success = await settingsStore.saveSettings(settings);
        //     if (success) {
        //         // Broadcast to all windows immediately
        //         this.broadcastSettingsToAllWindows(settings);
        //     }
        //     return success;
        // });
        ipcMain.handle('save-settings', async (event, settings) => {
            const success = await settingsStore.saveSettings(settings);
            if (success) {
                // Get the updated settings
                const currentSettings = settingsStore.getSettings();
                
                // Broadcast to all windows immediately
                BrowserWindow.getAllWindows().forEach(window => {
                    window.webContents.send('settings-updated', currentSettings);
                    window.webContents.send('app-settings-updated', currentSettings);
                    
                    // Send specific module updates
                    if (currentSettings.timer) {
                        window.webContents.send('timer-settings-updated', currentSettings.timer);
                    }
                    if (currentSettings.tasks) {
                        window.webContents.send('task-settings-updated', currentSettings.tasks);
                    }
                    if (currentSettings.notes) {
                        window.webContents.send('notes-settings-updated', currentSettings.notes);
                    }
                    if (currentSettings.calendar) {
                        window.webContents.send('calendar-settings-updated', currentSettings.calendar);
                    }
                });
                
                this.broadcastSettingsToAllWindows(currentSettings);
            }
            return success;
        });

        // NEW: Get settings synchronously
        ipcMain.handle('get-settings-sync', async () => {
            return settingsStore.getSettings();
        });
        ipcMain.handle('load-settings', async () => {
            return settingsStore.getSettings();
        });
        ipcMain.handle('reset-settings', async () => {
            return await settingsStore.resetSettings();
        });
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

        
        ipcMain.handle('update-timer-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.timer = { ...currentSettings.timer, ...settings };
            
            const success = await settingsStore.saveSettings(currentSettings);
            
            if (success) {
                // Broadcast to ALL windows, not just timer
                BrowserWindow.getAllWindows().forEach(window => {
                    window.webContents.send('timer-settings-updated', currentSettings.timer);
                    window.webContents.send('app-settings-updated', currentSettings);
                });
            }
            
            return success;
        });
        
        ipcMain.handle('update-task-settings', async (event, settings) => {
            const currentSettings = settingsStore.getSettings();
            currentSettings.tasks = { ...currentSettings.tasks, ...settings };

            const success = await settingsStore.saveSettings(currentSettings);

            if (success) {
                // Broadcast to ALL windows, including tasks
                BrowserWindow.getAllWindows().forEach(window => {
                    window.webContents.send('task-settings-updated', currentSettings.tasks);
                    window.webContents.send('app-settings-updated', currentSettings);
                });
            }
            return success;
        });

        // ADD these new handlers after your existing ones:
        ipcMain.handle('get-task-settings', async () => {
            return settingsStore.getSettings().tasks;
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
        ipcMain.handle('broadcast-event', async (event, eventName, data) => {
            BrowserWindow.getAllWindows().forEach(window => {
                if (window.webContents !== event.sender) {
                    window.webContents.send(eventName, data);
                }
            });
            return { success: true };
        });
        ipcMain.handle('get-timer-settings', async () => {
    return settingsStore.getSettings().timer;
});

ipcMain.handle('play-timer-sound', async (event, timerSettings) => {
    try {
        // Use the current settings if not provided
        const settings = timerSettings || settingsStore.getSettings().timer;
        
        if (!settings.soundEnabled) {
            return { success: true, message: 'Sound disabled' };
        }
        
        const soundType = settings.soundType || 'bell';
        const volume = settings.volume || 0.8;
        const customSoundPath = settings.customSoundPath;
        
        if (soundType === 'custom' && customSoundPath) {
            // For custom sounds, we'll let the renderer handle it
            // since the main process might not have audio capabilities
            return { 
                success: true, 
                playInRenderer: true,
                soundPath: customSoundPath,
                volume: volume
            };
        } else {
            // For built-in sounds, also let renderer handle it
            const builtInPath = audioManager.builtInSounds[soundType];
            if (builtInPath) {
                const fullPath = path.join(__dirname, 'assets', 'sounds', builtInPath);
                return { 
                    success: true, 
                    playInRenderer: true,
                    soundPath: fullPath,
                    volume: volume
                };
            }
        }
        
        return { success: false, error: 'Sound not found' };
    } catch (error) {
        console.error('Error playing timer sound:', error);
        return { success: false, error: error.message };
    }
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