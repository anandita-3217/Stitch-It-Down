export const TIMER_SOUND_REGISTRY = {
    bell: { id: 'bell', name: 'Bell', path: '../../assets/sounds/bell.wav' },
    chime: { id: 'chime', name: 'Chime', path: '../../assets/sounds/chime.wav' },
    gong: { id: 'gong', name: 'Gong', path: '../../assets/sounds/gong.wav' },
    tweet: { id: 'tweet', name: 'Tweet', path: '../../assets/sounds/tweet.wav' }
};

export class TimerSettings {
    constructor() {
        // Just copy your existing timer methods here
        this.currentSettings = {};
        this.eventCallbacks = new Map(); 
    }
    emit(event,data){
        if(this.eventCallbacks.has(event)){
            this.eventCallbacks.get(event).forEach(callback =>(callback(data)));
        }
        console.log(`Timer event: ${event}`,data);
    }
    on(event,callback){
        if(!this.eventCallbacks.has(event)){
            this.eventCallbacks.set(event,[]);
        }
        this.eventCallbacks.get(event).push(callback);
    }
    // Add this method to TimerSettings class
setCurrentSettings(settings) {
    this.currentSettings = settings;
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
    
        // async testSound(soundType, volume = null) {
        //     try {
        //         const currentVolume = volume !== null ? volume : 
        //             (this.currentSettings.timer?.volume || 0.8);
                
        //         const sound = TIMER_SOUND_REGISTRY[soundType];
        //         if (!sound) {
        //             throw new Error(`Sound "${soundType}" not found`);
        //         }
    
        //         const audio = new Audio(sound.path);
        //         audio.volume = currentVolume;
        //         await audio.play();
                
        //         this.emit('soundTestSuccess', { soundType, volume: currentVolume });
        //         return true;
        //     } catch (error) {
        //         console.error('Sound test failed:', error);
        //         this.emit('soundTestError', error.message);
        //         return false;
        //     }
        // }
        async testSound(soundType, volume = null) {
    try {
        const currentVolume = volume !== null ? volume : 
            (this.currentSettings.timer?.volume || 0.8);
        
        let soundPath;
        
        // Handle custom sounds
        if (soundType === 'custom') {
            soundPath = this.currentSettings.timer?.customSoundPath;
            if (!soundPath) {
                throw new Error('No custom sound file selected');
            }
        } else {
            // Handle built-in sounds
            const sound = TIMER_SOUND_REGISTRY[soundType];
            if (!sound) {
                throw new Error(`Sound "${soundType}" not found`);
            }
            soundPath = sound.path;
        }

        const audio = new Audio(soundPath);
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
            // Audio diagnostics
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
}