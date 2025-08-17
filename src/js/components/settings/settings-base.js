// ===== 1. Base Settings Class (settings-base.js) =====
export class BaseSettings {
    constructor() {
        this.eventCallbacks = new Map();
        this.isInitialized = false;
    }

    // Shared event system
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => callback(data));
        }
    }

    // Template methods that each feature must implement
    getDefaults() {
        throw new Error('getDefaults() must be implemented by subclass');
    }

    validate(settings) {
        throw new Error('validate() must be implemented by subclass');
    }

    processFormData(formData) {
        throw new Error('processFormData() must be implemented by subclass');
    }
}

// ===== 2. Timer Settings (settings-timer.js) =====
import { BaseSettings } from './settings-base.js';

export const TIMER_SOUND_REGISTRY = {
    bell: { id: 'bell', name: 'Bell', path: '@assets/sounds/bell.wav' },
    chime: { id: 'chime', name: 'Chime', path: '@assets/sounds/chime.wav' },
    gong: { id: 'gong', name: 'Gong', path: '@assets/sounds/gong.wav' },
    tweet: { id: 'tweet', name: 'Tweet', path: '@assets/sounds/tweet.wav' }
};

export class TimerSettings extends BaseSettings {
    constructor() {
        super();
        this.soundRegistry = TIMER_SOUND_REGISTRY;
    }

    getDefaults() {
        return {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            soundEnabled: true,
            volume: 0.8,
            soundType: 'bell',
            customSoundPath: null,
            doNotDisturb: false
        };
    }

    validate(settings) {
        const errors = [];
        
        if (settings.workDuration < 1 || settings.workDuration > 120) {
            errors.push('Work duration must be between 1 and 120 minutes');
        }
        if (settings.shortBreak < 1 || settings.shortBreak > 60) {
            errors.push('Short break must be between 1 and 60 minutes');
        }
        if (settings.longBreak < 1 || settings.longBreak > 120) {
            errors.push('Long break must be between 1 and 120 minutes');
        }
        if (settings.volume < 0 || settings.volume > 1) {
            errors.push('Volume must be between 0 and 1');
        }

        return errors;
    }

    processFormData(formData) {
        return {
            workDuration: Math.max(1, Math.min(120, parseInt(formData.workDuration) || 25)),
            shortBreak: Math.max(1, Math.min(60, parseInt(formData.shortBreak) || 5)),
            longBreak: Math.max(1, Math.min(120, parseInt(formData.longBreak) || 15)),
            soundEnabled: Boolean(formData.soundEnabled),
            volume: Math.max(0, Math.min(1, parseFloat(formData.volume) || 0.8)),
            soundType: formData.soundType || 'bell',
            customSoundPath: formData.customSoundPath || null,
            doNotDisturb: Boolean(formData.doNotDisturb)
        };
    }

    // Timer-specific methods
    updateVolume(volume) {
        const volumeValue = Math.max(0, Math.min(1, parseFloat(volume)));
        
        // Update Electron API
        if (window.electronAPI?.setTimerVolume) {
            window.electronAPI.setTimerVolume(volumeValue);
        }
        
        this.emit('volumeChanged', volumeValue);
        return volumeValue;
    }

    getAvailableSounds() {
        return Object.values(this.soundRegistry);
    }

    async testSound(soundType, volume = 0.8) {
        try {
            const sound = this.soundRegistry[soundType];
            if (!sound) {
                throw new Error(`Sound "${soundType}" not found`);
            }

            const audio = new Audio(sound.path);
            audio.volume = volume;
            await audio.play();
            
            this.emit('soundTestSuccess', { soundType, volume });
            return true;
        } catch (error) {
            console.error('Sound test failed:', error);
            this.emit('soundTestError', error.message);
            return false;
        }
    }

    async selectCustomSound() {
        try {
            const sound = await window.electronAPI.selectCustomSound();
            if (sound) {
                this.emit('customSoundSelected', sound);
                return sound;
            }
            return null;
        } catch (error) {
            console.error('Failed to select custom sound:', error);
            this.emit('error', 'Failed to select custom sound');
            return null;
        }
    }
}

// ===== 3. Tasks Settings (settings-tasks.js) =====
import { BaseSettings } from './settings-base.js';

export class TaskSettings extends BaseSettings {
    getDefaults() {
        return {
            defaultPriority: 'medium',
            defaultSort: 'priority',
            reminderDays: 3,
            dailyGoal: 5,
            timeEstimation: true,
            completionTracking: true
        };
    }

    validate(settings) {
        const errors = [];
        
        if (settings.reminderDays < 0 || settings.reminderDays > 30) {
            errors.push('Reminder days must be between 0 and 30');
        }
        if (settings.dailyGoal < 1 || settings.dailyGoal > 100) {
            errors.push('Daily goal must be between 1 and 100');
        }

        return errors;
    }

    processFormData(formData) {
        return {
            defaultPriority: formData.defaultPriority || 'medium',
            defaultSort: formData.defaultSort || 'priority',
            reminderDays: Math.max(0, Math.min(30, parseInt(formData.reminderDays) || 3)),
            dailyGoal: Math.max(1, Math.min(100, parseInt(formData.dailyGoal) || 5)),
            timeEstimation: Boolean(formData.timeEstimation),
            completionTracking: Boolean(formData.completionTracking)
        };
    }

    // Task-specific methods
    calculateProgress(completedTasks, dailyGoal) {
        return Math.min(100, (completedTasks / dailyGoal) * 100);
    }

    shouldShowReminder(dueDate, reminderDays) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= reminderDays && diffDays >= 0;
    }
}

// ===== 4. Main Settings Coordinator (settings-core.js) =====
import { TimerSettings } from './settings-timer.js';
import { TaskSettings } from './settings-tasks.js';
// import { NotesSettings } from './settings-notes.js';
// import { CalendarSettings } from './settings-calendar.js';

export class SettingsCore {
    constructor() {
        this.settingsModules = {
            timer: new TimerSettings(),
            tasks: new TaskSettings(),
            // notes: new NotesSettings(),
            // calendar: new CalendarSettings()
        };
        
        this.currentSettings = {};
        this.originalSettings = {};
        this.eventCallbacks = new Map();
        this.isInitialized = false;
        this.initPromise = null;

        // Make globally available
        if (typeof window !== 'undefined') {
            window.settingsCore = this;
        }

        this.setupModuleEventForwarding();
    }

    setupModuleEventForwarding() {
        // Forward events from individual modules to main core
        Object.entries(this.settingsModules).forEach(([moduleKey, module]) => {
            module.on('error', (error) => this.emit('error', `${moduleKey}: ${error}`));
            module.on('validationError', (errors) => this.emit('validationError', errors));
            // Add more event forwarding as needed
        });
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        try {
            console.log('🔄 Initializing SettingsCore...');
            
            // Load settings from Electron or defaults
            if (window.electronAPI?.loadSettings) {
                this.currentSettings = await window.electronAPI.loadSettings();
            } else {
                this.currentSettings = this.getDefaultSettings();
            }
            
            this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
            this.isInitialized = true;
            
            this.setupRealTimeListeners();
            this.emit('settingsLoaded', this.currentSettings);
            
            console.log('✅ SettingsCore initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize SettingsCore:', error);
            this.emit('error', 'Failed to load settings');
            return false;
        }
    }

    getDefaultSettings() {
        const defaults = {
            general: {
                launchOnStartup: false,
                defaultWindow: 'Dashboard',
                alwaysOnTop: false,
                minimizeToTray: true,
                autoSaveInterval: '1 minute'
            }
        };

        // Collect defaults from all modules
        Object.entries(this.settingsModules).forEach(([key, module]) => {
            defaults[key] = module.getDefaults();
        });

        return defaults;
    }

    validateSettings(settings) {
        const allErrors = [];

        // Validate each module's settings
        Object.entries(this.settingsModules).forEach(([key, module]) => {
            if (settings[key]) {
                const errors = module.validate(settings[key]);
                allErrors.push(...errors);
            }
        });

        return allErrors;
    }

    processFormData(formData) {
        const processedData = {
            general: {
                launchOnStartup: Boolean(formData.general?.launchOnStartup),
                defaultWindow: formData.general?.defaultWindow || 'timer',
                alwaysOnTop: Boolean(formData.general?.alwaysOnTop),
                minimizeToTray: Boolean(formData.general?.minimizeToTray),
                autoSaveInterval: formData.general?.autoSaveInterval || '30'
            }
        };

        // Process each module's form data
        Object.entries(this.settingsModules).forEach(([key, module]) => {
            if (formData[key]) {
                processedData[key] = module.processFormData(formData[key]);
            }
        });

        return processedData;
    }

    // Delegate specific methods to appropriate modules
    getTimerSettings() {
        return this.settingsModules.timer;
    }

    getTaskSettings() {
        return this.settingsModules.tasks;
    }

    // Event system (same as before)
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => callback(data));
        }
    }

    // Rest of your existing methods (saveSettings, resetSettings, etc.)
    // but now they work with the modular system
}

// ===== 5. Usage Example in settings-renderer.js =====
/*
import { SettingsCore } from '@components/settings-core.js';

class SettingsRenderer {
    constructor() {
        this.settingsCore = new SettingsCore();
        this.timerSettings = this.settingsCore.getTimerSettings();
        this.taskSettings = this.settingsCore.getTaskSettings();
    }

    setupTimerEventListeners() {
        this.timerSettings.on('volumeChanged', (volume) => {
            this.updateVolumeDisplay(volume);
        });
        
        this.timerSettings.on('soundTestSuccess', () => {
            this.showMessage('Sound played successfully!', 'success');
        });
    }

    async handleTestSound() {
        const soundType = document.getElementById('sound-type').value;
        const volume = parseFloat(document.getElementById('timer-volume').value);
        
        await this.timerSettings.testSound(soundType, volume);
    }
}
*/