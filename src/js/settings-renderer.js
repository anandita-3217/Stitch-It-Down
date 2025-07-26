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

    async loadAvailableSounds() {
        try {
            const sounds = await window.electronAPI.getAvailableSounds();
            const soundSelect = document.getElementById('sound-type');
            
            if (soundSelect) {
                // Clear existing options except the first one
                while (soundSelect.children.length > 1) {
                    soundSelect.removeChild(soundSelect.lastChild);
                }
                
                sounds.forEach(sound => {
                    const option = document.createElement('option');
                    option.value = sound.id;
                    option.textContent = sound.name;
                    soundSelect.appendChild(option);
                });
                
                // Set current selection
                soundSelect.value = this.currentSettings.timer?.soundType || 'bell';
            }
        } catch (error) {
            console.error('Failed to load sounds:', error);
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

    async testSound() {
        try {
            const soundType = document.getElementById('sound-type')?.value || 'bell';
            const customPath = this.currentSettings.timer?.customSoundPath;
            
            let soundPath;
            if (soundType === 'custom' && customPath) {
                soundPath = customPath;
            } else {
                const sounds = await window.electronAPI.getAvailableSounds();
                const sound = sounds.find(s => s.id === soundType);
                soundPath = sound?.path;
            }
            
            if (soundPath) {
                await window.electronAPI.playTestSound(soundPath);
                this.showMessage('Playing test sound...', 'info');
            }
        } catch (error) {
            console.error('Failed to test sound:', error);
            this.showError('Failed to play test sound');
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

    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;

        messageContainer.appendChild(messageElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
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