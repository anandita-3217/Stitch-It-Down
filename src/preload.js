const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window management (existing)
    navigateTo: (pageName) => ipcRenderer.invoke('navigate-to-page', pageName),
    closeWindow: (pageName) => ipcRenderer.invoke('close-page-window', pageName),
    getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    
    // App info
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // File operations (existing)
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    
    // Notifications
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
    
    // Legacy settings (keeping for backward compatibility)
    getSetting: (key) => ipcRenderer.invoke('get-setting', key),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
    
    // Window events
    onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // Comprehensive Settings Operations
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    resetSettings: () => ipcRenderer.invoke('reset-settings'),
    
    // Audio settings
    setTimerVolume: (volume) => ipcRenderer.invoke('set-timer-volume', volume),
    setTimerSound: (soundData) => ipcRenderer.invoke('set-timer-sound', soundData),
    playTestSound: (soundPath) => ipcRenderer.invoke('play-test-sound', soundPath),
    getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
    selectCustomSound: () => ipcRenderer.invoke('select-custom-sound'),
    
    // File operations for settings
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    exportData: () => ipcRenderer.invoke('export-data'),
    importData: () => ipcRenderer.invoke('import-data'),
    
    // Cross-feature communication
    updateTimerSettings: (settings) => ipcRenderer.invoke('update-timer-settings', settings),
    updateTaskSettings: (settings) => ipcRenderer.invoke('update-task-settings', settings),
    updateNotesSettings: (settings) => ipcRenderer.invoke('update-notes-settings', settings),
    updateCalendarSettings: (settings) => ipcRenderer.invoke('update-calendar-settings', settings),
    
    // Event listeners for settings updates
    onSettingsUpdated: (callback) => {
        ipcRenderer.on('settings-updated', callback);
        return () => ipcRenderer.removeListener('settings-updated', callback);
    },
    
    // Listen for timer-specific events
    onTimerSettingsUpdated: (callback) => {
        ipcRenderer.on('timer-settings-updated', callback);
        return () => ipcRenderer.removeListener('timer-settings-updated', callback);
    },
    
    // General event listener for inter-window communication
    onTimerEvent: (callback) => {
        ipcRenderer.on('timer-event', callback);
        return () => ipcRenderer.removeListener('timer-event', callback);
    },
        // Add these timer-specific methods
    getTimerSettings: () => ipcRenderer.invoke('get-timer-settings'),
    playTimerSound: (settings) => ipcRenderer.invoke('play-timer-sound', settings),
    
    // Listen for settings updates
    onTimerSettingsUpdated: (callback) => {
        ipcRenderer.on('timer-settings-updated', (event, settings) => callback(settings));
    },
    
    // Remove listener
    removeTimerSettingsListener: () => {
        ipcRenderer.removeAllListeners('timer-settings-updated');
    },
    // ADD these to your existing electronAPI object in preload.js:
    getTaskSettings: () => ipcRenderer.invoke('get-task-settings'),
    
    // Listen for task-specific events  
    onTaskSettingsUpdated: (callback) => {
        ipcRenderer.on('task-settings-updated', (event, settings) => callback(settings));
    },
    
    removeTaskSettingsListener: () => {
        ipcRenderer.removeAllListeners('task-settings-updated');
    },
    // Broadcast events to all windows
    broadcastEvent: (eventName, data) => {
        ipcRenderer.invoke('broadcast-event', eventName, data);
    }
    
});