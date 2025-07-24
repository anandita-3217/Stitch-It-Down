import PomodoroTimer from '@components/timer.js';
// CSS imports
import '@css/main.css';
import '@css/components/timer.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
// PNG imports
import stitchHappy from '@assets/images/characters/stitch-happy.png';
import stitchIcon from '@assets/images/characters/stitch-icon.png';
import stitchWink from '@assets/images/characters/stitch-wink.png';
import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';
// GIF imports
import stitchClothes from '@assets/gifs/stitch-clothes.gif';
import stitchDancing from '@assets/gifs/stitch-dancing.gif';
import stitchEating from '@assets/gifs/stitch-eating.gif';
import stitchFrustrated from '@assets/gifs/stitch-frustrated.gif';
import stitchHyping from '@assets/gifs/stitch-hyping.gif';
import stitchLove from '@assets/gifs/stitch-love.gif';
import stitchShocked from '@assets/gifs/stitch-shocked.gif';
import stitchSinging from '@assets/gifs/stitch-singing.gif';
import stitchSleeping from '@assets/gifs/stitch-sleeping.gif';
import stitchTantrum from '@assets/gifs/stitch-tantrum.gif';

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

// Create an image registry
const images = {
    characters: {
        happy: stitchHappy,
        icon: stitchIcon,
        wink: stitchWink,
        corner1: stitchCorner1,
        corner2: stitchCorner2
    },
    gifs: {
        clothes: stitchClothes,
        dancing: stitchDancing,
        eating: stitchEating,
        frustrated: stitchFrustrated,
        hyping: stitchHyping,
        love: stitchLove,
        shocked: stitchShocked,
        singing: stitchSinging,
        sleeping: stitchSleeping,
        tantrum: stitchTantrum
    }
};

// Global timer instance for this window
let timerInstance = null;

// Initialize timer when DOM is ready
function initializeTimer() {
    if (timerInstance) {
        // Clean up existing instance
        timerInstance.destroy();
    }
    
    console.log('Initializing Pomodoro Timer...');
    
    try {
        // Pass the images object to the timer constructor
        timerInstance = new PomodoroTimer(images);
        console.log('Timer initialized successfully');
        
        // Make timer available globally for debugging
        window.timer = timerInstance;
        
        return timerInstance;
    } catch (error) {
        console.error('Failed to initialize timer:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Timer Initialization Error</h3>
            <p>Failed to initialize the Pomodoro timer. Please check the console for details.</p>
            <p>Error: ${error.message}</p>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        document.body.appendChild(errorDiv);
        
        return null;
    }
}

// Handle window cleanup
function cleanupTimer() {
    if (timerInstance) {
        console.log('Cleaning up timer...');
        timerInstance.destroy();
        timerInstance = null;
    }
}

// Main initialization function
function initialize() {
    loadAllImages(); // Load all images including random gif
    setDailyQuote();
    initTheme();
    initializeTimer();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

// Cleanup when window is closed
window.addEventListener('beforeunload', cleanupTimer);

// Handle window focus/blur for better performance
window.addEventListener('focus', () => {
    console.log('Timer window focused');
    if (timerInstance && timerInstance.isRunning) {
        // Resume any animations or updates
        timerInstance.updateDisplay();
    }
});

window.addEventListener('blur', () => {
    console.log('Timer window blurred');
    // Timer continues running in background
});

// Export for potential use by other modules
export { initializeTimer, cleanupTimer };

// Debug helpers
if (process.env.NODE_ENV === 'development') {
    window.debugTimer = {
        getInstance: () => timerInstance,
        reinitialize: initializeTimer,
        cleanup: cleanupTimer,
        setRandomGif: setRandomGif,
        loadAllImages: loadAllImages
    };
}


// class TimerApp {
//   constructor() {
//     this.settings = {};
//     this.isRunning = false;
//     this.timeRemaining = 0;
//     this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
//     this.sessionCount = 0;
//     this.audioContext = null;
//     this.currentAudio = null;
    
//     this.init();
//   }

//   async init() {
//     await this.loadSettings();
//     this.setupUI();
//     this.setupSettingsListener();
//     this.initializeAudio();
//   }

//   async loadSettings() {
//     try {
//       this.settings = await window.electronAPI.loadSettings();
//       this.applySettings();
//     } catch (error) {
//       console.error('Failed to load settings:', error);
//       // Use default settings
//       this.settings = {
//         timer: {
//           workDuration: 25,
//           shortBreak: 5,
//           longBreak: 15,
//           soundEnabled: true,
//           volume: 0.8,
//           soundType: 'bell',
//           customSoundPath: null,
//           doNotDisturb: false
//         }
//       };
//     }
//   }

//   setupSettingsListener() {
//     // Listen for settings updates from the settings page
//     const cleanup = window.electronAPI.onSettingsUpdated((event, newSettings) => {
//       console.log('Settings updated:', newSettings);
//       this.settings = newSettings;
//       this.applySettings();
//       this.updateUI();
//     });

//     // Listen for timer-specific settings updates
//     const timerCleanup = window.electronAPI.onTimerEvent((event, data) => {
//       if (data.type === 'settings-updated') {
//         this.settings.timer = { ...this.settings.timer, ...data.settings };
//         this.applySettings();
//         this.updateUI();
//       }
//     });

//     // Store cleanup functions for when window closes
//     window.addEventListener('beforeunload', () => {
//       cleanup();
//       timerCleanup();
//     });
//   }

//   applySettings() {
//     const timerSettings = this.settings.timer;
    
//     // Update timer durations if not currently running
//     if (!this.isRunning) {
//       this.setSessionDuration();
//     }
    
//     // Update volume for audio elements
//     if (this.currentAudio) {
//       this.currentAudio.volume = timerSettings.volume;
//     }
    
//     // Apply Do Not Disturb settings
//     if (timerSettings.doNotDisturb && this.isRunning && this.currentSession === 'work') {
//       this.enableDoNotDisturb();
//     } else {
//       this.disableDoNotDisturb();
//     }
//   }

//   setSessionDuration() {
//     const timerSettings = this.settings.timer;
    
//     switch (this.currentSession) {
//       case 'work':
//         this.timeRemaining = timerSettings.workDuration * 60;
//         break;
//       case 'shortBreak':
//         this.timeRemaining = timerSettings.shortBreak * 60;
//         break;
//       case 'longBreak':
//         this.timeRemaining = timerSettings.longBreak * 60;
//         break;
//     }
    
//     this.updateDisplay();
//   }

//   setupUI() {
//     // Setup timer display and controls
//     this.createTimerElements();
//     this.setupEventListeners();
//     this.updateUI();
//   }

//   createTimerElements() {
//     const container = document.querySelector('.timer-container') || document.body;
    
//     container.innerHTML = `
//       <div class="timer-display">
//         <div class="time-remaining">25:00</div>
//         <div class="session-type">Work Session</div>
//         <div class="session-counter">Session 1 of 4</div>
//       </div>
      
//       <div class="timer-controls">
//         <button class="timer-btn start-btn">Start</button>
//         <button class="timer-btn pause-btn" disabled>Pause</button>
//         <button class="timer-btn reset-btn">Reset</button>
//         <button class="timer-btn skip-btn">Skip</button>
//       </div>
      
//       <div class="timer-settings-quick">
//         <div class="volume-control">
//           <label>Volume: <span class="volume-display">${Math.round(this.settings.timer?.volume * 100 || 80)}%</span></label>
//           <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="${this.settings.timer?.volume || 0.8}">
//         </div>
        
//         <div class="sound-test">
//           <button class="test-sound-btn">Test Sound</button>
//         </div>
//       </div>
//     `;
//   }

//   setupEventListeners() {
//     // Timer control buttons
//     document.querySelector('.start-btn')?.addEventListener('click', () => this.startTimer());
//     document.querySelector('.pause-btn')?.addEventListener('click', () => this.pauseTimer());
//     document.querySelector('.reset-btn')?.addEventListener('click', () => this.resetTimer());
//     document.querySelector('.skip-btn')?.addEventListener('click', () => this.skipSession());
    
//     // Volume control in timer
//     const volumeSlider = document.querySelector('.volume-slider');
//     if (volumeSlider) {
//       volumeSlider.addEventListener('input', async (e) => {
//         const volume = parseFloat(e.target.value);
//         await this.updateVolume(volume);
//       });
//     }
    
//     // Test sound button
//     document.querySelector('.test-sound-btn')?.addEventListener('click', () => this.testSound());
//   }

//   async updateVolume(volume) {
//     try {
//       await window.electronAPI.setTimerVolume(volume);
      
//       // Update local audio volume immediately
//       if (this.currentAudio) {
//         this.currentAudio.volume = volume;
//       }
      
//       // Update display
//       const volumeDisplay = document.querySelector('.volume-display');
//       if (volumeDisplay) {
//         volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
//       }
      
//       // Update local settings
//       this.settings.timer.volume = volume;
      
//     } catch (error) {
//       console.error('Failed to update volume:', error);
//     }
//   }

//   updateUI() {
//     // Update timer display
//     this.updateDisplay();
    
//     // Update volume display
//     const volumeSlider = document.querySelector('.volume-slider');
//     const volumeDisplay = document.querySelector('.volume-display');
    
//     if (volumeSlider && this.settings.timer) {
//       volumeSlider.value = this.settings.timer.volume;
//     }
    
//     if (volumeDisplay && this.settings.timer) {
//       volumeDisplay.textContent = `${Math.round(this.settings.timer.volume * 100)}%`;
//     }
    
//     // Update session type display
//     const sessionTypeElement = document.querySelector('.session-type');
//     if (sessionTypeElement) {
//       const sessionNames = {
//         work: 'Work Session',
//         shortBreak: 'Short Break',
//         longBreak: 'Long Break'
//       };
//       sessionTypeElement.textContent = sessionNames[this.currentSession] || 'Work Session';
//     }
    
//     // Update session counter
//     const sessionCounterElement = document.querySelector('.session-counter');
//     if (sessionCounterElement) {
//       sessionCounterElement.textContent = `Session ${this.sessionCount + 1} of 4`;
//     }
//   }

//   updateDisplay() {
//     const minutes = Math.floor(this.timeRemaining / 60);
//     const seconds = this.timeRemaining % 60;
//     const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
//     const timeDisplay = document.querySelector('.time-remaining');
//     if (timeDisplay) {
//       timeDisplay.textContent = timeString;
//     }
    
//     // Update document title
//     document.title = `${timeString} - Stitch-It-Down Timer`;
//   }

//   async initializeAudio() {
//     try {
//       // Load available sounds
//       this.availableSounds = await window.electronAPI.getAvailableSounds();
//     } catch (error) {
//       console.error('Failed to load available sounds:', error);
//       this.availableSounds = [];
//     }
//   }

//   async playNotificationSound() {
//     if (!this.settings.timer?.soundEnabled) {
//       return;
//     }

//     try {
//       const soundType = this.settings.timer.soundType || 'bell';
//       const customPath = this.settings.timer.customSoundPath;
      
//       let soundPath;
//       if (soundType === 'custom' && customPath) {
//         soundPath = customPath;
//       } else {
//         const sound = this.availableSounds.find(s => s.id === soundType);
//         soundPath = sound?.path;
//       }
      
//       if (soundPath) {
//         // Play sound through the main process
//         await window.electronAPI.playTestSound(soundPath);
        
//         // Also create local audio element for immediate feedback
//         const audio = new Audio(soundPath);
//         audio.volume = this.settings.timer.volume || 0.8;
//         audio.play().catch(console.error);
        
//         this.currentAudio = audio;
//       }
//     } catch (error) {
//       console.error('Failed to play notification sound:', error);
//     }
//   }

//   async testSound() {
//     await this.playNotificationSound();
//   }

//   startTimer() {
//     if (this.isRunning) return;
    
//     this.isRunning = true;
//     this.updateControlButtons();
    
//     this.timerInterval = setInterval(() => {
//       this.timeRemaining--;
//       this.updateDisplay();
      
//       if (this.timeRemaining <= 0) {
//         this.completeSession();
//       }
//     }, 1000);
    
//     // Apply Do Not Disturb if enabled and it's a work session
//     if (this.settings.timer?.doNotDisturb && this.currentSession === 'work') {
//       this.enableDoNotDisturb();
//     }
//   }

//   pauseTimer() {
//     if (!this.isRunning) return;
    
//     this.isRunning = false;
//     clearInterval(this.timerInterval);
//     this.updateControlButtons();
    
//     // Disable Do Not Disturb when paused
//     this.disableDoNotDisturb();
//   }

//   resetTimer() {
//     this.isRunning = false;
//     clearInterval(this.timerInterval);
//     this.setSessionDuration();
//     this.updateControlButtons();
//     this.disableDoNotDisturb();
//   }

//   skipSession() {
//     this.completeSession();
//   }

//   async completeSession() {
//     this.isRunning = false;
//     clearInterval(this.timerInterval);
    
//     // Play completion sound
//     await this.playNotificationSound();
    
//     // Show notification
//     await window.electronAPI.showNotification({
//       title: 'Timer Complete!',
//       body: `${this.currentSession === 'work' ? 'Work session' : 'Break'} completed!`,
//       icon: '../assets/images/characters/stitch-icon.png'
//     });
    
//     // Move to next session
//     this.nextSession();
//     this.updateControlButtons();
//     this.disableDoNotDisturb();
//   }

//   nextSession() {
//     if (this.currentSession === 'work') {
//       this.sessionCount++;
      
//       // Every 4th work session gets a long break
//       if (this.sessionCount % 4 === 0) {
//         this.currentSession = 'longBreak';
//       } else {
//         this.currentSession = 'shortBreak';
//       }
//     } else {
//       // After any break, return to work
//       this.currentSession = 'work';
//     }
    
//     this.setSessionDuration();
//     this.updateUI();
//   }

//   updateControlButtons() {
//     const startBtn = document.querySelector('.start-btn');
//     const pauseBtn = document.querySelector('.pause-btn');
//     const resetBtn = document.querySelector('.reset-btn');
    
//     if (startBtn && pauseBtn && resetBtn) {
//       startBtn.disabled = this.isRunning;
//       pauseBtn.disabled = !this.isRunning;
//       resetBtn.disabled = false;
//     }
//   }

//   async enableDoNotDisturb() {
//     try {
//       // This would integrate with the system's Do Not Disturb
//       console.log('Do Not Disturb enabled');
      
//       // You could also block certain websites here if that feature is implemented
//       // await window.electronAPI.enableWebsiteBlocking();
      
//     } catch (error) {
//       console.error('Failed to enable Do Not Disturb:', error);
//     }
//   }

//   async disableDoNotDisturb() {
//     try {
//       console.log('Do Not Disturb disabled');
      
//       // await window.electronAPI.disableWebsiteBlocking();
      
//     } catch (error) {
//       console.error('Failed to disable Do Not Disturb:', error);
//     }
//   }
// }

// // Initialize the timer app when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   new TimerApp();
// });