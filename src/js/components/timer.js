// class PomodoroTimer {
//     constructor() {
//         this.currentTime = 25 * 60; // 25 minutes in seconds
//         this.totalTime = 25 * 60;
//         this.isRunning = false;
//         this.currentSession = 'work';
//         this.sessionCount = 1;
//         this.totalSessions = 0;
//         this.settings = {
//             work: 25,
//             shortBreak: 5,
//             longBreak: 15,
//             autoStart: false,
//             soundNotifications: true
//         };
        
//         this.stitchQuotes = {
//             work: [
//                 "Let's get productive!",
//                 "Focus time, ohana!",
//                 "You can do this!",
//                 "Stay strong!",
//                 "Keep going!"
//             ],
//             break: [
//                 "Time to relax!",
//                 "Take a breather!",
//                 "You deserve this break!",
//                 "Recharge time!",
//                 "Rest up, buddy!"
//             ],
//             complete: [
//                 "Great job!",
//                 "You did amazing!",
//                 "Proud of you!",
//                 "Mission accomplished!",
//                 "You're the best!"
//             ]
//         };
        
//         this.init();
//     }
    
//     init() {
//         this.bindElements();
//         this.bindEvents();
//         this.loadSettings();
//         this.updateDisplay();
//         this.updateStats();
//     }
    
//     bindElements() {
//         // Timer elements
//         this.timeDisplay = document.getElementById('timeDisplay');
//         this.sessionType = document.getElementById('sessionType');
//         this.motivationText = document.getElementById('motivationText');
//         this.sessionCountEl = document.getElementById('sessionCount');
        
//         // Progress ring
//         this.progressRing = document.querySelector('.progress-ring-progress');
//         this.circumference = 2 * Math.PI * 130; // radius = 130
//         this.progressRing.style.strokeDasharray = this.circumference;
        
//         // Controls
//         this.startPauseBtn = document.getElementById('startPauseBtn');
//         this.resetBtn = document.getElementById('resetBtn');
//         this.skipBtn = document.getElementById('skipBtn');
        
//         // Session buttons
//         this.sessionBtns = document.querySelectorAll('.session-btn');
        
//         // Stitch elements
//         this.stitchImg = document.getElementById('stitchTimer');
//         this.stitchSpeech = document.getElementById('stitchSpeech');
        
//         // Settings
//         this.settingsPanel = document.getElementById('settingsPanel');
//         this.settingsToggle = document.getElementById('settingsToggle');
//         this.closeSettings = document.getElementById('closeSettings');
        
//         // Stats
//         this.todayPomodoros = document.getElementById('todayPomodoros');
//         this.totalTime = document.getElementById('totalTime');
//         this.streak = document.getElementById('streak');
        
//         // Timer container
//         this.timerContainer = document.querySelector('.timer-container');
//     }
    
//     bindEvents() {
//         this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
//         this.resetBtn.addEventListener('click', () => this.resetTimer());
//         this.skipBtn.addEventListener('click', () => this.skipSession());
        
//         this.sessionBtns.forEach(btn => {
//             btn.addEventListener('click', (e) => this.switchSession(e));
//         });
        
//         this.settingsToggle.addEventListener('click', () => this.toggleSettings());
//         this.closeSettings.addEventListener('click', () => this.toggleSettings());
        
//         // Settings inputs
//         document.getElementById('workDuration').addEventListener('input', (e) => {
//             this.settings.work = parseInt(e.target.value);
//             document.getElementById('workValue').textContent = e.target.value;
//             if (this.currentSession === 'work') this.resetTimer();
//         });
        
//         // Keyboard shortcuts
//         document.addEventListener('keydown', (e) => {
//             if (e.code === 'Space' && !e.target.matches('input')) {
//                 e.preventDefault();
//                 this.toggleTimer();
//             }
//         });
//     }
    
//     toggleTimer() {
//         if (this.isRunning) {
//             this.pauseTimer();
//         } else {
//             this.startTimer();
//         }
//     }
    
//     startTimer() {
//         this.isRunning = true;
//         this.timerContainer.classList.add('running');
//         this.startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
//         this.startPauseBtn.classList.remove('pulse');
        
//         this.updateStitchState('working');
        
//         this.interval = setInterval(() => {
//             this.currentTime--;
//             this.updateDisplay();
//             this.updateProgress();
            
//             if (this.currentTime <= 0) {
//                 this.completeSession();
//             }
//         }, 1000);
//     }
    
//     pauseTimer() {
//         this.isRunning = false;
//         this.timerContainer.classList.remove('running');
//         this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
//         this.startPauseBtn.classList.add('pulse');
//         clearInterval(this.interval);
        
//         this.updateStitchState('paused');
//     }
    
//     resetTimer() {
//         this.pauseTimer();
//         this.currentTime = this.settings[this.getSessionKey()] * 60;
//         this.totalTime = this.currentTime;
//         this.updateDisplay();
//         this.updateProgress();
        
//         this.updateStitchState('ready');
//     }
    
//     skipSession() {
//         this.completeSession();
//     }
    
//     completeSession() {
//         this.pauseTimer();
        
//         if (this.settings.soundNotifications) {
//             this.playNotificationSound();
//         }
        
//         this.updateStats();
//         this.updateStitchState('complete');
        
//         // Auto-switch to next session
//         setTimeout(() => {
//             this.switchToNextSession();
//         }, 2000);
//     }
    
//     switchToNextSession() {
//         if (this.currentSession === 'work') {
//             this.sessionCount++;
            
//             if (this.sessionCount % 4 === 0) {
//                 this.switchSession({ target: { dataset: { type: 'long', duration: '15' } } });
//             } else {
//                 this.switchSession({ target: { dataset: { type: 'short', duration: '5' } } });
//             }
//         } else {
//             this.switchSession({ target: { dataset: { type: 'work', duration: '25' } } });
//         }
        
//         if (this.settings.autoStart) {
//             setTimeout(() => this.startTimer(), 1000);
//         }
//     }
    
//     switchSession(e) {
//         const type = e.target.dataset.type;
//         const duration = parseInt(e.target.dataset.duration);
        
//         this.currentSession = type;
//         this.currentTime = duration * 60;
//         this.totalTime = this.currentTime;
        
//         // Update active button
//         this.sessionBtns.forEach(btn => btn.classList.remove('active'));
//         e.target.classList.add('active');
        
//         // Update UI theme
//         this.updateTheme();
//         this.updateDisplay();
//         this.updateProgress();
//         this.updateStitchState('ready');
        
//         if (this.isRunning) {
//             this.pauseTimer();
//         }
//     }
    
//     updateDisplay() {
//         const minutes = Math.floor(this.currentTime / 60);
//         const seconds = this.currentTime % 60;
//         this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
//         // Update session type
//         const sessionTypes = {
//             work: 'Focus Time',
//             short: 'Short Break',
//             long: 'Long Break'
//         };
//         this.sessionType.textContent = sessionTypes[this.currentSession];
        
//         // Update session counter
//         this.sessionCountEl.textContent = this.sessionCount;
//     }
    
//     updateProgress() {
//         const progress = (this.totalTime - this.currentTime) / this.totalTime;
//         const offset = this.circumference - (progress * this.circumference);
//         this.progressRing.style.strokeDashoffset = offset;
//     }
    
//     updateTheme() {
//         this.timerContainer.classList.remove('work', 'break');
//         if (this.currentSession === 'work') {
//             this.timerContainer.classList.add('work');
//         } else {
//             this.timerContainer.classList.add('break');
//         }
//     }
    
//     updateStitchState(state) {
//         const gifs = {
//             ready: '../assets/gifs/stitch-hyping.gif',
//             working: '../assets/gifs/stitch-dancing.gif',
//             paused: '../assets/gifs/stitch-eating.gif',
//             complete: '../assets/gifs/stitch-love.gif',
//             break: '../assets/gifs/stitch-sleeping.gif'
//         };
        
//         let gif = gifs[state];
//         if (this.currentSession !== 'work' && state === 'working') {
//             gif = gifs.break;
//         }
        
//         this.stitchImg.src = gif;
        
//         // Update speech bubble
//         let quotes;
//         if (state === 'complete') {
//             quotes = this.stitchQuotes.complete;
//         } else if (this.currentSession === 'work') {
//             quotes = this.stitchQuotes.work;
//         } else {
//             quotes = this.stitchQuotes.break;
//         }
        
//         const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
//         this.stitchSpeech.textContent = randomQuote;
//     }
    
//     updateStats() {
//         // This would typically save to localStorage or send to backend
//         const today = new Date().toDateString();
//         const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
//         if (!stats[today]) {
//             stats[today] = { completed: 0, totalTime: 0 };
//         }
        
//         if (this.currentSession === 'work') {
//             stats[today].completed++;
//             stats[today].totalTime += this.settings.work;
//         }
        
//         localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
//         // Update display
//         this.todayPomodoros.textContent = stats[today].completed;
//         this.totalTime.textContent = `${Math.floor(stats[today].totalTime / 60)}h ${stats[today].totalTime % 60}m`;
//     }
    
//     getSessionKey() {
//         const keyMap = {
//             work: 'work',
//             short: 'shortBreak',
//             long: 'longBreak'
//         };
//         return keyMap[this.currentSession] || 'work';
//     }
    
//     toggleSettings() {
//         this.settingsPanel.classList.toggle('open');
//     }
    
//     loadSettings() {
//         const saved = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
//         this.settings = { ...this.settings, ...saved };
//     }
    
//     playNotificationSound() {
//         // Create a simple beep sound
//         const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const oscillator = audioContext.createOscillator();
//         const gainNode = audioContext.createGain();
        
//         oscillator.connect(gainNode);
//         gainNode.connect(audioContext.destination);
        
//         oscillator.frequency.value = 800;
//         oscillator.type = 'sine';
        
//         gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//         gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
//         oscillator.start(audioContext.currentTime);
//         oscillator.stop(audioContext.currentTime + 0.5);
//     }
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     new PomodoroTimer();
// });

// export default PomodoroTimer;

// src/js/components/timer.js
class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.shortBreak = 5 * 60; // 5 minutes
        this.longBreak = 15 * 60; // 15 minutes
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isPaused = false;
        this.session = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.sessionCount = 0;
        this.intervalId = null;
        
        this.initializeElements();
        this.updateDisplay();
        this.bindEvents();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.sessionLabel = document.getElementById('session-label');
        this.sessionCounter = document.getElementById('session-counter');
        this.progressRing = document.getElementById('progress-ring');
        this.stitchCharacter = document.getElementById('stitch-character');
        
        // Settings elements
        this.workTimeInput = document.getElementById('work-time');
        this.shortBreakInput = document.getElementById('short-break');
        this.longBreakInput = document.getElementById('long-break');
        
        // Set initial values
        if (this.workTimeInput) this.workTimeInput.value = this.workTime / 60;
        if (this.shortBreakInput) this.shortBreakInput.value = this.shortBreak / 60;
        if (this.longBreakInput) this.longBreakInput.value = this.longBreak / 60;
    }

    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }

        // Settings inputs
        if (this.workTimeInput) {
            this.workTimeInput.addEventListener('change', (e) => {
                this.workTime = parseInt(e.target.value) * 60;
                if (this.session === 'work' && !this.isRunning) {
                    this.currentTime = this.workTime;
                    this.updateDisplay();
                }
            });
        }

        if (this.shortBreakInput) {
            this.shortBreakInput.addEventListener('change', (e) => {
                this.shortBreak = parseInt(e.target.value) * 60;
            });
        }

        if (this.longBreakInput) {
            this.longBreakInput.addEventListener('change', (e) => {
                this.longBreak = parseInt(e.target.value) * 60;
            });
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.intervalId = setInterval(() => this.tick(), 1000);
            this.updateButtons();
            this.updateStitchMood('focused');
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.intervalId);
            this.updateButtons();
            this.updateStitchMood('paused');
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.intervalId);
        
        this.currentTime = this.workTime;
        this.session = 'work';
        this.sessionCount = 0;
        
        this.updateDisplay();
        this.updateButtons();
        this.updateStitchMood('idle');
    }

    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            this.updateDisplay();
        } else {
            this.sessionComplete();
        }
    }

    sessionComplete() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        // Play notification sound
        this.playNotificationSound();
        
        // Update session
        if (this.session === 'work') {
            this.sessionCount++;
            // Every 4 work sessions, take a long break
            if (this.sessionCount % 4 === 0) {
                this.session = 'longBreak';
                this.currentTime = this.longBreak;
                this.updateStitchMood('celebrating');
            } else {
                this.session = 'shortBreak';
                this.currentTime = this.shortBreak;
                this.updateStitchMood('relaxing');
            }
        } else {
            this.session = 'work';
            this.currentTime = this.workTime;
            this.updateStitchMood('ready');
        }
        
        this.updateDisplay();
        this.updateButtons();
        
        // Show notification
        this.showNotification();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = timeString;
        }
        
        if (this.sessionLabel) {
            this.sessionLabel.textContent = this.getSessionLabel();
        }
        
        if (this.sessionCounter) {
            this.sessionCounter.textContent = `Session ${this.sessionCount}`;
        }
        
        // Update progress ring
        this.updateProgressRing();
        
        // Update document title
        document.title = `${timeString} - ${this.getSessionLabel()} - Stitch It Down`;
    }

    updateProgressRing() {
        if (!this.progressRing) return;
        
        const totalTime = this.getTotalTimeForSession();
        const progress = ((totalTime - this.currentTime) / totalTime) * 100;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference - (progress / 100) * circumference;
        
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = offset;
    }

    getTotalTimeForSession() {
        switch (this.session) {
            case 'work': return this.workTime;
            case 'shortBreak': return this.shortBreak;
            case 'longBreak': return this.longBreak;
            default: return this.workTime;
        }
    }

    getSessionLabel() {
        switch (this.session) {
            case 'work': return 'Focus Time';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
            default: return 'Focus Time';
        }
    }

    updateButtons() {
        if (this.startBtn) {
            this.startBtn.disabled = this.isRunning;
            this.startBtn.textContent = this.isPaused ? 'Resume' : 'Start';
        }
        if (this.pauseBtn) {
            this.pauseBtn.disabled = !this.isRunning;
        }
    }

    updateStitchMood(mood) {
        if (!this.stitchCharacter) return;
        
        const moodImages = {
            idle: 'stitch-happy.png',
            focused: 'stitch-wink.png',
            paused: 'stitch-corner1.png',
            celebrating: 'stitch-corner2.png',
            relaxing: 'stitch-corner1.png',
            ready: 'stitch-happy.png'
        };
        
        const imagePath = `../assets/images/characters/${moodImages[mood] || moodImages.idle}`;
        this.stitchCharacter.src = imagePath;
        this.stitchCharacter.alt = `Stitch ${mood}`;
    }

    playNotificationSound() {
        try {
            const audio = new Audio('../assets/sounds/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
        } catch (e) {
            console.log('Notification sound not available');
        }
    }

    showNotification() {
        const message = this.session === 'work' ? 
            'Break time! Time to relax with Stitch!' : 
            'Break\'s over! Ready to focus again?';
            
        // Try to show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Stitch It Down Timer', {
                body: message,
                icon: '../assets/images/characters/stitch-icon.png'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Stitch It Down Timer', {
                        body: message,
                        icon: '../assets/images/characters/stitch-icon.png'
                    });
                }
            });
        }
        
        // Fallback: Flash the window (Electron specific)
        if (window.electronAPI) {
            window.electronAPI.flashWindow();
        }
    }

    // Method to get timer stats
    getStats() {
        return {
            sessionsCompleted: this.sessionCount,
            currentSession: this.session,
            timeRemaining: this.currentTime,
            isRunning: this.isRunning
        };
    }
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomodoroTimer;
}