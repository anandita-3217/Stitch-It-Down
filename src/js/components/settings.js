// settings.js - Core Settings Logic
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';
import bellSound from '@assets/sounds/bell.wav';
import chimeSound from '@assets/sounds/chime.wav';
import gongSound from '@assets/sounds/gong.wav';
import tweetSound from '@assets/sounds/tweet.wav';

export const SOUND_REGISTRY = {
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

export class SettingsCore {
    constructor() {
        this.currentSettings = {};
        this.originalSettings = {};
        this.eventCallbacks = new Map();
    }

    // Event system for communication with renderer
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

    async init() {
        try {
            this.currentSettings = await window.electronAPI.loadSettings();
            this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
            
            this.emit('settingsLoaded', this.currentSettings);
            console.log('Settings loaded:', this.currentSettings);
            return true;
        } catch (error) {
            console.error('Failed to initialize settings:', error);
            this.emit('error', 'Failed to load settings');
            return false;
        }
    }

    // Settings validation
    validateSettings(settings) {
        const errors = [];

        // Timer validation
        if (settings.timer) {
            if (settings.timer.workDuration < 1 || settings.timer.workDuration > 120) {
                errors.push('Work duration must be between 1 and 120 minutes');
            }
            if (settings.timer.shortBreak < 1 || settings.timer.shortBreak > 60) {
                errors.push('Short break must be between 1 and 60 minutes');
            }
            if (settings.timer.longBreak < 1 || settings.timer.longBreak > 120) {
                errors.push('Long break must be between 1 and 120 minutes');
            }
            if (settings.timer.volume < 0 || settings.timer.volume > 1) {
                errors.push('Volume must be between 0 and 1');
            }
        }

        // Tasks validation
        if (settings.tasks) {
            if (settings.tasks.reminderDays < 0 || settings.tasks.reminderDays > 30) {
                errors.push('Reminder days must be between 0 and 30');
            }
            if (settings.tasks.dailyGoal < 1 || settings.tasks.dailyGoal > 100) {
                errors.push('Daily goal must be between 1 and 100');
            }
        }

        // Notes validation
        if (settings.notes) {
            if (settings.notes.fontSize < 8 || settings.notes.fontSize > 72) {
                errors.push('Font size must be between 8 and 72');
            }
        }

        return errors;
    }

    // Data transformation and processing
    processFormData(formData) {
        const processedData = {
            general: {
                launchOnStartup: Boolean(formData.general?.launchOnStartup),
                defaultWindow: formData.general?.defaultWindow || 'timer',
                alwaysOnTop: Boolean(formData.general?.alwaysOnTop),
                minimizeToTray: Boolean(formData.general?.minimizeToTray),
                autoSaveInterval: formData.general?.autoSaveInterval || '30'
            },
            timer: {
                workDuration: Math.max(1, Math.min(120, parseInt(formData.timer?.workDuration) || 25)),
                shortBreak: Math.max(1, Math.min(60, parseInt(formData.timer?.shortBreak) || 5)),
                longBreak: Math.max(1, Math.min(120, parseInt(formData.timer?.longBreak) || 15)),
                soundEnabled: Boolean(formData.timer?.soundEnabled),
                volume: Math.max(0, Math.min(1, parseFloat(formData.timer?.volume) || 0.8)),
                soundType: formData.timer?.soundType || 'bell',
                customSoundPath: formData.timer?.customSoundPath || null,
                doNotDisturb: Boolean(formData.timer?.doNotDisturb)
            },
            tasks: {
                defaultPriority: formData.tasks?.defaultPriority || 'medium',
                defaultSort: formData.tasks?.defaultSort || 'priority',
                reminderDays: Math.max(0, Math.min(30, parseInt(formData.tasks?.reminderDays) || 3)),
                dailyGoal: Math.max(1, Math.min(100, parseInt(formData.tasks?.dailyGoal) || 5)),
                timeEstimation: Boolean(formData.tasks?.timeEstimation),
                completionTracking: Boolean(formData.tasks?.completionTracking)
            },
            notes: {
                defaultFont: formData.notes?.defaultFont || 'Arial',
                fontSize: Math.max(8, Math.min(72, parseInt(formData.notes?.fontSize) || 14)),
                markdownEnabled: Boolean(formData.notes?.markdownEnabled),
                spellCheck: Boolean(formData.notes?.spellCheck),
                autoSave: Boolean(formData.notes?.autoSave)
            },
            calendar: {
                defaultView: formData.calendar?.defaultView || 'month',
                weekStartsOn: formData.calendar?.weekStartsOn || 'sunday',
                timeFormat: formData.calendar?.timeFormat || '12',
                defaultEventDuration: formData.calendar?.defaultEventDuration || '60',
                defaultReminder: formData.calendar?.defaultReminder || '15'
            },
            integration: {
                linkTasksToCalendar: Boolean(formData.integration?.linkTasksToCalendar),
                timerIntegration: Boolean(formData.integration?.timerIntegration),
                noteLinking: Boolean(formData.integration?.noteLinking)
            },
            accessibility: {
                highContrast: Boolean(formData.accessibility?.highContrast),
                fontScaling: formData.accessibility?.fontScaling || '100',
                keyboardShortcuts: Boolean(formData.accessibility?.keyboardShortcuts)
            },
            advanced: {
                hardwareAcceleration: Boolean(formData.advanced?.hardwareAcceleration),
                memoryManagement: Boolean(formData.advanced?.memoryManagement),
                dataEncryption: Boolean(formData.advanced?.dataEncryption),
                analytics: Boolean(formData.advanced?.analytics),
                crashReporting: Boolean(formData.advanced?.crashReporting)
            }
        };

        return processedData;
    }

    // Volume management
    updateVolume(volume) {
        const volumeValue = Math.max(0, Math.min(1, parseFloat(volume)));
        
        if (!this.currentSettings.timer) {
            this.currentSettings.timer = {};
        }
        
        this.currentSettings.timer.volume = volumeValue;
        
        // Update Electron API
        if (window.electronAPI?.setTimerVolume) {
            window.electronAPI.setTimerVolume(volumeValue);
        }
        
        this.emit('volumeChanged', volumeValue);
        return volumeValue;
    }

    // Sound management
    getAvailableSounds() {
        return Object.values(SOUND_REGISTRY);
    }

    async testSound(soundType, volume = null) {
        try {
            const currentVolume = volume !== null ? volume : 
                (this.currentSettings.timer?.volume || 0.8);
            
            const sound = SOUND_REGISTRY[soundType];
            if (!sound) {
                throw new Error(`Sound "${soundType}" not found`);
            }

            const audio = new Audio(sound.path);
            audio.volume = currentVolume;
            await audio.play();
            
            this.emit('soundTestSuccess', { soundType, volume: currentVolume });
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
                if (!this.currentSettings.timer) {
                    this.currentSettings.timer = {};
                }
                
                this.currentSettings.timer.customSoundPath = sound.path;
                this.currentSettings.timer.soundType = 'custom';
                
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

    // Change detection
    hasUnsavedChanges(formData) {
        const processedFormData = this.processFormData(formData);
        return JSON.stringify(processedFormData) !== JSON.stringify(this.originalSettings);
    }

    // Save settings
    async saveSettings(formData) {
        try {
            const processedData = this.processFormData(formData);
            
            // Validate settings
            const validationErrors = this.validateSettings(processedData);
            if (validationErrors.length > 0) {
                this.emit('validationError', validationErrors);
                return false;
            }

            const success = await window.electronAPI.saveSettings(processedData);
            
            if (success) {
                this.currentSettings = processedData;
                this.originalSettings = JSON.parse(JSON.stringify(processedData));
                
                this.emit('settingsSaved', processedData);
                await this.broadcastSettingsUpdates(processedData);
                return true;
            } else {
                this.emit('error', 'Failed to save settings');
                return false;
            }
        } catch (error) {
            console.error('Save settings error:', error);
            this.emit('error', 'Failed to save settings');
            return false;
        }
    }

    async broadcastSettingsUpdates(settings) {
        try {
            const broadcasts = [];
            
            if (settings.timer && window.electronAPI.updateTimerSettings) {
                broadcasts.push(window.electronAPI.updateTimerSettings(settings.timer));
            }
            if (settings.tasks && window.electronAPI.updateTaskSettings) {
                broadcasts.push(window.electronAPI.updateTaskSettings(settings.tasks));
            }
            if (settings.notes && window.electronAPI.updateNotesSettings) {
                broadcasts.push(window.electronAPI.updateNotesSettings(settings.notes));
            }
            if (settings.calendar && window.electronAPI.updateCalendarSettings) {
                broadcasts.push(window.electronAPI.updateCalendarSettings(settings.calendar));
            }

            await Promise.all(broadcasts);
            this.emit('settingsBroadcast', settings);
        } catch (error) {
            console.error('Failed to broadcast settings updates:', error);
            this.emit('error', 'Failed to broadcast settings updates');
        }
    }

    // Reset settings
    async resetSettings() {
        try {
            const success = await window.electronAPI.resetSettings();
            if (success) {
                this.currentSettings = await window.electronAPI.loadSettings();
                this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
                
                this.emit('settingsReset', this.currentSettings);
                return true;
            } else {
                this.emit('error', 'Failed to reset settings');
                return false;
            }
        } catch (error) {
            console.error('Reset settings error:', error);
            this.emit('error', 'Failed to reset settings');
            return false;
        }
    }

    // Cancel changes
    cancelSettings() {
        this.currentSettings = JSON.parse(JSON.stringify(this.originalSettings));
        this.emit('settingsCancelled', this.currentSettings);
    }

    // Data export/import
    async exportData() {
        try {
            const result = await window.electronAPI.exportData();
            if (result.success) {
                this.emit('dataExported', result.path);
                return result;
            } else if (!result.cancelled) {
                this.emit('error', 'Failed to export data');
            }
            return result;
        } catch (error) {
            console.error('Export error:', error);
            this.emit('error', 'Failed to export data');
            return { success: false, error: error.message };
        }
    }

    async importData() {
        try {
            const result = await window.electronAPI.importData();
            if (result.success) {
                this.currentSettings = await window.electronAPI.loadSettings();
                this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
                
                this.emit('dataImported', this.currentSettings);
                return result;
            } else if (!result.cancelled) {
                this.emit('error', result.error || 'Failed to import data');
            }
            return result;
        } catch (error) {
            console.error('Import error:', error);
            this.emit('error', 'Failed to import data');
            return { success: false, error: error.message };
        }
    }
    checkSystemAudio() {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            permissions: {},
            audioContext: {},
            currentSettings: {}
        };
        if (navigator.permissions) {
            navigator.permissions.query({name: 'microphone'}).then(result => {
                diagnostics.permissions.microphone = result.state;
            }).catch(e => {
                diagnostics.permissions.microphone = 'unavailable';
            });
        }
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            try {
                const testContext = new AudioContext();
                diagnostics.audioContext = {
                    state: testContext.state,
                    sampleRate: testContext.sampleRate,
                    hasDestination: !!testContext.destination
                };
                testContext.close();
            } catch (e) {
                diagnostics.audioContext.error = e.message;
            }
        }
        diagnostics.currentSettings = {
            volume: this.currentSettings.timer?.volume,
            soundEnabled: this.currentSettings.timer?.soundEnabled,
            soundType: this.currentSettings.timer?.soundType
        };
        this.emit('systemAudioCheck', diagnostics);
        return diagnostics;
    }
    // Getters for current state
    getCurrentSettings() {
        return { ...this.currentSettings };
    }
    getOriginalSettings() {
        return { ...this.originalSettings };
    }
    // Settings change listeners
    setupRealTimeListeners() {
        if (window.electronAPI?.onSettingsUpdated) {
            window.electronAPI.onSettingsUpdated((event, updatedSettings) => {
                this.currentSettings = updatedSettings;
                this.emit('settingsUpdatedFromExternal', updatedSettings);
            });
        }

        if (window.electronAPI?.onTimerEvent) {
            window.electronAPI.onTimerEvent((event, data) => {
                this.emit('timerEvent', data);
            });
        }
    }
}