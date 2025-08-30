// settings-renderer.js - UI Rendering and Event Handling
import '@css/main.css';
import '@css/components/settings.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import { SettingsCore, SOUND_REGISTRY } from '@components/settings.js';
import { TimerSettings} from '@components/settings/settings-timer.js';
import { TaskSettings } from '@components/settings/settings-tasks.js';
import { setImage, setDailyQuote, setRandomGif, loadAllImages, initTheme, setTheme, toggleTheme, updateDate, updateClock } from '@components/utils.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
class SettingsRenderer {
    constructor() {
        this.settingsCore = new SettingsCore();
        this.timerModule = new TimerSettings();
        this.taskModule = new TaskSettings();
        this.setupCoreEventListeners();
    }
    async init() {
        try {
            await this.initializeUIComponents();
            await this.settingsCore.init();
            this.setupUIEventListeners();
            this.setupTabNavigation();
            this.setupWindowEventListeners();
            
            console.log('Settings renderer initialized');
        } catch (error) {
            console.error('Failed to initialize settings renderer:', error);
            this.showError('Failed to initialize settings');
        }
    }

    // Initialize UI components
    async initializeUIComponents() {
        try {
            initTheme();
            await loadAllImages();
            setDailyQuote();
            
            if (document.getElementById('current-time')) {
                updateClock();
                setInterval(updateClock, 1000);
            }
            
            if (document.getElementById('current-date')) {
                updateDate();
                setInterval(updateDate, 60000);
            }
        } catch (error) {
            console.error('Failed to initialize UI components:', error);
        }
    }

    // Setup event listeners for core settings events
    setupCoreEventListeners() {
        this.settingsCore.on('settingsLoaded', (settings) => {
            this.populateUI(settings);
        });

        this.settingsCore.on('settingsSaved', (settings) => {
            this.showMessage('Settings saved successfully!', 'success');
            this.updateChangeDetection();
            
            if (settings.general?.theme) {
                setTheme(settings.general.theme);
            }
        });

        this.settingsCore.on('settingsReset', (settings) => {
            this.populateUI(settings);
            this.initializeUIComponents();
            this.showMessage('Settings reset to defaults', 'info');
            this.updateChangeDetection();
        });

        this.settingsCore.on('settingsCancelled', (settings) => {
            this.populateUI(settings);
            this.updateChangeDetection();
            this.showMessage('Changes cancelled', 'info');
        });

        this.settingsCore.on('volumeChanged', (volume) => {
            this.updateVolumeDisplay();
        });

        this.settingsCore.on('customSoundSelected', (sound) => {
            this.addCustomSoundOption();
            this.setSelectValue('sound-type', 'custom');
            this.showMessage(`Custom sound selected: ${sound.name}`, 'success');
            this.updateChangeDetection();
        });

        this.settingsCore.on('soundTestSuccess', ({ soundType, volume }) => {
            this.showMessage('Sound played successfully!', 'success');
        });

        this.settingsCore.on('soundTestError', (error) => {
            this.showMessage(`Sound test failed: ${error}`, 'error');
        });

        this.settingsCore.on('dataExported', (path) => {
            this.showMessage(`Data exported to: ${path}`, 'success');
        });

        this.settingsCore.on('dataImported', (settings) => {
            this.populateUI(settings);
            this.initializeUIComponents();
            this.showMessage('Data imported successfully!', 'success');
            this.updateChangeDetection();
        });

        this.settingsCore.on('systemAudioCheck', (diagnostics) => {
            this.showMessage('System audio check completed - see console for details', 'info');
            console.log('=== SYSTEM AUDIO DIAGNOSTICS ===', diagnostics);
        });

        this.settingsCore.on('validationError', (errors) => {
            errors.forEach(error => this.showError(error));
        });

        this.settingsCore.on('error', (error) => {
            this.showError(error);
        });

        this.settingsCore.on('settingsUpdatedFromExternal', (settings) => {
            this.populateUI(settings);
            this.showMessage('Settings updated', 'info');
        });

        this.settingsCore.on('timerEvent', (data) => {
            console.log('Timer event received:', data);
        });
            // ADD THESE NEW TIMER MODULE LISTENERS:
    this.timerModule.on('volumeChanged', (volume) => {
        this.updateVolumeDisplay();
    });

    this.timerModule.on('customSoundSelected', (sound) => {
        this.addCustomSoundOption();
        this.setSelectValue('sound-type', 'custom');
        this.showMessage(`Custom sound selected: ${sound.name}`, 'success');
        this.updateChangeDetection();
    });

    this.timerModule.on('soundTestSuccess', ({ soundType, volume }) => {
        this.showMessage('Sound played successfully!', 'success');
    });

    this.timerModule.on('soundTestError', (error) => {
        this.showMessage(`Sound test failed: ${error}`, 'error');
    });

    this.timerModule.on('systemAudioCheck', (diagnostics) => {
        this.showMessage('System audio check completed - see console for details', 'info');
        console.log('=== SYSTEM AUDIO DIAGNOSTICS ===', diagnostics);
    });

    this.timerModule.on('error', (error) => {
        this.showError(`Timer: ${error}`);
    });
    // ADD THESE TASK MODULE LISTENERS in setupCoreEventListeners() method
// Place these after the timer module listeners
    this.taskModule.on('taskCreated', (task) => {
        this.showMessage(`Task created: ${task.title}`, 'success');
        this.updateChangeDetection();
    });

    this.taskModule.on('taskUpdated', (task) => {
        this.showMessage(`Task updated: ${task.title}`, 'info');
        this.updateChangeDetection();
    });

    this.taskModule.on('taskCompleted', (task) => {
        this.showMessage(`Task completed: ${task.title}`, 'success');
        this.updateTaskStatistics();
    });

    this.taskModule.on('taskDeleted', (task) => {
        this.showMessage(`Task deleted: ${task.title}`, 'info');
        this.updateChangeDetection();
    });

    this.taskModule.on('dailyGoalAchieved', (data) => {
        this.showMessage(`Daily goal achieved! ${data.completed}/${data.goal} tasks completed`, 'success');
    });

    this.taskModule.on('settingsApplied', (settings) => {
        this.showMessage('Task settings applied successfully!', 'success');
        this.updateChangeDetection();
    });

    this.taskModule.on('settingsReset', (settings) => {
        this.populateTaskSettings(settings);
        this.showMessage('Task settings reset to defaults', 'info');
        this.updateChangeDetection();
    });

    this.taskModule.on('settingsImported', (settings) => {
        this.populateTaskSettings(settings);
        this.showMessage('Task settings imported successfully!', 'success');
        this.updateChangeDetection();
    });

    this.taskModule.on('tasksArchived', (tasks) => {
        this.showMessage(`${tasks.length} tasks archived automatically`, 'info');
    });

    this.taskModule.on('tasksImported', (data) => {
        this.showMessage(`${data.tasks.length} tasks imported successfully!`, 'success');
    });

    this.taskModule.on('taskLinkedToCalendar', (data) => {
        this.showMessage(`Task "${data.task.title}" linked to calendar`, 'info');
    });

    this.taskModule.on('taskTimerStarted', (task) => {
        this.showMessage(`Timer started for: ${task.title}`, 'info');
    });

    this.taskModule.on('taskTimerStopped', (data) => {
        const minutes = Math.round(data.timeSpent / 60000);
        this.showMessage(`Timer stopped for "${data.task.title}": ${minutes} minutes`, 'info');
    });

    this.taskModule.on('validationError', (errors) => {
        errors.forEach(error => this.showError(`Task: ${error}`));
    });

    this.taskModule.on('error', (error) => {
        this.showError(`Task: ${error}`);
    });
        }

    // Setup UI event listeners
//     setupUIEventListeners() {
//         // Button event listeners
//         this.bindButton('save-settings', () => this.handleSaveSettings());
//         this.bindButton('reset-settings', () => this.handleResetSettings());
//         this.bindButton('cancel-settings', () => this.handleCancelSettings());
//         this.bindButton('export-data', () => this.handleExportData());
//         this.bindButton('import-data', () => this.handleImportData());
//         this.bindButton('test-sound', () => this.handleTestSound());
//         this.bindButton('select-custom-sound', () => this.handleSelectCustomSound());
//         const volumeSlider = document.getElementById('timer-volume');
//         if (volumeSlider) {
//             volumeSlider.addEventListener('input', (e) => {
//                 // Try the new way first, fallback to old if it breaks
//                 try {
//                     this.timerModule.updateVolume(e.target.value); // NEW way!
//                     console.log('✅ Using new timer module for volume');
//                 } catch (error) {
//                     console.log('❌ New module failed, using old method:', error);
//                     // this.settingsCore.updateVolume(e.target.value); // OLD way as backup
//                 }
//             });
//         }
//         // Form change detection
//         const form = document.getElementById('settings-form');
//         if (form) {
//             form.addEventListener('change', () => this.updateChangeDetection());
//             form.addEventListener('input', () => this.updateChangeDetection());
//         }
//         this.bindButton('reset-task-settings', () => this.handleResetTaskSettings());
//         this.bindButton('export-task-data', () => this.handleExportTaskData());
//         this.bindButton('import-task-data', () => this.handleImportTaskData());
//         this.bindButton('check-daily-goal', () => this.handleCheckDailyGoal());

//         // Add change listeners for task form fields
//         const taskFormFields = [
//             'default-priority', 'default-sort', 'reminder-days', 
//             'daily-goal', 'time-estimation', 'completion-tracking'
//         ];

//         taskFormFields.forEach(fieldId => {
//             const field = document.getElementById(fieldId);
//             if (field) {
//                 field.addEventListener('change', () => {
//                     this.updateChangeDetection();
//                     // Optionally validate in real-time
//                     if (fieldId === 'reminder-days' || fieldId === 'daily-goal') {
//                         this.validateTaskField(fieldId);
//                     }
//                 });
//             }
//         });
//         // Simplified version if you're still getting syntax errors:

// validateTaskField(fieldId) {
//     const field = document.getElementById(fieldId);
//     if (!field) {
//         return true;
//     }

//     const value = parseInt(field.value);
//     let isValid = true;
//     let errorMessage = '';

//     if (fieldId === 'reminder-days') {
//         if (value < 0 || value > 30) {
//             isValid = false;
//             errorMessage = 'Reminder days must be between 0 and 30';
//         }
//     } else if (fieldId === 'daily-goal') {
//         if (value < 1 || value > 50) {
//             isValid = false;
//             errorMessage = 'Daily goal must be between 1 and 50';
//         }
//     }

//     // Visual feedback
//     if (isValid) {
//         field.classList.remove('error');
//     } else {
//         field.classList.add('error');
//     }
    
//     // Error message handling
//     let errorDiv = field.parentNode.querySelector('.field-error');
//     if (!isValid) {
//         if (!errorDiv) {
//             errorDiv = document.createElement('div');
//             errorDiv.className = 'field-error';
//             field.parentNode.appendChild(errorDiv);
//         }
//         errorDiv.textContent = errorMessage;
//     } else {
//         if (errorDiv) {
//             errorDiv.remove();
//         }
//     }

//     return isValid;
// }


    
    
    
    
//     }
    // Setup UI event listeners
setupUIEventListeners() {
    // Button event listeners
    this.bindButton('save-settings', () => this.handleSaveSettings());
    this.bindButton('reset-settings', () => this.handleResetSettings());
    this.bindButton('cancel-settings', () => this.handleCancelSettings());
    this.bindButton('export-data', () => this.handleExportData());
    this.bindButton('import-data', () => this.handleImportData());
    this.bindButton('test-sound', () => this.handleTestSound());
    this.bindButton('select-custom-sound', () => this.handleSelectCustomSound());

    // Task-specific buttons
    this.bindButton('reset-task-settings', () => this.handleResetTaskSettings());
    this.bindButton('export-task-data', () => this.handleExportTaskData());
    this.bindButton('import-task-data', () => this.handleImportTaskData());
    this.bindButton('check-daily-goal', () => this.handleCheckDailyGoal());

    // Volume slider for timer
    const volumeSlider = document.getElementById('timer-volume');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            try {
                this.timerModule.updateVolume(e.target.value);
                console.log('Using new timer module for volume');
            } catch (error) {
                console.log('New module failed, using old method:', error);
            }
        });
    }

    // Task form field change listeners
    const taskFormFields = [
        'default-priority', 'default-sort', 'reminder-days', 
        'daily-goal', 'time-estimation', 'completion-tracking'
    ];

    taskFormFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => {
                this.updateChangeDetection();
                // Real-time validation for numeric fields
                if (fieldId === 'reminder-days' || fieldId === 'daily-goal') {
                    this.validateTaskField(fieldId);
                }
            });
        }
    });

    // Form change detection for all settings
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('change', () => this.updateChangeDetection());
        form.addEventListener('input', () => this.updateChangeDetection());
    }
}
    // Helper method to bind button events
    bindButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    }

    // Setup tab navigation
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                e.target.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Setup window event listeners
    setupWindowEventListeners() {
        if (window.electronAPI?.onWindowFocus) {
            window.electronAPI.onWindowFocus(() => {
                this.settingsCore.init();
            });
        }

        window.addEventListener('beforeunload', (e) => {
            if (this.settingsCore.hasUnsavedChanges(this.getFormData())) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // async handleSaveSettings() {
    //     const formData = this.getFormData();
    //     await this.settingsCore.saveSettings(formData);
        
    //     // ADD: Notify about task settings specifically
    //     if (formData.tasks && window.electronAPI?.updateTaskSettings) {
    //         await window.electronAPI.updateTaskSettings(formData.tasks);
    //     }
    // }
    // REPLACE your existing handleSaveSettings method with this:

async handleSaveSettings() {
    // Validate task settings first
    if (!this.validateTaskForm()) {
        this.showError('Please fix task settings errors before saving');
        return;
    }

    const formData = this.getFormData();
    
    // Apply task settings to the task module
    if (formData.tasks) {
        try {
            const errors = this.taskModule.validateTaskSettings(formData.tasks);
            if (errors.length > 0) {
                errors.forEach(error => this.showError(error));
                return;
            }
            
            this.taskModule.setCurrentSettings(formData);
            console.log('Task settings applied to module');
        } catch (error) {
            this.showError(`Failed to apply task settings: ${error.message}`);
            return;
        }
    }
    
    // Save through core settings
    await this.settingsCore.saveSettings(formData);
    
    // Notify Electron about task settings if available
    if (formData.tasks && window.electronAPI?.updateTaskSettings) {
        try {
            await window.electronAPI.updateTaskSettings(formData.tasks);
            console.log('Task settings sent to Electron main process');
        } catch (error) {
            console.warn('Failed to send task settings to main process:', error);
        }
    }
}
    async handleResetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
            await this.settingsCore.resetSettings();
        }
    }

    handleCancelSettings() {
        this.settingsCore.cancelSettings();
    }

    async handleExportData() {
        await this.settingsCore.exportData();
    }

    async handleImportData() {
        if (confirm('Importing data will overwrite your current settings. Are you sure?')) {
            await this.settingsCore.importData();
        }
    }

    handleTestSound() {
        const soundSelect = document.getElementById('sound-type');
        const soundType = soundSelect?.value || 'bell';
        const currentVolume = parseFloat(document.getElementById('timer-volume')?.value || 0.8);
        try {
            this.timerModule.testSound(soundType,currentVolume);
            console.log('✅ Using new timer module for sound test')
        } catch (error) {
            console.log('❌ New sound test failed, using old method.Error: ',error);
            // this.settingsCore.testSound(soundType, currentVolume);
        }
    }

    async handleSelectCustomSound() {
        try {
            await this.timerModule.selectCustomSound();
            console.log('✅ Using new timer module for custom sound');
        } catch (error) {
            console.log('❌ New custom sound failed, using old method:', error);
            // await this.settingsCore.selectCustomSound();
        }
    }

    // UI Population and Updates
    // populateUI(settings) {
    //     // General settings
    //     this.setInputValue('launch-on-startup', settings.general?.launchOnStartup);
    //     this.setSelectValue('default-window', settings.general?.defaultWindow);
    //     this.setInputValue('always-on-top', settings.general?.alwaysOnTop);
    //     this.setInputValue('minimize-to-tray', settings.general?.minimizeToTray);
    //     this.setSelectValue('auto-save-interval', settings.general?.autoSaveInterval);

    //     // Timer settings
    //     this.timerModule.setCurrentSettings(settings);

    //     this.setInputValue('work-duration', settings.timer?.workDuration);
    //     this.setInputValue('short-break', settings.timer?.shortBreak);
    //     this.setInputValue('long-break', settings.timer?.longBreak);
    //     this.setInputValue('sound-enabled', settings.timer?.soundEnabled);
    //     this.setInputValue('timer-volume', settings.timer?.volume);
    //     this.setSelectValue('sound-type', settings.timer?.soundType);
    //     this.setInputValue('do-not-disturb', settings.timer?.doNotDisturb);

    //     // Task settings
    //     this.taskModule.setCurrentSettings(settings); // ADD THIS LINE

    //     this.setSelectValue('default-priority', settings.tasks?.defaultPriority);
    //     this.setSelectValue('default-sort', settings.tasks?.defaultSort);
    //     this.setInputValue('reminder-days', settings.tasks?.reminderDays);
    //     this.setInputValue('daily-goal', settings.tasks?.dailyGoal);
    //     this.setInputValue('time-estimation', settings.tasks?.timeEstimation);
    //     this.setInputValue('completion-tracking', settings.tasks?.completionTracking);

    //     // Notes settings
    //     this.setSelectValue('default-font', settings.notes?.defaultFont);
    //     this.setInputValue('font-size', settings.notes?.fontSize);
    //     this.setInputValue('markdown-enabled', settings.notes?.markdownEnabled);
    //     this.setInputValue('spell-check', settings.notes?.spellCheck);
    //     this.setInputValue('auto-save', settings.notes?.autoSave);

    //     // Calendar settings
    //     this.setSelectValue('default-view', settings.calendar?.defaultView);
    //     this.setSelectValue('week-starts-on', settings.calendar?.weekStartsOn);
    //     this.setSelectValue('time-format', settings.calendar?.timeFormat);
    //     this.setSelectValue('default-event-duration', settings.calendar?.defaultEventDuration);
    //     this.setSelectValue('default-reminder', settings.calendar?.defaultReminder);

    //     // Integration settings
    //     this.setInputValue('link-tasks-to-calendar', settings.integration?.linkTasksToCalendar);
    //     this.setInputValue('timer-integration', settings.integration?.timerIntegration);
    //     this.setInputValue('note-linking', settings.integration?.noteLinking);

    //     // Accessibility settings
    //     this.setInputValue('high-contrast', settings.accessibility?.highContrast);
    //     this.setSelectValue('font-scaling', settings.accessibility?.fontScaling);
    //     this.setInputValue('keyboard-shortcuts', settings.accessibility?.keyboardShortcuts);

    //     // Advanced settings
    //     this.setInputValue('hardware-acceleration', settings.advanced?.hardwareAcceleration);
    //     this.setInputValue('memory-management', settings.advanced?.memoryManagement);
    //     this.setInputValue('data-encryption', settings.advanced?.dataEncryption);
    //     this.setInputValue('analytics', settings.advanced?.analytics);
    //     this.setInputValue('crash-reporting', settings.advanced?.crashReporting);

    //     this.updateVolumeDisplay();
    //     this.loadAvailableSounds();
    //     this.updateChangeDetection();
    // }
    // REPLACE your existing populateUI method with this updated version:

populateUI(settings) {
    // General settings
    this.setInputValue('launch-on-startup', settings.general?.launchOnStartup);
    this.setSelectValue('default-window', settings.general?.defaultWindow);
    this.setInputValue('always-on-top', settings.general?.alwaysOnTop);
    this.setInputValue('minimize-to-tray', settings.general?.minimizeToTray);
    this.setSelectValue('auto-save-interval', settings.general?.autoSaveInterval);

    // Timer settings - pass settings to timer module
    this.timerModule.setCurrentSettings(settings);
    this.setInputValue('work-duration', settings.timer?.workDuration);
    this.setInputValue('short-break', settings.timer?.shortBreak);
    this.setInputValue('long-break', settings.timer?.longBreak);
    this.setInputValue('sound-enabled', settings.timer?.soundEnabled);
    this.setInputValue('timer-volume', settings.timer?.volume);
    this.setSelectValue('sound-type', settings.timer?.soundType);
    this.setInputValue('do-not-disturb', settings.timer?.doNotDisturb);

    // Task settings - use the new method
    this.taskModule.setCurrentSettings(settings);
    this.populateTaskSettings(settings);

    // Notes settings
    this.setSelectValue('default-font', settings.notes?.defaultFont);
    this.setInputValue('font-size', settings.notes?.fontSize);
    this.setInputValue('markdown-enabled', settings.notes?.markdownEnabled);
    this.setInputValue('spell-check', settings.notes?.spellCheck);
    this.setInputValue('auto-save', settings.notes?.autoSave);

    // Calendar settings
    this.setSelectValue('default-view', settings.calendar?.defaultView);
    this.setSelectValue('week-starts-on', settings.calendar?.weekStartsOn);
    this.setSelectValue('time-format', settings.calendar?.timeFormat);
    this.setSelectValue('default-event-duration', settings.calendar?.defaultEventDuration);
    this.setSelectValue('default-reminder', settings.calendar?.defaultReminder);

    // Integration settings
    this.setInputValue('link-tasks-to-calendar', settings.integration?.linkTasksToCalendar);
    this.setInputValue('timer-integration', settings.integration?.timerIntegration);
    this.setInputValue('note-linking', settings.integration?.noteLinking);

    // Accessibility settings
    this.setInputValue('high-contrast', settings.accessibility?.highContrast);
    this.setSelectValue('font-scaling', settings.accessibility?.fontScaling);
    this.setInputValue('keyboard-shortcuts', settings.accessibility?.keyboardShortcuts);

    // Advanced settings
    this.setInputValue('hardware-acceleration', settings.advanced?.hardwareAcceleration);
    this.setInputValue('memory-management', settings.advanced?.memoryManagement);
    this.setInputValue('data-encryption', settings.advanced?.dataEncryption);
    this.setInputValue('analytics', settings.advanced?.analytics);
    this.setInputValue('crash-reporting', settings.advanced?.crashReporting);

    this.updateVolumeDisplay();
    this.loadAvailableSounds();
    this.updateChangeDetection();
}

    // UI Helper Methods
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else {
            element.value = value || '';
        }
    }

    setSelectValue(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
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

    getFormData() {
        return {
            general: {
                launchOnStartup: this.getInputValue('launch-on-startup'),
                defaultWindow: this.getSelectValue('default-window'),
                alwaysOnTop: this.getInputValue('always-on-top'),
                minimizeToTray: this.getInputValue('minimize-to-tray'),
                autoSaveInterval: this.getSelectValue('auto-save-interval')
            },
            timer: {
                workDuration: this.getInputValue('work-duration'),
                shortBreak: this.getInputValue('short-break'),
                longBreak: this.getInputValue('long-break'),
                soundEnabled: this.getInputValue('sound-enabled'),
                volume: this.getInputValue('timer-volume'),
                soundType: this.getSelectValue('sound-type'),
                customSoundPath: this.settingsCore.currentSettings.timer?.customSoundPath,
                doNotDisturb: this.getInputValue('do-not-disturb')
            },
            tasks: {
                defaultPriority: this.getSelectValue('default-priority'),
                defaultSort: this.getSelectValue('default-sort'),
                reminderDays: this.getInputValue('reminder-days'),
                dailyGoal: this.getInputValue('daily-goal'),
                timeEstimation: this.getInputValue('time-estimation'),
                completionTracking: this.getInputValue('completion-tracking')
            },
            notes: {
                defaultFont: this.getSelectValue('default-font'),
                fontSize: this.getInputValue('font-size'),
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
    
    }
    loadAvailableSounds() {
    try {
        // NEW: Use the timer module
        const sounds = this.timerModule.getAvailableSounds();
        console.log('✅ Using new timer module for available sounds');
        console.log('🔊 Sounds found:', sounds); 
        
        const soundSelect = document.getElementById('sound-type');
        
        if (!soundSelect) return;
        soundSelect.innerHTML = ''; // Clear ALL options first
        
        // Add sound options
        sounds.forEach((sound) => {
            const option = document.createElement('option');
            option.value = sound.id;
            option.textContent = sound.name;
            soundSelect.appendChild(option);
            console.log('Added sound:', sound.name); 
        });

        // Set current value
        const currentSoundType = this.settingsCore.currentSettings.timer?.soundType || 'bell';
        soundSelect.value = currentSoundType;

        // Add custom sound option if it exists
        if (currentSoundType === 'custom') {
            this.addCustomSoundOption();
        }

    } catch (error) {
        console.error('❌ Failed to load sounds:', error);
        this.showMessage(`Failed to load sounds: ${error.message}`, 'error');
        
        // FALLBACK: Try the old way
        // try {
        //     const sounds = this.settingsCore.getAvailableSounds();
        //     console.log('🔄 Using fallback method');
        // } catch (fallbackError) {
        //     console.error('💥 Even fallback failed:', fallbackError);
        // }
    }
}

    addCustomSoundOption() {
        const soundSelect = document.getElementById('sound-type');
        if (!soundSelect) return;

        let customOption = soundSelect.querySelector('option[value="custom"]');
        if (!customOption) {
            customOption = document.createElement('option');
            customOption.value = 'custom';
            customOption.textContent = 'Custom Sound';
            soundSelect.appendChild(customOption);
        }
    }
    // REPLACE updateVolumeDisplay() method:
    updateVolumeDisplay() {
        const volumeDisplay = document.getElementById('volume-display');
        const volumeSlider = document.getElementById('timer-volume');

        if (volumeDisplay && volumeSlider) {
            const volume = Math.round(volumeSlider.value * 100);
            volumeDisplay.textContent = `${volume}%`;
        }
    }
    // Change detection UI
    updateChangeDetection() {
        const formData = this.getFormData();
        const hasChanges = this.settingsCore.hasUnsavedChanges(formData);
        
        const saveBtn = document.getElementById('save-settings');
        const cancelBtn = document.getElementById('cancel-settings');

        if (saveBtn) {
            saveBtn.disabled = !hasChanges;
        }
        if (cancelBtn) {
            cancelBtn.disabled = !hasChanges;
        }

        const indicator = document.getElementById('unsaved-indicator');
        if (indicator) {
            indicator.style.display = hasChanges ? 'block' : 'none';
        }
    }
    showMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

        let messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.className = 'message-container';
            document.body.appendChild(messageContainer);
        }
        const existingMessages = messageContainer.querySelectorAll(`.message-${type}`);
        existingMessages.forEach(msg => msg.remove());

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;

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

        messageContainer.appendChild(messageElement);
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.classList.add('message-slide-out');
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }
    checkSystemAudio() {
        this.settingsCore.checkSystemAudio();
    }
    getSettingsCore() {
        return this.settingsCore;
    }

    getCurrentSettings() {
        return this.settingsCore.getCurrentSettings();
    }
    logCurrentState() {
        console.log('Current Settings:', this.settingsCore.getCurrentSettings());
        console.log('Original Settings:', this.settingsCore.getOriginalSettings());
        console.log('Form Data:', this.getFormData());
        console.log('Has Changes:', this.settingsCore.hasUnsavedChanges(this.getFormData()));
    }

// Add these methods to your SettingsRenderer class

// Populate task settings specifically
populateTaskSettings(settings) {
    const taskSettings = settings.tasks || this.taskModule.getDefaultSettings();
    
    this.setSelectValue('default-priority', taskSettings.defaultPriority);
    this.setSelectValue('default-sort', taskSettings.defaultSort);
    this.setInputValue('reminder-days', taskSettings.reminderDays);
    this.setInputValue('daily-goal', taskSettings.dailyGoal);
    this.setInputValue('time-estimation', taskSettings.timeEstimation);
    this.setInputValue('completion-tracking', taskSettings.completionTracking);
    
    console.log('Task settings populated:', taskSettings);
}

// Update task statistics display
updateTaskStatistics(tasks = []) {
    try {
        const stats = this.taskModule.getTaskStatistics(tasks);
        const metrics = this.taskModule.calculateProductivityMetrics(tasks);
        
        // Update UI elements if they exist
        const statsElement = document.getElementById('task-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Total Tasks:</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Completed Today:</span>
                    <span class="stat-value">${metrics.completedToday}/${metrics.dailyGoal}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Progress:</span>
                    <span class="stat-value">${Math.round(metrics.progressPercentage)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Overdue:</span>
                    <span class="stat-value overdue">${stats.overdue}</span>
                </div>
            `;
        }
        
        console.log('Task statistics updated:', { stats, metrics });
    } catch (error) {
        console.log('Task statistics update failed:', error);
    }
}

// Add task validation to form submission
validateTaskForm() {
    const taskSettings = {
        defaultPriority: this.getSelectValue('default-priority'),
        defaultSort: this.getSelectValue('default-sort'),
        reminderDays: parseInt(this.getInputValue('reminder-days')),
        dailyGoal: parseInt(this.getInputValue('daily-goal')),
        timeEstimation: this.getInputValue('time-estimation'),
        completionTracking: this.getInputValue('completion-tracking')
    };

    const errors = this.taskModule.validateTaskSettings(taskSettings);
    
    if (errors.length > 0) {
        errors.forEach(error => this.showError(error));
        return false;
    }
    
    return true;
}

// Handle task-specific reset
async handleResetTaskSettings() {
    if (confirm('Are you sure you want to reset task settings to defaults?')) {
        const defaultSettings = this.taskModule.resetSettings();
        this.populateTaskSettings({ tasks: defaultSettings });
        this.showMessage('Task settings reset to defaults', 'info');
    }
}

getTaskModule() {
    return this.taskModule;
}


}
document.addEventListener('DOMContentLoaded', async () => {
    const settingsRenderer = new SettingsRenderer();
    await settingsRenderer.init();
    settingsRenderer.getSettingsCore().setupRealTimeListeners();
    window.settingsRenderer = settingsRenderer;
    window.settingsCore = settingsRenderer.getSettingsCore();
    window.taskModule = settingsRenderer.taskModule
    window.debugSettings = () => settingsRenderer.logCurrentState();
});

