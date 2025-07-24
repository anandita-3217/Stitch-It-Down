// CSS imports
import '@css/main.css';
import '@css/components/settings.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import '@components/settings.js';
import {
    setImage,
    setDailyQuote,
    setRandomGif,
    loadAllImages,
    initTheme,
    setTheme,
    toggleTheme,
    updateDate,
    updateClock
} from '@components/utils.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

function initialize() {
    loadAllImages(); // Load all images including random gif
    initTheme();
    setDailyQuote();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

console.log('Tasks page loaded');
// class SettingsManager {
//   constructor() {
//     this.currentSettings = {};
//     this.availableSounds = [];
//     this.init();
//   }

//   async init() {
//     await this.loadSettings();
//     await this.loadAvailableSounds();
//     this.setupEventListeners();
//     this.populateSettings();
//     this.setupSettingsListener();
//   }

//   async loadSettings() {
//     try {
//       this.currentSettings = await window.electronAPI.loadSettings();
//     } catch (error) {
//       console.error('Failed to load settings:', error);
//       this.showNotification('Failed to load settings', 'error');
//     }
//   }

//   async loadAvailableSounds() {
//     try {
//       this.availableSounds = await window.electronAPI.getAvailableSounds();
//       this.populateSoundOptions();
//     } catch (error) {
//       console.error('Failed to load available sounds:', error);
//     }
//   }

//   populateSoundOptions() {
//     const soundSelect = document.querySelector('[data-setting="timer.soundType"]');
//     if (soundSelect) {
//       // Clear existing options except "Custom..."
//       soundSelect.innerHTML = '';
      
//       // Add built-in sounds
//       this.availableSounds.forEach(sound => {
//         const option = document.createElement('option');
//         option.value = sound.id;
//         option.textContent = sound.name;
//         option.dataset.path = sound.path;
//         soundSelect.appendChild(option);
//       });
      
//       // Add custom option
//       const customOption = document.createElement('option');
//       customOption.value = 'custom';
//       customOption.textContent = 'Custom...';
//       soundSelect.appendChild(customOption);
//     }
//   }

//   setupSettingsListener() {
//     // Listen for settings updates from other windows
//     const cleanup = window.electronAPI.onSettingsUpdated((event, settings) => {
//       this.currentSettings = settings;
//       this.populateSettings();
//     });

//     // Store cleanup function for when window closes
//     window.addEventListener('beforeunload', cleanup);
//   }

//   populateSettings() {
//     // Populate all form elements with current settings
//     this.populateSection('general', this.currentSettings.general);
//     this.populateSection('timer', this.currentSettings.timer);
//     this.populateSection('tasks', this.currentSettings.tasks);
//     this.populateSection('notes', this.currentSettings.notes);
//     this.populateSection('calendar', this.currentSettings.calendar);
//     this.populateSection('integration', this.currentSettings.integration);
//     this.populateSection('accessibility', this.currentSettings.accessibility);
//     this.populateSection('advanced', this.currentSettings.advanced);
    
//     // Update volume slider and display
//     this.updateVolumeDisplay();
//   }

//   populateSection(sectionName, settings) {
//     Object.keys(settings).forEach(key => {
//       const element = document.querySelector(`[data-setting="${sectionName}.${key}"]`);
//       if (element) {
//         const value = settings[key];
        
//         if (element.classList.contains('toggle-switch')) {
//           element.classList.toggle('active', value);
//         } else if (element.type === 'checkbox') {
//           element.checked = value;
//         } else if (element.type === 'number' || element.type === 'range') {
//           element.value = value;
//         } else if (element.tagName === 'SELECT') {
//           element.value = value;
//         } else {
//           element.value = value;
//         }
//       }
//     });
//   }

//   updateVolumeDisplay() {
//     const volumeSlider = document.querySelector('[data-setting="timer.volume"]');
//     const volumeDisplay = document.querySelector('.volume-display');
    
//     if (volumeSlider && volumeDisplay) {
//       const volume = this.currentSettings.timer.volume * 100;
//       volumeDisplay.textContent = `${Math.round(volume)}%`;
//       volumeSlider.value = this.currentSettings.timer.volume;
//     }
//   }

//   setupEventListeners() {
//     // Tab switching
//     document.querySelectorAll('.nav-item').forEach(item => {
//       item.addEventListener('click', (e) => {
//         e.preventDefault();
//         this.switchTab(item.getAttribute('data-section'));
//       });
//     });

//     // Toggle switches
//     document.querySelectorAll('.toggle-switch').forEach(toggle => {
//       toggle.addEventListener('click', () => {
//         toggle.classList.toggle('active');
//         this.handleSettingChange(toggle);
//       });
//     });

//     // Volume slider
//     const volumeSlider = document.querySelector('[data-setting="timer.volume"]');
//     if (volumeSlider) {
//       volumeSlider.addEventListener('input', (e) => {
//         this.handleVolumeChange(e.target.value);
//       });
//     }

//     // Sound selection
//     const soundSelect = document.querySelector('[data-setting="timer.soundType"]');
//     if (soundSelect) {
//       soundSelect.addEventListener('change', (e) => {
//         this.handleSoundChange(e.target.value, e.target.selectedOptions[0]?.dataset.path);
//       });
//     }

//     // Test sound button
//     const testSoundBtn = document.querySelector('.test-sound-btn');
//     if (testSoundBtn) {
//       testSoundBtn.addEventListener('click', () => {
//         this.testCurrentSound();
//       });
//     }

//     // Custom sound selection
//     const customSoundBtn = document.querySelector('.custom-sound-btn');
//     if (customSoundBtn) {
//       customSoundBtn.addEventListener('click', () => {
//         this.selectCustomSound();
//       });
//     }

//     // Other form elements
//     document.querySelectorAll('.select-control, .input-control').forEach(element => {
//       element.addEventListener('change', (e) => {
//         this.handleSettingChange(e.target);
//       });
//     });

//     // Button handlers
//     this.setupButtonHandlers();
//   }

//   setupButtonHandlers() {
//     const buttonHandlers = {
//       'export-data': () => this.exportData(),
//       'import-data': () => this.importData(),
//       'reset-settings': () => this.resetSettings(),
//       'select-folder': () => this.selectFolder(),
//       'check-updates': () => this.checkForUpdates()
//     };

//     Object.entries(buttonHandlers).forEach(([id, handler]) => {
//       const button = document.querySelector(`[data-action="${id}"]`);
//       if (button) {
//         button.addEventListener('click', handler);
//       }
//     });
//   }

//   switchTab(sectionId) {
//     // Remove active class from all nav items and sections
//     document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
//     document.querySelectorAll('.settings-section').forEach(section => section.classList.remove('active'));
    
//     // Add active class to selected nav item and section
//     document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
//     document.getElementById(sectionId).classList.add('active');
//   }

//   async handleSettingChange(element) {
//     const settingPath = element.getAttribute('data-setting');
//     if (!settingPath) return;

//     const [section, key] = settingPath.split('.');
//     let value;

//     if (element.classList.contains('toggle-switch')) {
//       value = element.classList.contains('active');
//     } else if (element.type === 'checkbox') {
//       value = element.checked;
//     } else if (element.type === 'number') {
//       value = parseFloat(element.value);
//     } else {
//       value = element.value;
//     }

//     // Update local settings
//     if (!this.currentSettings[section]) {
//       this.currentSettings[section] = {};
//     }
//     this.currentSettings[section][key] = value;

//     try {
//       await window.electronAPI.saveSettings(this.currentSettings);
//       this.showNotification('Settings saved', 'success');
//     } catch (error) {
//       console.error('Failed to save settings:', error);
//       this.showNotification('Failed to save settings', 'error');
//     }
//   }

//   async handleVolumeChange(value) {
//     const volume = parseFloat(value);
    
//     // Update display
//     const volumeDisplay = document.querySelector('.volume-display');
//     if (volumeDisplay) {
//       volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
//     }

//     // Update settings
//     this.currentSettings.timer.volume = volume;
    
//     try {
//       await window.electronAPI.setTimerVolume(volume);
//       this.showNotification('Volume updated', 'success');
//     } catch (error) {
//       console.error('Failed to update volume:', error);
//       this.showNotification('Failed to update volume', 'error');
//     }
//   }

//   async handleSoundChange(soundId, soundPath) {
//     if (soundId === 'custom') {
//       await this.selectCustomSound();
//       return;
//     }

//     const soundData = { id: soundId, path: soundPath };
    
//     try {
//       await window.electronAPI.setTimerSound(soundData);
//       this.currentSettings.timer.soundType = soundId;
//       this.showNotification('Timer sound updated', 'success');
//     } catch (error) {
//       console.error('Failed to update timer sound:', error);
//       this.showNotification('Failed to update timer sound', 'error');
//     }
//   }

//   async selectCustomSound() {
//     try {
//       const customSound = await window.electronAPI.selectCustomSound();
//       if (customSound) {
//         // Add to available sounds
//         this.availableSounds.push(customSound);
//         this.populateSoundOptions();
        
//         // Set as current sound
//         const soundSelect = document.querySelector('[data-setting="timer.soundType"]');
//         if (soundSelect) {
//           soundSelect.value = 'custom';
//         }
        
//         await window.electronAPI.setTimerSound(customSound);
//         this.showNotification('Custom sound selected', 'success');
//       }
//     } catch (error) {
//       console.error('Failed to select custom sound:', error);
//       this.showNotification('Failed to select custom sound', 'error');
//     }
//   }

//   async testCurrentSound() {
//     const currentSoundType = this.currentSettings.timer.soundType;
//     const currentSound = this.availableSounds.find(s => s.id === currentSoundType);
    
//     if (currentSound) {
//       try {
//         await window.electronAPI.playTestSound(currentSound.path);
//         this.showNotification('Playing test sound', 'info');
//       } catch (error) {
//         console.error('Failed to play test sound:', error);
//         this.showNotification('Failed to play test sound', 'error');
//       }
//     }
//   }

//   async exportData() {
//     try {
//       const result = await window.electronAPI.exportData();
//       if (result.success) {
//         this.showNotification(`Data exported to ${result.path}`, 'success');
//       } else if (!result.cancelled) {
//         this.showNotification(`Export failed: ${result.error}`, 'error');
//       }
//     } catch (error) {
//       console.error('Failed to export data:', error);
//       this.showNotification('Failed to export data', 'error');
//     }
//   }

//   async importData() {
//     try {
//       const result = await window.electronAPI.importData();
//       if (result.success) {
//         await this.loadSettings();
//         this.populateSettings();
//         this.showNotification('Data imported successfully', 'success');
//       } else if (!result.cancelled) {
//         this.showNotification(`Import failed: ${result.error}`, 'error');
//       }
//     } catch (error) {
//       console.error('Failed to import data:', error);
//       this.showNotification('Failed to import data', 'error');
//     }
//   }

//   async resetSettings() {
//     const confirmed = confirm('Are you sure you want to reset all settings to default? This cannot be undone.');
//     if (confirmed) {
//       try {
//         await window.electronAPI.resetSettings();
//         await this.loadSettings();
//         this.populateSettings();
//         this.showNotification('Settings reset to default', 'success');
//       } catch (error) {
//         console.error('Failed to reset settings:', error);
//         this.showNotification('Failed to reset settings', 'error');
//       }
//     }
//   }

//   async selectFolder() {
//     try {
//       const folderPath = await window.electronAPI.selectFolder();
//       if (folderPath) {
//         this.showNotification(`Selected folder: ${folderPath}`, 'info');
//         // Update backup location in settings if needed
//       }
//     } catch (error) {
//       console.error('Failed to select folder:', error);
//       this.showNotification('Failed to select folder', 'error');
//     }
//   }

//   async checkForUpdates() {
//     this.showNotification('Checking for updates...', 'info');
//     // Simulate update check
//     setTimeout(() => {
//       this.showNotification('You are using the latest version', 'success');
//     }, 2000);
//   }

//   showNotification(message, type = 'info') {
//     // Create and show notification
//     const notification = document.createElement('div');
//     notification.className = `notification notification-${type}`;
//     notification.textContent = message;
    
//     // Style the notification
//     Object.assign(notification.style, {
//       position: 'fixed',
//       top: '20px',
//       right: '20px',
//       padding: '12px 16px',
//       borderRadius: '6px',
//       color: 'white',
//       fontWeight: '500',
//       zIndex: '9999',
//       transform: 'translateX(100%)',
//       transition: 'transform 0.3s ease'
//     });

//     // Set background color based on type
//     const colors = {
//       success: '#22c55e',
//       error: '#ef4444',
//       warning: '#f59e0b',
//       info: '#3b82f6'
//     };
//     notification.style.backgroundColor = colors[type] || colors.info;

//     document.body.appendChild(notification);

//     // Animate in
//     setTimeout(() => {
//       notification.style.transform = 'translateX(0)';
//     }, 100);

//     // Remove after 3 seconds
//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => {
//         if (notification.parentNode) {
//           notification.parentNode.removeChild(notification);
//         }
//       }, 300);
//     }, 3000);
//   }
// }

// // Initialize settings manager when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   new SettingsManager();
// });
// Add any tasks-specific functionality here
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Settings page DOM loaded');
//     // Settings page initialization
// });