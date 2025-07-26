// // preload.js
// const { contextBridge, ipcRenderer } = require('electron');

// // Expose protected methods that allow the renderer process to use
// // the ipcRenderer without exposing the entire object
// contextBridge.exposeInMainWorld('electronAPI', {
//   // Navigation functions
//   navigateTo: (pageName) => ipcRenderer.invoke('navigate-to-page', pageName),
//   closeWindow: (pageName) => ipcRenderer.invoke('close-page-window', pageName),
//   getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
  
//   // Window control functions
//   minimize: () => ipcRenderer.invoke('window-minimize'),
//   maximize: () => ipcRenderer.invoke('window-maximize'),
//   close: () => ipcRenderer.invoke('window-close'),
  
//   // App information
//   getVersion: () => ipcRenderer.invoke('get-app-version'),
  
//   // File system operations (if needed)
//   readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
//   writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
//   // Notifications
//   showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
//   // Settings
//   getSetting: (key) => ipcRenderer.invoke('get-setting', key),
//   setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
//   // Event listeners for renderer to main communication
//   onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
//   onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
  
//   // Remove listeners
//   removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
//   //   // Settings operations
//   // saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
//   // loadSettings: () => ipcRenderer.invoke('load-settings'),
//   // resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
//   // // Audio settings
//   // setTimerVolume: (volume) => ipcRenderer.invoke('set-timer-volume', volume),
//   // setTimerSound: (soundPath) => ipcRenderer.invoke('set-timer-sound', soundPath),
//   // playTestSound: (soundPath) => ipcRenderer.invoke('play-test-sound', soundPath),
//   // getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
//   // selectCustomSound: () => ipcRenderer.invoke('select-custom-sound'),
  
//   // // Window management
//   // closeWindow: () => ipcRenderer.invoke('close-window'),
//   // minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  
//   // // File operations
//   // selectFolder: () => ipcRenderer.invoke('select-folder'),
//   // exportData: () => ipcRenderer.invoke('export-data'),
//   // importData: () => ipcRenderer.invoke('import-data'),
  
//   // // Cross-feature communication
//   // updateTimerSettings: (settings) => ipcRenderer.invoke('update-timer-settings', settings),
//   // updateTaskSettings: (settings) => ipcRenderer.invoke('update-task-settings', settings),
//   // updateNotesSettings: (settings) => ipcRenderer.invoke('update-notes-settings', settings),
//   // updateCalendarSettings: (settings) => ipcRenderer.invoke('update-calendar-settings', settings),
  
//   // // Listen for settings updates from other windows
//   // onSettingsUpdated: (callback) => {
//   //   ipcRenderer.on('settings-updated', callback);
//   //   return () => ipcRenderer.removeListener('settings-updated', callback);
//   // },
  
//   // // Listen for timer events
//   // onTimerEvent: (callback) => {
//   //   ipcRenderer.on('timer-event', callback);
//   //   return () => ipcRenderer.removeListener('timer-event', callback);
//   // },
// });
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
    
    // Broadcast events to all windows
    broadcastEvent: (eventName, data) => {
        ipcRenderer.invoke('broadcast-event', eventName, data);
    }
});