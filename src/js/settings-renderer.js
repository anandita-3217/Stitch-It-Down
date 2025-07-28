import bellSound from '@assets/sounds/bell.wav';
import chimeSound from '@assets/sounds/chime.wav';
import gongSound from '@assets/sounds/gong.wav';
import tweetSound from '@assets/sounds/tweet.wav';
// Import both formats if you have them
import bellSoundMp3 from '@/assets/sounds/bell.mp3';
import '@css/main.css';
import '@css/components/settings.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import '@components/settings.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
const SOUND_REGISTRY = {
    bell: {
        id: 'bell',
        name: 'Bell',
        path: bellSound 
    },
    chime: {
        id: 'chime',
        name: 'Chime',
        path: chimeSound
    },
    gong: {
        id: 'gong',
        name: 'Gong',
        path: gongSound
    },
    tweet: {
        id: 'tweet',
        name: 'Tweet',
        path: tweetSound
    }
};
class SettingsManager {
    constructor() {
        this.currentSettings = {};
        this.originalSettings = {};
        this.init();
    }

    async init() {
        try {
            await this.initializeUIComponents();
            this.currentSettings = await window.electronAPI.loadSettings();
            this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
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
    setupEventListeners() {
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
        const cancelBtn = document.getElementById('cancel-settings');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelSettings());
        }
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }
        const testSoundBtn = document.getElementById('test-sound');
        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', () => this.testSound());
        }
        const customSoundBtn = document.getElementById('select-custom-sound');
        if (customSoundBtn) {
            customSoundBtn.addEventListener('click', () => this.selectCustomSound());
        }
        const volumeSlider = document.getElementById('timer-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.updateVolume(e.target.value);
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
    setupRealTimeListeners() {
        window.electronAPI.onSettingsUpdated((event, updatedSettings) => {
            this.currentSettings = updatedSettings;
            this.populateUI();
            this.showMessage('Settings updated from another window', 'info');
        });
        window.electronAPI.onTimerEvent((event, data) => {
            console.log('Timer event received:', data);
        });
    }
    populateUI() {
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
        const sounds = Object.values(SOUND_REGISTRY);
        const soundSelect = document.getElementById('sound-type');
        while (soundSelect.children.length > 1) {
            soundSelect.removeChild(soundSelect.lastChild);
        }        
        sounds.forEach((sound) => {
            const option = document.createElement('option');
            option.value = sound.id;
            option.textContent = sound.name;
            soundSelect.appendChild(option);
        });
        soundSelect.value = this.currentSettings.timer?.soundType || 'bell';
        
    } catch (error) {
        console.error('Failed to load sounds:', error);
        this.showMessage(`Failed to load sounds: ${error.message}`, 'error');
    }
}
    updateVolume(volume) {
        const volumeValue = parseFloat(volume);
        if (!this.currentSettings.timer) {
            this.currentSettings.timer = {};
        }
        this.currentSettings.timer.volume = volumeValue;
        this.updateVolumeDisplay();
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
        const soundSelect = document.getElementById('sound-type');
        const soundType = soundSelect.value || 'bell';
        const currentVolume = parseFloat(document.getElementById('timer-volume')?.value || 0.8);
        const sound = SOUND_REGISTRY[soundType];
        if (!sound) {
            throw new Error(`Sound "${soundType}" not found`);
        }
        console.log('Playing imported sound:', sound.path);
        const audio = new Audio(sound.path);
        audio.volume = currentVolume;
        await audio.play();
        this.showMessage('✅ Imported sound played successfully!', 'success');
        
    } catch (error) {
        console.error('Sound test failed:', error);
        this.showMessage(`Sound test failed: ${error.message}`, 'error');
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
    handleWindowFocus() {
        this.init();
    }
    handleWindowBlur() {
        if (this.hasUnsavedChanges()) {
        }
    }
checkSystemAudio() {
    console.log('=== SYSTEM AUDIO CHECK ===');
    if (navigator.permissions) {
        navigator.permissions.query({name: 'microphone'}).then(result => {
            console.log('Microphone permission:', result.state);
        }).catch(e => console.log('Could not check microphone permission:', e.message));
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const testContext = new AudioContext();
        console.log('Audio context state:', testContext.state);
        console.log('Audio context sample rate:', testContext.sampleRate);
        console.log('Audio context destination:', testContext.destination);
        testContext.close();
    }
    const volumeSlider = document.getElementById('timer-volume');
    const volumeDisplay = document.getElementById('volume-display');    
    console.log('Volume slider value:', volumeSlider?.value);
    console.log('Volume display text:', volumeDisplay?.textContent);
    const soundEnabled = document.getElementById('sound-enabled');
    console.log('Sound enabled:', soundEnabled?.checked);    
    this.showMessage('System audio check completed - see console for details', 'info');
}
}
document.addEventListener('DOMContentLoaded', async () => {
    const settingsManager = new SettingsManager();
    window.electronAPI.onWindowFocus(() => {
        settingsManager.handleWindowFocus();
    });
    window.electronAPI.onWindowBlur(() => {
        settingsManager.handleWindowBlur();
    });
    window.addEventListener('beforeunload', (e) => {
        if (settingsManager.hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    window.settingsManager = settingsManager;
    window.SOUND_REGISTRY = SOUND_REGISTRY;
});