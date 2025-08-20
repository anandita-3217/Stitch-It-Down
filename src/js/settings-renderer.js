// settings-renderer.js - UI Rendering and Event Handling
import '@css/main.css';
import '@css/components/settings.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import { SettingsCore, SOUND_REGISTRY } from '@components/settings.js';
import { TimerSettings} from '@components/settings/settings-timer.js'
import { setImage, setDailyQuote, setRandomGif, loadAllImages, initTheme, setTheme, toggleTheme, updateDate, updateClock } from '@components/utils.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
class SettingsRenderer {
    constructor() {
        this.settingsCore = new SettingsCore();
        this.timerModule = new TimerSettings();
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
    }

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

        // Volume slider
        // const volumeSlider = document.getElementById('timer-volume');
        // if (volumeSlider) {
        //     volumeSlider.addEventListener('input', (e) => {
        //         this.settingsCore.updateVolume(e.target.value);
        //     });
        // }

        // NEW CODE:
const volumeSlider = document.getElementById('timer-volume');
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        // Try the new way first, fallback to old if it breaks
        try {
            this.timerModule.updateVolume(e.target.value); // NEW way!
            console.log('✅ Using new timer module for volume');
        } catch (error) {
            console.log('❌ New module failed, using old method:', error);
            this.settingsCore.updateVolume(e.target.value); // OLD way as backup
        }
    });
}

        // Form change detection
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

    // Event handlers
    async handleSaveSettings() {
        const formData = this.getFormData();
        await this.settingsCore.saveSettings(formData);
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
            this.settingsCore.testSound(soundType, currentVolume);
        }
    }

    async handleSelectCustomSound() {
        await this.settingsCore.selectCustomSound();
    }

    // UI Population and Updates
    populateUI(settings) {
        // General settings
        this.setInputValue('launch-on-startup', settings.general?.launchOnStartup);
        this.setSelectValue('default-window', settings.general?.defaultWindow);
        this.setInputValue('always-on-top', settings.general?.alwaysOnTop);
        this.setInputValue('minimize-to-tray', settings.general?.minimizeToTray);
        this.setSelectValue('auto-save-interval', settings.general?.autoSaveInterval);

        // Timer settings
        this.setInputValue('work-duration', settings.timer?.workDuration);
        this.setInputValue('short-break', settings.timer?.shortBreak);
        this.setInputValue('long-break', settings.timer?.longBreak);
        this.setInputValue('sound-enabled', settings.timer?.soundEnabled);
        this.setInputValue('timer-volume', settings.timer?.volume);
        this.setSelectValue('sound-type', settings.timer?.soundType);
        this.setInputValue('do-not-disturb', settings.timer?.doNotDisturb);

        // Task settings
        this.setSelectValue('default-priority', settings.tasks?.defaultPriority);
        this.setSelectValue('default-sort', settings.tasks?.defaultSort);
        this.setInputValue('reminder-days', settings.tasks?.reminderDays);
        this.setInputValue('daily-goal', settings.tasks?.dailyGoal);
        this.setInputValue('time-estimation', settings.tasks?.timeEstimation);
        this.setInputValue('completion-tracking', settings.tasks?.completionTracking);

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

    // Sound management UI
    // loadAvailableSounds() {
    //     try {
    //         const sounds = this.settingsCore.getAvailableSounds();
    //         const soundSelect = document.getElementById('sound-type');
            
    //         if (!soundSelect) return;

    //         // Clear existing options except the first one (usually a placeholder)
    //         while (soundSelect.children.length > 1) {
    //             soundSelect.removeChild(soundSelect.lastChild);
    //         }

    //         // Add sound options
    //         sounds.forEach((sound) => {
    //             const option = document.createElement('option');
    //             option.value = sound.id;
    //             option.textContent = sound.name;
    //             soundSelect.appendChild(option);
    //         });

    //         // Set current value
    //         const currentSoundType = this.settingsCore.currentSettings.timer?.soundType || 'bell';
    //         soundSelect.value = currentSoundType;

    //         // Add custom sound option if it exists
    //         if (currentSoundType === 'custom') {
    //             this.addCustomSoundOption();
    //         }

    //     } catch (error) {
    //         console.error('Failed to load sounds:', error);
    //         this.showMessage(`Failed to load sounds: ${error.message}`, 'error');
    //     }
    // }
    loadAvailableSounds() {
    try {
        // NEW: Use the timer module
        const sounds = this.timerModule.getAvailableSounds();
        console.log('✅ Using new timer module for available sounds');
        console.log('🔊 Sounds found:', sounds); // Debug line
        
        const soundSelect = document.getElementById('sound-type');
        
        if (!soundSelect) return;

        // FIXED: Don't clear options, replace them properly
        soundSelect.innerHTML = ''; // Clear ALL options first
        
        // Add sound options
        sounds.forEach((sound) => {
            const option = document.createElement('option');
            option.value = sound.id;
            option.textContent = sound.name;
            soundSelect.appendChild(option);
            console.log('➕ Added sound:', sound.name); // Debug line
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
        try {
            const sounds = this.settingsCore.getAvailableSounds();
            console.log('🔄 Using fallback method');
            // ... rest of the logic with sounds from old method
        } catch (fallbackError) {
            console.error('💥 Even fallback failed:', fallbackError);
        }
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

    // Message and notification system
    showMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

        let messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.className = 'message-container';
            document.body.appendChild(messageContainer);
        }

        // Remove existing messages of the same type
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

        // Auto-remove after 5 seconds
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

    // System diagnostics UI
    checkSystemAudio() {
        this.settingsCore.checkSystemAudio();
    }

    // Public methods for external access
    getSettingsCore() {
        return this.settingsCore;
    }

    getCurrentSettings() {
        return this.settingsCore.getCurrentSettings();
    }

    // Debug methods
    logCurrentState() {
        console.log('Current Settings:', this.settingsCore.getCurrentSettings());
        console.log('Original Settings:', this.settingsCore.getOriginalSettings());
        console.log('Form Data:', this.getFormData());
        console.log('Has Changes:', this.settingsCore.hasUnsavedChanges(this.getFormData()));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const settingsRenderer = new SettingsRenderer();
    await settingsRenderer.init();

    // Setup real-time listeners after initialization
    settingsRenderer.getSettingsCore().setupRealTimeListeners();

    // Make available globally for debugging
    window.settingsRenderer = settingsRenderer;
    window.settingsCore = settingsRenderer.getSettingsCore();
    window.SOUND_REGISTRY = SOUND_REGISTRY;

    // Add debug helper
    window.debugSettings = () => settingsRenderer.logCurrentState();
});

