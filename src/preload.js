// // See the Electron documentation for details on how to use preload scripts:
// // https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// // const {contextBridge,ipcRenderer} = require('electron');
// // contextBridge.exposeInMainWorld('electronAPI',{
// //     loadPage: (page) => ipcRenderer.send('load-page',page),
// // });
// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   navigateTo: (page) => ipcRenderer.invoke('navigate-to', page)
// });


// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation functions
  navigateTo: (pageName) => ipcRenderer.invoke('navigate-to-page', pageName),
  closeWindow: (pageName) => ipcRenderer.invoke('close-page-window', pageName),
  getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
  
  // Window control functions
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // App information
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File system operations (if needed)
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // Event listeners for renderer to main communication
  onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
  onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});