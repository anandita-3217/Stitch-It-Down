// class PomodoroTimer {
//     constructor(imageRegistry = null) {
//         this.images = imageRegistry; // Store the image registry
//         this.currentTime = 25 * 60;
//         this.totalTime = 25 * 60;
//         this.isRunning = false;
//         this.currentSession = 'work';
//         this.sessionCount = 1;
//         this.totalSessions = 0;
//         this.interval = null; // Add this to track the interval
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
        
//         // Initialize after a short delay to ensure DOM is ready
//         this.initializeWhenReady();
//     }
    
//     initializeWhenReady() {
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => this.init());
//         } else {
//             this.init();
//         }
//     }
    
//     init() {
//         try {
//             this.bindElements();
//             this.bindEvents();
//             this.loadSettings();
//             this.updateDisplay();
//             this.updateStats();
//             console.log('PomodoroTimer initialized successfully');
//         } catch (error) {
//             console.error('Error initializing PomodoroTimer:', error);
//         }
//     }
    
//     bindElements() {
//         // Timer elements
//         this.timeDisplay = document.getElementById('timeDisplay');
//         this.sessionType = document.getElementById('sessionType');
//         this.motivationText = document.getElementById('motivationText');
//         this.sessionCountEl = document.getElementById('sessionCount');
        
//         // Progress ring
//         this.progressRing = document.querySelector('.progress-ring-progress');
//         if (this.progressRing) {
//             this.circumference = 2 * Math.PI * 130; // radius = 130
//             this.progressRing.style.strokeDasharray = this.circumference;
//         }
        
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
//         this.totalTimeEl = document.getElementById('totalTime'); // Renamed to avoid conflict
//         this.streak = document.getElementById('streak');
        
//         // Timer container
//         this.timerContainer = document.querySelector('.timer-container');
        
//         // Check if essential elements exist
//         if (!this.timeDisplay || !this.startPauseBtn) {
//             throw new Error('Essential timer elements not found in DOM');
//         }
//     }
    
//     bindEvents() {
//         if (this.startPauseBtn) {
//             this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
//         }
//         if (this.resetBtn) {
//             this.resetBtn.addEventListener('click', () => this.resetTimer());
//         }
//         if (this.skipBtn) {
//             this.skipBtn.addEventListener('click', () => this.skipSession());
//         }
        
//         if (this.sessionBtns) {
//             this.sessionBtns.forEach(btn => {
//                 btn.addEventListener('click', (e) => this.switchSession(e));
//             });
//         }
        
//         if (this.settingsToggle) {
//             this.settingsToggle.addEventListener('click', () => this.toggleSettings());
//         }
//         if (this.closeSettings) {
//             this.closeSettings.addEventListener('click', () => this.toggleSettings());
//         }
        
//         // Settings inputs
//         const workDurationInput = document.getElementById('workDuration');
//         if (workDurationInput) {
//             workDurationInput.addEventListener('input', (e) => {
//                 this.settings.work = parseInt(e.target.value);
//                 const workValue = document.getElementById('workValue');
//                 if (workValue) {
//                     workValue.textContent = e.target.value;
//                 }
//                 if (this.currentSession === 'work') this.resetTimer();
//             });
//         }
        
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
//         if (this.timerContainer) {
//             this.timerContainer.classList.add('running');
//         }
//         if (this.startPauseBtn) {
//             this.startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
//             this.startPauseBtn.classList.remove('pulse');
//         }
        
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
//         if (this.timerContainer) {
//             this.timerContainer.classList.remove('running');
//         }
//         if (this.startPauseBtn) {
//             this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
//             this.startPauseBtn.classList.add('pulse');
//         }
//         if (this.interval) {
//             clearInterval(this.interval);
//             this.interval = null;
//         }
        
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
//         if (this.sessionBtns) {
//             this.sessionBtns.forEach(btn => btn.classList.remove('active'));
//             e.target.classList.add('active');
//         }
        
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
//         const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
//         if (this.timeDisplay) {
//             this.timeDisplay.textContent = formattedTime;
//         }
        
//         // Update session type
//         const sessionTypes = {
//             work: 'Focus Time',
//             short: 'Short Break',
//             long: 'Long Break'
//         };
        
//         if (this.sessionType) {
//             this.sessionType.textContent = sessionTypes[this.currentSession];
//         }
        
//         // Update session counter
//         if (this.sessionCountEl) {
//             this.sessionCountEl.textContent = this.sessionCount;
//         }
//     }
    
//     updateProgress() {
//         if (this.progressRing && this.circumference) {
//             const progress = (this.totalTime - this.currentTime) / this.totalTime;
//             const offset = this.circumference - (progress * this.circumference);
//             this.progressRing.style.strokeDashoffset = offset;
//         }
//     }
    
//     updateTheme() {
//         if (this.timerContainer) {
//             this.timerContainer.classList.remove('work', 'break');
//             if (this.currentSession === 'work') {
//                 this.timerContainer.classList.add('work');
//             } else {
//                 this.timerContainer.classList.add('break');
//             }
//         }
//     }
    
//     // updateStitchState(state) {
//     //     // Use paths that match your webpack build output
//     //     const gifs = {
//     //         ready: './assets/images/stitch-hyping.gif',
//     //         working: './assets/images/stitch-dancing.gif',
//     //         paused: './assets/images/stitch-eating.gif',
//     //         complete: './assets/images/stitch-love.gif',
//     //         break: './assets/images/stitch-sleeping.gif'
//     //     };
        
//     //     let gif = gifs[state];
//     //     if (this.currentSession !== 'work' && state === 'working') {
//     //         gif = gifs.break;
//     //     }
        
//     //     if (this.stitchImg && gif) {
//     //         this.stitchImg.src = gif;
//     //     }
        
//     //     // Update speech bubble
//     //     let quotes;
//     //     if (state === 'complete') {
//     //         quotes = this.stitchQuotes.complete;
//     //     } else if (this.currentSession === 'work') {
//     //         quotes = this.stitchQuotes.work;
//     //     } else {
//     //         quotes = this.stitchQuotes.break;
//     //     }
        
//     //     if (this.stitchSpeech && quotes) {
//     //         const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
//     //         this.stitchSpeech.textContent = randomQuote;
//     //     }
//     // }
//     updateStitchState(state) {
//         // Use the image registry if available, otherwise fall back to paths
//         if (this.images && this.images.gifs) {
//             const gifMap = {
//                 ready: 'hyping',
//                 working: 'dancing',
//                 paused: 'eating',
//                 complete: 'love',
//                 break: 'sleeping'
//             };
            
//             let gifKey = gifMap[state];
//             if (this.currentSession !== 'work' && state === 'working') {
//                 gifKey = 'sleeping'; // Use sleeping for break time
//             }
            
//             if (this.stitchImg && gifKey && this.images.gifs[gifKey]) {
//                 this.stitchImg.src = this.images.gifs[gifKey];
//             }
//         } else {
//             // Fallback to original paths (for backward compatibility)
//             const gifs = {
//                 ready: '@assets/gifs/stitch-hyping.gif',
//                 working: '@assets/gifs/stitch-dancing.gif',
//                 paused: '@assets/gifs/stitch-eating.gif',
//                 complete: '@assets/gifs/stitch-love.gif',
//                 break: '@assets/gifs/stitch-sleeping.gif'
//             };
            
//             let gif = gifs[state];
//             if (this.currentSession !== 'work' && state === 'working') {
//                 gif = gifs.break;
//             }
            
//             if (this.stitchImg && gif) {
//                 this.stitchImg.src = gif;
//             }
//         }
        
//         // Update speech bubble
//         let quotes;
//         if (state === 'complete') {
//             quotes = this.stitchQuotes.complete;
//         } else if (this.currentSession === 'work') {
//             quotes = this.stitchQuotes.work;
//         } else {
//             quotes = this.stitchQuotes.break;
//         }
        
//         if (this.stitchSpeech && quotes) {
//             const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
//             this.stitchSpeech.textContent = randomQuote;
//         }
//     }

    
//     updateStats() {
//         try {
//             const today = new Date().toDateString();
//             const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
            
//             if (!stats[today]) {
//                 stats[today] = { completed: 0, totalTime: 0 };
//             }
            
//             if (this.currentSession === 'work') {
//                 stats[today].completed++;
//                 stats[today].totalTime += this.settings.work;
//             }
            
//             localStorage.setItem('pomodoroStats', JSON.stringify(stats));
            
//             // Update display
//             if (this.todayPomodoros) {
//                 this.todayPomodoros.textContent = stats[today].completed;
//             }
//             if (this.totalTimeEl) {
//                 this.totalTimeEl.textContent = `${Math.floor(stats[today].totalTime / 60)}h ${stats[today].totalTime % 60}m`;
//             }
//         } catch (error) {
//             console.error('Error updating stats:', error);
//         }
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
//         if (this.settingsPanel) {
//             this.settingsPanel.classList.toggle('open');
//         }
//     }
    
//     loadSettings() {
//         try {
//             const saved = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
//             this.settings = { ...this.settings, ...saved };
//         } catch (error) {
//             console.error('Error loading settings:', error);
//         }
//     }
    
//     playNotificationSound() {
//         try {
//             // Create a simple beep sound
//             const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//             const oscillator = audioContext.createOscillator();
//             const gainNode = audioContext.createGain();
            
//             oscillator.connect(gainNode);
//             gainNode.connect(audioContext.destination);
            
//             oscillator.frequency.value = 800;
//             oscillator.type = 'sine';
            
//             gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//             gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
//             oscillator.start(audioContext.currentTime);
//             oscillator.stop(audioContext.currentTime + 0.5);
//         } catch (error) {
//             console.error('Error playing notification sound:', error);
//         }
//     }
    
//     // Public method to destroy the timer (cleanup)
//     destroy() {
//         if (this.interval) {
//             clearInterval(this.interval);
//             this.interval = null;
//         }
//         this.isRunning = false;
//     }
// }

// // Export the class for use in other modules
// export default PomodoroTimer;

// // Also make it available globally for direct HTML usage
// if (typeof window !== 'undefined') {
//     window.PomodoroTimer = PomodoroTimer;
// }

class PomodoroTimer {
    constructor(imageRegistry = null) {
        this.images = imageRegistry;
        this.currentTime = 25 * 60;
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.currentSession = 'work';
        this.sessionCount = 1;
        this.totalSessions = 0;
        this.interval = null;
        this.settings = {
            work: 25,
            shortBreak: 5,
            longBreak: 15,
            autoStart: false,
            soundNotifications: true
        };
        
        this.stitchQuotes = {
            work: [
                "Let's get productive!",
                "Focus time, ohana!",
                "You can do this!",
                "Stay strong!",
                "Keep going!"
            ],
            break: [
                "Time to relax!",
                "Take a breather!",
                "You deserve this break!",
                "Recharge time!",
                "Rest up, buddy!"
            ],
            complete: [
                "Great job!",
                "You did amazing!",
                "Proud of you!",
                "Mission accomplished!",
                "You're the best!"
            ]
        };
        
        this.initializeWhenReady();
    }
    
    initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        try {
            this.bindElements();
            this.bindEvents();
            this.loadSettings();
            this.updateDisplay();
            this.updateStats();
            console.log('PomodoroTimer initialized successfully');
        } catch (error) {
            console.error('Error initializing PomodoroTimer:', error);
        }
    }
    
    bindElements() {
        // Timer elements - these should exist in your timer page
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionType = document.getElementById('sessionType');
        this.motivationText = document.getElementById('motivationText');
        this.sessionCountEl = document.getElementById('sessionCount');
        
        // Progress ring
        this.progressRing = document.querySelector('.progress-ring-progress');
        if (this.progressRing) {
            this.circumference = 2 * Math.PI * 130;
            this.progressRing.style.strokeDasharray = this.circumference;
        }
        
        // Controls
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.skipBtn = document.getElementById('skipBtn');
        
        // Session buttons
        this.sessionBtns = document.querySelectorAll('.session-btn');
        
        // Stitch elements
        this.stitchImg = document.getElementById('stitchTimer');
        this.stitchSpeech = document.getElementById('stitchSpeech');
        
        // Settings
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.closeSettings = document.getElementById('closeSettings');
        
        // Stats
        this.todayPomodoros = document.getElementById('todayPomodoros');
        this.totalTimeEl = document.getElementById('totalTime');
        this.streak = document.getElementById('streak');
        
        // Timer container - use a fallback if not found
        this.timerContainer = document.querySelector('.timer-container') || document.querySelector('.main-content') || document.body;
        
        // Check if essential elements exist
        if (!this.timeDisplay || !this.startPauseBtn) {
            console.warn('Some timer elements not found in DOM. Timer may have limited functionality.');
        }
        
        // Log what elements were found for debugging
        console.log('Timer elements bound:', {
            timeDisplay: !!this.timeDisplay,
            startPauseBtn: !!this.startPauseBtn,
            sessionBtns: this.sessionBtns.length,
            stitchImg: !!this.stitchImg,
            timerContainer: !!this.timerContainer
        });
    }
    
    bindEvents() {
        if (this.startPauseBtn) {
            this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetTimer());
        }
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.skipSession());
        }
        
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            this.sessionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.switchSession(e));
            });
        }
        
        if (this.settingsToggle) {
            this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        }
        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', () => this.toggleSettings());
        }
        
        // Settings inputs
        const workDurationInput = document.getElementById('workDuration');
        if (workDurationInput) {
            workDurationInput.addEventListener('input', (e) => {
                this.settings.work = parseInt(e.target.value);
                const workValue = document.getElementById('workValue');
                if (workValue) {
                    workValue.textContent = e.target.value;
                }
                if (this.currentSession === 'work') this.resetTimer();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.toggleTimer();
            }
        });
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        if (this.timerContainer) {
            this.timerContainer.classList.add('running');
        }
        if (this.startPauseBtn) {
            this.startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
            this.startPauseBtn.classList.remove('pulse');
        }
        
        this.updateStitchState('working');
        
        this.interval = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        if (this.timerContainer) {
            this.timerContainer.classList.remove('running');
        }
        if (this.startPauseBtn) {
            this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
            this.startPauseBtn.classList.add('pulse');
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.updateStitchState('paused');
    }
    
    resetTimer() {
        this.pauseTimer();
        this.currentTime = this.settings[this.getSessionKey()] * 60;
        this.totalTime = this.currentTime;
        this.updateDisplay();
        this.updateProgress();
        
        this.updateStitchState('ready');
    }
    
    skipSession() {
        this.completeSession();
    }
    
    completeSession() {
        this.pauseTimer();
        
        if (this.settings.soundNotifications) {
            this.playNotificationSound();
        }
        
        this.updateStats();
        this.updateStitchState('complete');
        
        setTimeout(() => {
            this.switchToNextSession();
        }, 2000);
    }
    
    switchToNextSession() {
        if (this.currentSession === 'work') {
            this.sessionCount++;
            
            if (this.sessionCount % 4 === 0) {
                this.switchSession({ target: { dataset: { type: 'long', duration: '15' } } });
            } else {
                this.switchSession({ target: { dataset: { type: 'short', duration: '5' } } });
            }
        } else {
            this.switchSession({ target: { dataset: { type: 'work', duration: '25' } } });
        }
        
        if (this.settings.autoStart) {
            setTimeout(() => this.startTimer(), 1000);
        }
    }
    
    switchSession(e) {
        const type = e.target.dataset.type;
        const duration = parseInt(e.target.dataset.duration);
        
        this.currentSession = type;
        this.currentTime = duration * 60;
        this.totalTime = this.currentTime;
        
        // Update active button - add null check
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            this.sessionBtns.forEach(btn => btn.classList.remove('active'));
            if (e.target && e.target.classList) {
                e.target.classList.add('active');
            }
        }
        
        // Update UI theme
        this.updateTheme();
        this.updateDisplay();
        this.updateProgress();
        this.updateStitchState('ready');
        
        if (this.isRunning) {
            this.pauseTimer();
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timeDisplay) {
            this.timeDisplay.textContent = formattedTime;
        }
        
        const sessionTypes = {
            work: 'Focus Time',
            short: 'Short Break',
            long: 'Long Break'
        };
        
        if (this.sessionType) {
            this.sessionType.textContent = sessionTypes[this.currentSession];
        }
        
        if (this.sessionCountEl) {
            this.sessionCountEl.textContent = this.sessionCount;
        }
    }
    
    updateProgress() {
        if (this.progressRing && this.circumference) {
            const progress = (this.totalTime - this.currentTime) / this.totalTime;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
        }
    }
    
    updateTheme() {
        if (this.timerContainer) {
            this.timerContainer.classList.remove('work', 'break');
            if (this.currentSession === 'work') {
                this.timerContainer.classList.add('work');
            } else {
                this.timerContainer.classList.add('break');
            }
        }
    }
    
    updateStitchState(state) {
        // Use the image registry if available
        if (this.images && this.images.gifs) {
            const gifMap = {
                ready: 'hyping',
                working: 'dancing',
                paused: 'eating',
                complete: 'love',
                break: 'sleeping'
            };
            
            let gifKey = gifMap[state];
            if (this.currentSession !== 'work' && state === 'working') {
                gifKey = 'sleeping';
            }
            
            if (this.stitchImg && gifKey && this.images.gifs[gifKey]) {
                this.stitchImg.src = this.images.gifs[gifKey];
                console.log(`Updated Stitch GIF to: ${gifKey}`, this.images.gifs[gifKey]);
            }
        } else {
            console.warn('Image registry not available, Stitch GIF will not update');
        }
        
        // Update speech bubble
        let quotes;
        if (state === 'complete') {
            quotes = this.stitchQuotes.complete;
        } else if (this.currentSession === 'work') {
            quotes = this.stitchQuotes.work;
        } else {
            quotes = this.stitchQuotes.break;
        }
        
        if (this.stitchSpeech && quotes) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            this.stitchSpeech.textContent = randomQuote;
        }
    }
    
    updateStats() {
        try {
            const today = new Date().toDateString();
            let stats = {};
            
            try {
                stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
            } catch (e) {
                console.warn('Could not load stats from localStorage:', e);
            }
            
            if (!stats[today]) {
                stats[today] = { completed: 0, totalTime: 0 };
            }
            
            if (this.currentSession === 'work') {
                stats[today].completed++;
                stats[today].totalTime += this.settings.work;
            }
            
            try {
                localStorage.setItem('pomodoroStats', JSON.stringify(stats));
            } catch (e) {
                console.warn('Could not save stats to localStorage:', e);
            }
            
            // Update display
            if (this.todayPomodoros) {
                this.todayPomodoros.textContent = stats[today].completed;
            }
            if (this.totalTimeEl) {
                this.totalTimeEl.textContent = `${Math.floor(stats[today].totalTime / 60)}h ${stats[today].totalTime % 60}m`;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    getSessionKey() {
        const keyMap = {
            work: 'work',
            short: 'shortBreak',
            long: 'longBreak'
        };
        return keyMap[this.currentSession] || 'work';
    }
    
    toggleSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.toggle('open');
        }
    }
    
    loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
            this.settings = { ...this.settings, ...saved };
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
    }
    
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }
    
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }
}

export default PomodoroTimer;

if (typeof window !== 'undefined') {
    window.PomodoroTimer = PomodoroTimer;
}