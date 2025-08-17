export const TIMER_SOUND_REGISTRY = {
    bell: { id: 'bell', name: 'Bell', path: '@assets/sounds/bell.wav' },
    chime: { id: 'chime', name: 'Chime', path: '@assets/sounds/chime.wav' },
    gong: { id: 'gong', name: 'Gong', path: '@assets/sounds/gong.wav' },
    tweet: { id: 'tweet', name: 'Tweet', path: '@assets/sounds/tweet.wav' }
};

export class TimerSettings {
    constructor() {
        // Just copy your existing timer methods here
        this.currentSettings = {};
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
            return Object.values(TIMER_SOUND_REGISTRY);
        }
    
        async testSound(soundType, volume = null) {
            try {
                const currentVolume = volume !== null ? volume : 
                    (this.currentSettings.timer?.volume || 0.8);
                
                const sound = TIMER_SOUND_REGISTRY[soundType];
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

}