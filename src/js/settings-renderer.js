// CSS imports
// import '@css/main.css';
// import '@css/components/settings.css';
// import '@css/components/sidebar.css';
// import '@components/sidebar.js';
// import '@components/settings.js';
// import {
//     setImage,
//     setDailyQuote,
//     setRandomGif,
//     loadAllImages,
//     initTheme,
//     setTheme,
//     toggleTheme,
//     updateDate,
//     updateClock
// } from '@components/utils.js';

// import 'bootstrap-icons/font/bootstrap-icons.css';

// function initialize() {
//     loadAllImages(); // Load all images including random gif
//     initTheme();
//     setDailyQuote();
// }

// // Initialize when DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initialize);
// } else {
//     // DOM is already ready
//     initialize();
// }

// console.log('Tasks page loaded');
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
// settings-renderer.js
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

class SettingsManager {
    constructor() {
        this.currentSettings = {};
        this.originalSettings = {};
        this.init();
    }

    async init() {
        try {
            // Initialize theme and UI components first
            await this.initializeUIComponents();
            
            // Load current settings
            this.currentSettings = await window.electronAPI.loadSettings();
            this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
            
            // Setup UI
            this.setupEventListeners();
            this.populateUI();
            this.setupRealTimeListeners();
            
            console.log('Settings loaded:', this.currentSettings);
        } catch (error) {
            console.error('Failed to initialize settings:', error);
            this.showError('Failed to load settings');
        }
    }

    async initializeUIComponents() {
        try {
            // Initialize theme system
            initTheme();
            
            // Load all images for the UI
            await loadAllImages();
            
            // Set daily quote if there's a quote container
            setDailyQuote();
            
            // Start clock and date updates if elements exist
            if (document.getElementById('current-time')) {
                updateClock();
                setInterval(updateClock, 1000);
            }
            
            if (document.getElementById('current-date')) {
                updateDate();
                setInterval(updateDate, 60000); // Update every minute
            }
            
        } catch (error) {
            console.error('Failed to initialize UI components:', error);
        }
    }

    setupEventListeners() {
        // Save button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-settings');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelSettings());
        }

        // Export button
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import button
        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        // Sound test button
        const testSoundBtn = document.getElementById('test-sound');
        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', () => this.testSound());
        }

        // Custom sound selection
        const customSoundBtn = document.getElementById('select-custom-sound');
        if (customSoundBtn) {
            customSoundBtn.addEventListener('click', () => this.selectCustomSound());
        }

        // Volume slider
        const volumeSlider = document.getElementById('timer-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.updateVolume(e.target.value);
            });
        }

        // Theme toggle button (if exists)
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                toggleTheme();
            });
        }

        // Form changes detection
        const form = document.getElementById('settings-form');
        if (form) {
            form.addEventListener('change', () => this.detectChanges());
            form.addEventListener('input', () => this.detectChanges());
        }

        // Tab navigation
        this.setupTabNavigation();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                e.target.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    setupRealTimeListeners() {
        // Listen for settings updates from other windows
        window.electronAPI.onSettingsUpdated((event, updatedSettings) => {
            this.currentSettings = updatedSettings;
            this.populateUI();
            this.showMessage('Settings updated from another window', 'info');
        });

        // Listen for timer events if needed
        window.electronAPI.onTimerEvent((event, data) => {
            console.log('Timer event received:', data);
        });
    }

    populateUI() {
        // General settings
        this.setInputValue('launch-on-startup', this.currentSettings.general?.launchOnStartup);
        this.setSelectValue('default-window', this.currentSettings.general?.defaultWindow);
        this.setInputValue('always-on-top', this.currentSettings.general?.alwaysOnTop);
        this.setInputValue('minimize-to-tray', this.currentSettings.general?.minimizeToTray);
        this.setSelectValue('auto-save-interval', this.currentSettings.general?.autoSaveInterval);

        // Timer settings
        this.setInputValue('work-duration', this.currentSettings.timer?.workDuration);
        this.setInputValue('short-break', this.currentSettings.timer?.shortBreak);
        this.setInputValue('long-break', this.currentSettings.timer?.longBreak);
        this.setInputValue('sound-enabled', this.currentSettings.timer?.soundEnabled);
        this.setInputValue('timer-volume', this.currentSettings.timer?.volume);
        this.setSelectValue('sound-type', this.currentSettings.timer?.soundType);
        this.setInputValue('do-not-disturb', this.currentSettings.timer?.doNotDisturb);

        // Task settings
        this.setSelectValue('default-priority', this.currentSettings.tasks?.defaultPriority);
        this.setSelectValue('default-sort', this.currentSettings.tasks?.defaultSort);
        this.setInputValue('reminder-days', this.currentSettings.tasks?.reminderDays);
        this.setInputValue('daily-goal', this.currentSettings.tasks?.dailyGoal);
        this.setInputValue('time-estimation', this.currentSettings.tasks?.timeEstimation);
        this.setInputValue('completion-tracking', this.currentSettings.tasks?.completionTracking);

        // Notes settings
        this.setSelectValue('default-font', this.currentSettings.notes?.defaultFont);
        this.setInputValue('font-size', this.currentSettings.notes?.fontSize);
        this.setInputValue('markdown-enabled', this.currentSettings.notes?.markdownEnabled);
        this.setInputValue('spell-check', this.currentSettings.notes?.spellCheck);
        this.setInputValue('auto-save', this.currentSettings.notes?.autoSave);

        // Calendar settings
        this.setSelectValue('default-view', this.currentSettings.calendar?.defaultView);
        this.setSelectValue('week-starts-on', this.currentSettings.calendar?.weekStartsOn);
        this.setSelectValue('time-format', this.currentSettings.calendar?.timeFormat);
        this.setSelectValue('default-event-duration', this.currentSettings.calendar?.defaultEventDuration);
        this.setSelectValue('default-reminder', this.currentSettings.calendar?.defaultReminder);

        // Integration settings
        this.setInputValue('link-tasks-to-calendar', this.currentSettings.integration?.linkTasksToCalendar);
        this.setInputValue('timer-integration', this.currentSettings.integration?.timerIntegration);
        this.setInputValue('note-linking', this.currentSettings.integration?.noteLinking);

        // Accessibility settings
        this.setInputValue('high-contrast', this.currentSettings.accessibility?.highContrast);
        this.setSelectValue('font-scaling', this.currentSettings.accessibility?.fontScaling);
        this.setInputValue('keyboard-shortcuts', this.currentSettings.accessibility?.keyboardShortcuts);

        // Advanced settings
        this.setInputValue('hardware-acceleration', this.currentSettings.advanced?.hardwareAcceleration);
        this.setInputValue('memory-management', this.currentSettings.advanced?.memoryManagement);
        this.setInputValue('data-encryption', this.currentSettings.advanced?.dataEncryption);
        this.setInputValue('analytics', this.currentSettings.advanced?.analytics);
        this.setInputValue('crash-reporting', this.currentSettings.advanced?.crashReporting);

        // Update volume display
        this.updateVolumeDisplay();
        
        // Load available sounds
        this.loadAvailableSounds();
    }

    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    setSelectValue(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    }

    // async loadAvailableSounds() {
    //     try {
    //         const sounds = await window.electronAPI.getAvailableSounds();
    //         const soundSelect = document.getElementById('sound-type');
            
    //         if (soundSelect) {
    //             // Clear existing options except the first one
    //             while (soundSelect.children.length > 1) {
    //                 soundSelect.removeChild(soundSelect.lastChild);
    //             }
                
    //             sounds.forEach(sound => {
    //                 const option = document.createElement('option');
    //                 option.value = sound.id;
    //                 option.textContent = sound.name;
    //                 soundSelect.appendChild(option);
    //             });
                
    //             // Set current selection
    //             soundSelect.value = this.currentSettings.timer?.soundType || 'bell';
    //         }
    //     } catch (error) {
    //         console.error('Failed to load sounds:', error);
    //     }
    // }
    async loadAvailableSounds() {
    try {
        console.log('Loading available sounds...');
        
        // Check if electronAPI exists
        if (!window.electronAPI || !window.electronAPI.getAvailableSounds) {
            throw new Error('electronAPI.getAvailableSounds is not available');
        }
        
        const sounds = await window.electronAPI.getAvailableSounds();
        console.log('Sounds loaded:', sounds);
        
        const soundSelect = document.getElementById('sound-type');
        
        if (!soundSelect) {
            throw new Error('Sound select element not found');
        }
        
        // Clear existing options except the first one (Bell)
        while (soundSelect.children.length > 1) {
            soundSelect.removeChild(soundSelect.lastChild);
        }
        
        if (!sounds || !Array.isArray(sounds)) {
            throw new Error('Invalid sounds data received');
        }
        
        sounds.forEach((sound, index) => {
            if (!sound || !sound.id || !sound.name) {
                console.warn(`Invalid sound at index ${index}:`, sound);
                return;
            }
            
            const option = document.createElement('option');
            option.value = sound.id;
            option.textContent = sound.name;
            soundSelect.appendChild(option);
        });
        
        // Set the current value
        soundSelect.value = this.currentSettings.timer?.soundType || 'bell';
        
        this.showMessage(`Loaded ${sounds.length} sounds successfully`, 'success');
        
    } catch (error) {
        console.error('Failed to load sounds:', error);
        this.showMessage(`Failed to load sounds: ${error.message}`, 'error');
        
        // Fallback: ensure at least the default option exists
        const soundSelect = document.getElementById('sound-type');
        if (soundSelect && soundSelect.children.length === 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = 'bell';
            defaultOption.textContent = 'Bell (Default)';
            soundSelect.appendChild(defaultOption);
        }
    }
}

    updateVolume(volume) {
        const volumeValue = parseFloat(volume);
        
        // Update settings
        if (!this.currentSettings.timer) {
            this.currentSettings.timer = {};
        }
        this.currentSettings.timer.volume = volumeValue;
        
        // Update display
        this.updateVolumeDisplay();
        
        // Send to main process for immediate effect
        window.electronAPI.setTimerVolume(volumeValue);
    }

    updateVolumeDisplay() {
        const volumeDisplay = document.getElementById('volume-display');
        const volumeSlider = document.getElementById('timer-volume');
        
        if (volumeDisplay && volumeSlider) {
            const volume = Math.round(volumeSlider.value * 100);
            volumeDisplay.textContent = `${volume}%`;
        }
    }

    // async testSound() {
    //     try {
    //         const soundType = document.getElementById('sound-type')?.value || 'bell';
    //         const customPath = this.currentSettings.timer?.customSoundPath;
            
    //         let soundPath;
    //         if (soundType === 'custom' && customPath) {
    //             soundPath = customPath;
    //         } else {
    //             const sounds = await window.electronAPI.getAvailableSounds();
    //             const sound = sounds.find(s => s.id === soundType);
    //             soundPath = sound?.path;
    //         }
            
    //         if (soundPath) {
    //             await window.electronAPI.playTestSound(soundPath);
    //             this.showMessage('Playing test sound...', 'info');
    //         }
    //     } catch (error) {
    //         console.error('Failed to test sound:', error);
    //         this.showError('Failed to play test sound');
    //     }
    // }

    async testSound() {
    try {
        console.log('Testing sound...');
        
        const soundSelect = document.getElementById('sound-type');
        if (!soundSelect) {
            throw new Error('Sound selection element not found');
        }
        
        const soundType = soundSelect.value || 'bell';
        console.log('Selected sound type:', soundType);
        
        const customPath = this.currentSettings.timer?.customSoundPath;
        let soundPath;
        
        if (soundType === 'custom' && customPath) {
            soundPath = customPath;
            console.log('Using custom sound path:', soundPath);
        } else {
            if (!window.electronAPI || !window.electronAPI.getAvailableSounds) {
                throw new Error('electronAPI.getAvailableSounds is not available');
            }
            
            const sounds = await window.electronAPI.getAvailableSounds();
            if (!sounds || !Array.isArray(sounds)) {
                throw new Error('No sounds available');
            }
            
            const sound = sounds.find(s => s.id === soundType);
            if (!sound) {
                throw new Error(`Sound with ID "${soundType}" not found`);
            }
            
            soundPath = sound.path;
            console.log('Using sound path:', soundPath);
        }
        
        if (!soundPath) {
            throw new Error('No sound path available');
        }
        
        if (!window.electronAPI || !window.electronAPI.playTestSound) {
            throw new Error('electronAPI.playTestSound is not available');
        }
        
        this.showMessage('Playing test sound...', 'info');
        await window.electronAPI.playTestSound(soundPath);
        
    } catch (error) {
        console.error('Failed to test sound:', error);
        this.showMessage(`Failed to play test sound: ${error.message}`, 'error');
    }
}
    async selectCustomSound() {
        try {
            const sound = await window.electronAPI.selectCustomSound();
            if (sound) {
                // Update settings
                if (!this.currentSettings.timer) {
                    this.currentSettings.timer = {};
                }
                this.currentSettings.timer.customSoundPath = sound.path;
                this.currentSettings.timer.soundType = 'custom';
                
                // Update UI
                const soundSelect = document.getElementById('sound-type');
                if (soundSelect) {
                    // Add custom option if it doesn't exist
                    let customOption = soundSelect.querySelector('option[value="custom"]');
                    if (!customOption) {
                        customOption = document.createElement('option');
                        customOption.value = 'custom';
                        customOption.textContent = 'Custom Sound';
                        soundSelect.appendChild(customOption);
                    }
                    soundSelect.value = 'custom';
                }
                
                this.showMessage(`Custom sound selected: ${sound.name}`, 'success');
                this.detectChanges();
            }
        } catch (error) {
            console.error('Failed to select custom sound:', error);
            this.showError('Failed to select custom sound');
        }
    }

    detectChanges() {
        const hasChanges = this.hasUnsavedChanges();
        const saveBtn = document.getElementById('save-settings');
        const cancelBtn = document.getElementById('cancel-settings');
        
        if (saveBtn) {
            saveBtn.disabled = !hasChanges;
        }
        if (cancelBtn) {
            cancelBtn.disabled = !hasChanges;
        }
        
        // Show unsaved changes indicator
        const indicator = document.getElementById('unsaved-indicator');
        if (indicator) {
            indicator.style.display = hasChanges ? 'block' : 'none';
        }
    }

    hasUnsavedChanges() {
        const formData = this.getFormData();
        return JSON.stringify(formData) !== JSON.stringify(this.originalSettings);
    }

    getFormData() {
        const formData = {
            general: {
                launchOnStartup: this.getInputValue('launch-on-startup'),
                defaultWindow: this.getSelectValue('default-window'),
                alwaysOnTop: this.getInputValue('always-on-top'),
                minimizeToTray: this.getInputValue('minimize-to-tray'),
                autoSaveInterval: this.getSelectValue('auto-save-interval')
            },
            timer: {
                workDuration: parseInt(this.getInputValue('work-duration')) || 25,
                shortBreak: parseInt(this.getInputValue('short-break')) || 5,
                longBreak: parseInt(this.getInputValue('long-break')) || 15,
                soundEnabled: this.getInputValue('sound-enabled'),
                volume: parseFloat(this.getInputValue('timer-volume')) || 0.8,
                soundType: this.getSelectValue('sound-type'),
                customSoundPath: this.currentSettings.timer?.customSoundPath,
                doNotDisturb: this.getInputValue('do-not-disturb')
            },
            tasks: {
                defaultPriority: this.getSelectValue('default-priority'),
                defaultSort: this.getSelectValue('default-sort'),
                reminderDays: parseInt(this.getInputValue('reminder-days')) || 3,
                dailyGoal: parseInt(this.getInputValue('daily-goal')) || 5,
                timeEstimation: this.getInputValue('time-estimation'),
                completionTracking: this.getInputValue('completion-tracking')
            },
            notes: {
                defaultFont: this.getSelectValue('default-font'),
                fontSize: parseInt(this.getInputValue('font-size')) || 14,
                markdownEnabled: this.getInputValue('markdown-enabled'),
                spellCheck: this.getInputValue('spell-check'),
                autoSave: this.getInputValue('auto-save')
            },
            calendar: {
                defaultView: this.getSelectValue('default-view'),
                weekStartsOn: this.getSelectValue('week-starts-on'),
                timeFormat: this.getSelectValue('time-format'),
                defaultEventDuration: this.getSelectValue('default-event-duration'),
                defaultReminder: this.getSelectValue('default-reminder')
            },
            integration: {
                linkTasksToCalendar: this.getInputValue('link-tasks-to-calendar'),
                timerIntegration: this.getInputValue('timer-integration'),
                noteLinking: this.getInputValue('note-linking')
            },
            accessibility: {
                highContrast: this.getInputValue('high-contrast'),
                fontScaling: this.getSelectValue('font-scaling'),
                keyboardShortcuts: this.getInputValue('keyboard-shortcuts')
            },
            advanced: {
                hardwareAcceleration: this.getInputValue('hardware-acceleration'),
                memoryManagement: this.getInputValue('memory-management'),
                dataEncryption: this.getInputValue('data-encryption'),
                analytics: this.getInputValue('analytics'),
                crashReporting: this.getInputValue('crash-reporting')
            }
        };
        
        return formData;
    }

    getInputValue(id) {
        const element = document.getElementById(id);
        if (!element) return null;
        
        if (element.type === 'checkbox') {
            return element.checked;
        }
        return element.value;
    }

    getSelectValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : null;
    }

    async saveSettings() {
        try {
            const formData = this.getFormData();
            const success = await window.electronAPI.saveSettings(formData);
            
            if (success) {
                this.currentSettings = formData;
                this.originalSettings = JSON.parse(JSON.stringify(formData));
                this.showMessage('Settings saved successfully!', 'success');
                this.detectChanges();
                
                // Re-apply theme if it was changed
                if (formData.general?.theme) {
                    setTheme(formData.general.theme);
                }
                
                // Send specific updates to relevant windows
                await this.broadcastSettingsUpdates(formData);
            } else {
                this.showError('Failed to save settings');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            this.showError('Failed to save settings');
        }
    }

    async broadcastSettingsUpdates(settings) {
        try {
            // Send timer-specific updates
            if (settings.timer) {
                await window.electronAPI.updateTimerSettings(settings.timer);
            }
            
            // Send task-specific updates
            if (settings.tasks) {
                await window.electronAPI.updateTaskSettings(settings.tasks);
            }
            
            // Send notes-specific updates
            if (settings.notes) {
                await window.electronAPI.updateNotesSettings(settings.notes);
            }
            
            // Send calendar-specific updates
            if (settings.calendar) {
                await window.electronAPI.updateCalendarSettings(settings.calendar);
            }
        } catch (error) {
            console.error('Failed to broadcast settings updates:', error);
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
            try {
                const success = await window.electronAPI.resetSettings();
                if (success) {
                    this.currentSettings = await window.electronAPI.loadSettings();
                    this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
                    this.populateUI();
                    
                    // Re-initialize UI components after reset
                    await this.initializeUIComponents();
                    
                    this.showMessage('Settings reset to defaults', 'info');
                    this.detectChanges();
                } else {
                    this.showError('Failed to reset settings');
                }
            } catch (error) {
                console.error('Reset settings error:', error);
                this.showError('Failed to reset settings');
            }
        }
    }

    cancelSettings() {
        this.currentSettings = JSON.parse(JSON.stringify(this.originalSettings));
        this.populateUI();
        this.detectChanges();
        this.showMessage('Changes cancelled', 'info');
    }

    async exportData() {
        try {
            const result = await window.electronAPI.exportData();
            if (result.success) {
                this.showMessage(`Data exported to: ${result.path}`, 'success');
            } else if (!result.cancelled) {
                this.showError('Failed to export data');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data');
        }
    }

    async importData() {
        if (confirm('Importing data will overwrite your current settings. Are you sure?')) {
            try {
                const result = await window.electronAPI.importData();
                if (result.success) {
                    this.currentSettings = await window.electronAPI.loadSettings();
                    this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
                    this.populateUI();
                    
                    // Re-initialize UI components after import
                    await this.initializeUIComponents();
                    
                    this.showMessage('Data imported successfully!', 'success');
                    this.detectChanges();
                } else if (!result.cancelled) {
                    this.showError(result.error || 'Failed to import data');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showError('Failed to import data');
            }
        }
    }

    // showMessage(message, type = 'info') {
    //     const messageContainer = document.getElementById('message-container');
    //     if (!messageContainer) return;

    //     const messageElement = document.createElement('div');
    //     messageElement.className = `message message-${type}`;
    //     messageElement.textContent = message;

    //     messageContainer.appendChild(messageElement);

    //     // Auto-remove after 5 seconds
    //     setTimeout(() => {
    //         if (messageElement.parentNode) {
    //             messageElement.parentNode.removeChild(messageElement);
    //         }
    //     }, 5000);
    // }
    showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`); // Always log to console for debugging
    
    let messageContainer = document.getElementById('message-container');
    
    // Create message container if it doesn't exist
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
    }
    
    // Remove any existing messages of the same type to prevent spam
    const existingMessages = messageContainer.querySelectorAll(`.message-${type}`);
    existingMessages.forEach(msg => msg.remove());
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    
    // Add icon based on message type
    const icons = {
        error: '❌',
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    messageElement.innerHTML = `
        <span class="message-icon">${icons[type] || 'ℹ️'}</span>
        <span class="message-text">${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add enhanced styling
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 300px;
        max-width: 500px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        animation: slideIn 0.3s ease-out;
        margin-bottom: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid;
    `;
    
    // Set colors based on message type
    const colors = {
        error: {
            bg: 'rgba(239, 68, 68, 0.95)',
            text: 'white',
            border: 'rgba(239, 68, 68, 1)'
        },
        success: {
            bg: 'rgba(34, 197, 94, 0.95)',
            text: 'white',
            border: 'rgba(34, 197, 94, 1)'
        },
        info: {
            bg: 'rgba(59, 130, 246, 0.95)',
            text: 'white',
            border: 'rgba(59, 130, 246, 1)'
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.95)',
            text: 'white',
            border: 'rgba(245, 158, 11, 1)'
        }
    };
    
    const colorScheme = colors[type] || colors.info;
    messageElement.style.backgroundColor = colorScheme.bg;
    messageElement.style.color = colorScheme.text;
    messageElement.style.borderColor = colorScheme.border;
    
    // Style the close button
    const closeButton = messageElement.querySelector('.message-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    
    closeButton.onmouseover = () => closeButton.style.opacity = '1';
    closeButton.onmouseout = () => closeButton.style.opacity = '0.8';
    
    // Add CSS animation if not already added
    if (!document.querySelector('#message-animations')) {
        const style = document.createElement('style');
        style.id = 'message-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .message-slide-out {
                animation: slideOut 0.3s ease-in forwards;
            }
        `;
        document.head.appendChild(style);
    }
    
    messageContainer.appendChild(messageElement);
    
    // Auto-remove after delay with slide-out animation
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.classList.add('message-slide-out');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }
    }, 5000);
}

    showError(message) {
        this.showMessage(message, 'error');
    }

    // Handle window events
    handleWindowFocus() {
        // Reload settings when window gains focus (in case they were changed elsewhere)
        this.init();
    }

    handleWindowBlur() {
        // Save settings when window loses focus if there are changes
        if (this.hasUnsavedChanges()) {
            // Optionally auto-save or warn user
        }
    }
    // Enhanced audio debugging methods - add these to your SettingsManager class

// Test browser audio capabilities
async testBrowserAudio() {
    try {
        console.log('Testing browser audio capabilities...');
        
        // Check if Web Audio API is supported
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            throw new Error('Web Audio API not supported');
        }
        
        // Create audio context
        const audioContext = new AudioContext();
        console.log('Audio context created:', audioContext.state);
        
        // Resume audio context if suspended (required by modern browsers)
        if (audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            await audioContext.resume();
        }
        
        // Create a simple test tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2); // Play for 200ms
        
        this.showMessage('Browser audio test successful - you should hear a beep', 'success');
        console.log('Browser audio test completed successfully');
        
        return true;
    } catch (error) {
        console.error('Browser audio test failed:', error);
        this.showMessage(`Browser audio test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test HTML5 Audio with different methods
async testHTML5Audio() {
    try {
        console.log('Testing HTML5 Audio...');
        
        // Test with a data URL (simple beep)
        const beepDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBkOW2u/CbyMFl2+z7O2vUxkLyRaJXjrlfNn2zOTK7vGrbvqFa3OWmfrLyAw9KGcrdOdmyf6vL5X+q7F8QyWTsOmnPi9O5YrXQglhIaJ6yb9VPF9a5vK8zz4P0PVOXgBhMwkXSjO8FGGd5FDvCKQQWRXB1uP0+HE6lNKbQ0QqFq8nKEHi9xoYEaHT3M5EQU1JaOLh0t4cGQdMiTQzOz8y3A';
        
        const audio = new Audio(beepDataUrl);
        audio.volume = this.currentSettings.timer?.volume || 0.8;
        
        console.log('HTML5 Audio object created:', audio);
        console.log('Audio volume set to:', audio.volume);
        
        // Add event listeners for debugging
        audio.addEventListener('loadstart', () => console.log('Audio: loadstart'));
        audio.addEventListener('loadeddata', () => console.log('Audio: loadeddata'));
        audio.addEventListener('canplay', () => console.log('Audio: canplay'));
        audio.addEventListener('play', () => console.log('Audio: play event'));
        audio.addEventListener('ended', () => console.log('Audio: ended'));
        audio.addEventListener('error', (e) => console.error('Audio error:', e));
        
        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 5000);
            
            audio.addEventListener('canplay', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                reject(new Error(`Audio load error: ${e.message}`));
            });
        });
        
        console.log('Playing HTML5 audio...');
        await audio.play();
        
        this.showMessage('HTML5 Audio test successful - you should hear a beep', 'success');
        return true;
        
    } catch (error) {
        console.error('HTML5 Audio test failed:', error);
        this.showMessage(`HTML5 Audio test failed: ${error.message}`, 'error');
        return false;
    }
}

// Enhanced test sound method with multiple fallbacks
async testSound() {
    try {
        console.log('=== SOUND TEST STARTING ===');
        
        // First, test browser audio capabilities
        console.log('Step 1: Testing browser audio...');
        const browserAudioWorks = await this.testBrowserAudio();
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test HTML5 Audio
        console.log('Step 2: Testing HTML5 audio...');
        const html5AudioWorks = await this.testHTML5Audio();
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now test the actual sound system
        console.log('Step 3: Testing actual sound system...');
        
        const soundSelect = document.getElementById('sound-type');
        if (!soundSelect) {
            throw new Error('Sound selection element not found');
        }
        
        const soundType = soundSelect.value || 'bell';
        console.log('Selected sound type:', soundType);
        
        // Check volume settings
        const volumeSlider = document.getElementById('timer-volume');
        const currentVolume = volumeSlider ? parseFloat(volumeSlider.value) : 0.8;
        console.log('Current volume setting:', currentVolume);
        
        if (currentVolume === 0) {
            this.showMessage('Volume is set to 0! Please increase the volume.', 'warning');
            return;
        }
        
        // Check if sound is enabled
        const soundEnabled = document.getElementById('sound-enabled');
        if (soundEnabled && !soundEnabled.checked) {
            this.showMessage('Sound is disabled! Please enable sound notifications.', 'warning');
            return;
        }
        
        const customPath = this.currentSettings.timer?.customSoundPath;
        let soundPath;
        
        if (soundType === 'custom' && customPath) {
            soundPath = customPath;
            console.log('Using custom sound path:', soundPath);
        } else {
            if (!window.electronAPI || !window.electronAPI.getAvailableSounds) {
                throw new Error('electronAPI.getAvailableSounds is not available');
            }
            
            const sounds = await window.electronAPI.getAvailableSounds();
            console.log('Available sounds:', sounds);
            
            if (!sounds || !Array.isArray(sounds)) {
                throw new Error('No sounds available');
            }
            
            const sound = sounds.find(s => s.id === soundType);
            if (!sound) {
                throw new Error(`Sound with ID "${soundType}" not found`);
            }
            
            soundPath = sound.path;
            console.log('Using sound path:', soundPath);
        }
        
        if (!soundPath) {
            throw new Error('No sound path available');
        }
        
        // Check if the electronAPI method exists
        if (!window.electronAPI || !window.electronAPI.playTestSound) {
            throw new Error('electronAPI.playTestSound is not available - trying alternative methods');
        }
        
        console.log('Calling electronAPI.playTestSound with path:', soundPath);
        this.showMessage('Attempting to play sound via Electron...', 'info');
        
        // Try to play via Electron
        try {
            await window.electronAPI.playTestSound(soundPath);
            console.log('electronAPI.playTestSound completed');
            this.showMessage('Sound played via Electron API', 'success');
        } catch (electronError) {
            console.error('Electron sound playback failed:', electronError);
            this.showMessage(`Electron sound failed: ${electronError.message}`, 'error');
            
            // Fallback: try to play as web audio if it's a web-accessible path
            console.log('Trying fallback web audio...');
            try {
                const audio = new Audio(soundPath);
                audio.volume = currentVolume;
                await audio.play();
                this.showMessage('Sound played via web audio fallback', 'success');
            } catch (webError) {
                console.error('Web audio fallback failed:', webError);
                throw new Error(`Both Electron and web audio failed. Electron: ${electronError.message}, Web: ${webError.message}`);
            }
        }
        
        console.log('=== SOUND TEST COMPLETED ===');
        
    } catch (error) {
        console.error('=== SOUND TEST FAILED ===');
        console.error('Final error:', error);
        this.showMessage(`Sound test failed: ${error.message}`, 'error');
        
        // Provide helpful suggestions
        this.showMessage('Check: 1) Volume settings 2) System audio 3) Browser permissions 4) Electron audio setup', 'info');
    }
}

// Method to check system audio settings
checkSystemAudio() {
    console.log('=== SYSTEM AUDIO CHECK ===');
    
    // Check browser audio permissions
    if (navigator.permissions) {
        navigator.permissions.query({name: 'microphone'}).then(result => {
            console.log('Microphone permission:', result.state);
        }).catch(e => console.log('Could not check microphone permission:', e.message));
    }
    
    // Check if audio context is allowed
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const testContext = new AudioContext();
        console.log('Audio context state:', testContext.state);
        console.log('Audio context sample rate:', testContext.sampleRate);
        console.log('Audio context destination:', testContext.destination);
        testContext.close();
    }
    
    // Check current volume setting
    const volumeSlider = document.getElementById('timer-volume');
    const volumeDisplay = document.getElementById('volume-display');
    
    console.log('Volume slider value:', volumeSlider?.value);
    console.log('Volume display text:', volumeDisplay?.textContent);
    
    // Check sound enabled setting
    const soundEnabled = document.getElementById('sound-enabled');
    console.log('Sound enabled:', soundEnabled?.checked);
    
    this.showMessage('System audio check completed - see console for details', 'info');
}

// Add this method to test different audio formats
async testMultipleAudioFormats() {
    const testSounds = [
        {
            name: 'Data URL Beep',
            url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEZBkOW2u/CbyMF'
        }
    ];
    
    for (const testSound of testSounds) {
        try {
            console.log(`Testing ${testSound.name}...`);
            const audio = new Audio(testSound.url);
            audio.volume = 0.5;
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
                audio.oncanplay = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                audio.onerror = (e) => {
                    clearTimeout(timeout);
                    reject(e);
                };
            });
            
            await audio.play();
            this.showMessage(`${testSound.name} played successfully`, 'success');
            
            // Wait between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`${testSound.name} failed:`, error);
            this.showMessage(`${testSound.name} failed: ${error.message}`, 'error');
        }
    }
}
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const settingsManager = new SettingsManager();
    
    // Handle window focus/blur events
    window.electronAPI.onWindowFocus(() => {
        settingsManager.handleWindowFocus();
    });
    
    window.electronAPI.onWindowBlur(() => {
        settingsManager.handleWindowBlur();
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
        if (settingsManager.hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    // Make settingsManager globally available for debugging
    window.settingsManager = settingsManager;
});