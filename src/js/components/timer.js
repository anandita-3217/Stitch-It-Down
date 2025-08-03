// timer.js
import bellSound from '@assets/sounds/bell.wav';
import chimeSound from '@assets/sounds/chime.wav';
import gongSound from '@assets/sounds/gong.wav';
import tweetSound from '@assets/sounds/tweet.wav';

// Add the SOUND_REGISTRY constant
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
    work: ["Let's get productive!","Focus time, ohana!","You can do this!","Stay strong!","Keep going!"],
    break: ["Time to relax!","Take a breather!","You deserve this break!","Recharge time!","Rest up, buddy!"],
    shortBreak: ["Quick break time!","Stretch those muscles!","Stay hydrated!","Just a quick rest!","5 minutes of peace!"],
    longBreak: ["Time for a real break!","Go get some fresh air!","You've earned this!","Take your time!","Recharge completely!","Maybe grab a snack?","Walk around a bit!"],
    complete: ["Great job!","You did amazing!","Proud of you!","Mission accomplished!","You're the best!"]
    };
    this.currentTimerSettings = null;
    this.initializeSettingsListener();
    this.settingsReady = false;
    this.loadInitialSettings();
    this.initializeWhenReady();
    
    }
    
    initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        try {
            console.log('🔄 Timer initializing...');
            
            // Wait for settings to be ready
            await this.waitForSettings();
            
            this.bindElements();
            this.bindEvents();
            this.loadSettings();
            this.setDefaultSession();
            this.updateDisplay();
            this.updateStats();
            this.addToggleEnhancements();
            console.log('PomodoroTimer initialized successfully');
        } catch (error) {
            console.error('Error initializing PomodoroTimer:', error);
        }
    }
        async waitForSettings() {
        console.log('🔄 Waiting for settings...');
        
        // Method 1: Check if settingsCore is available and initialized
        if (window.settingsCore) {
            console.log('📡 Found settingsCore, waiting for initialization...');
            const ready = await window.settingsCore.waitForInitialization();
            if (ready) {
                this.settingsReady = true;
                this.setupSettingsCoreIntegration();
                console.log('✅ Settings ready via settingsCore');
                return;
            }
        }

        // Method 2: Wait for settings from Electron main process
        await this.waitForElectronSettings();
    }

    async waitForElectronSettings() {
        return new Promise((resolve) => {
            let resolved = false;
            
            // Listen for settings from main process
            const settingsReadyHandler = (settings) => {
                if (!resolved) {
                    resolved = true;
                    this.currentTimerSettings = settings;
                    this.settingsReady = true;
                    this.setupElectronSettingsListeners();
                    console.log('✅ Settings ready via Electron:', settings);
                    resolve();
                }
            };

            // Multiple ways settings might arrive
            if (window.electronAPI?.onTimerSettingsReady) {
                window.electronAPI.onTimerSettingsReady(settingsReadyHandler);
            }

            // Listen for DOM events too
            window.addEventListener('timer-settings-ready', (event) => {
                settingsReadyHandler(event.detail);
            });

            window.addEventListener('app-settings-ready', (event) => {
                if (event.detail && event.detail.settings && event.detail.settings.timer) {
                    settingsReadyHandler(event.detail.settings.timer);
                }
            });

            // Try to get settings immediately
            if (window.electronAPI?.getTimerSettings) {
                window.electronAPI.getTimerSettings().then(settings => {
                    if (settings && !resolved) {
                        settingsReadyHandler(settings);
                    }
                }).catch(console.error);
            }

            // Timeout fallback
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.warn('⚠️ Settings timeout, using defaults');
                    this.setupDefaultSettings();
                    resolve();
                }
            }, 5000);
        });
    }

    setupSettingsCoreIntegration() {
        const currentSettings = window.settingsCore.getCurrentSettings();
        if (currentSettings.timer) {
            this.currentTimerSettings = currentSettings.timer;
        }

        // Listen for changes
        window.settingsCore.on('settingsUpdated', (settings) => {
            if (settings.timer) {
                this.currentTimerSettings = settings.timer;
                console.log('📡 Timer settings updated via settingsCore');
            }
        });
    }

    setupElectronSettingsListeners() {
        if (window.electronAPI?.onTimerSettingsUpdated) {
            window.electronAPI.onTimerSettingsUpdated((newSettings) => {
                this.currentTimerSettings = newSettings;
                console.log('📡 Timer settings updated via Electron');
            });
        }
    }

    setupDefaultSettings() {
        this.currentTimerSettings = {
            soundEnabled: true,
            soundType: 'bell',
            volume: 0.8,
            customSoundPath: null
        };
        this.settingsReady = true;
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

        console.log('🔍 Settings elements found:');
        console.log('  settingsPanel:', !!this.settingsPanel, this.settingsPanel);
        console.log('  settingsToggle:', !!this.settingsToggle, this.settingsToggle);
        console.log('  closeSettings:', !!this.closeSettings, this.closeSettings);
    

        
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
    addToggleEnhancements() {
        // Find all toggle switches
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        
        toggles.forEach(toggle => {
            // Add click animation
            toggle.addEventListener('change', function() {
                const slider = this.nextElementSibling;

                // Add a brief animation class
                slider.classList.add('toggle-active');

                // Remove the animation class after animation completes
                setTimeout(() => {
                    slider.classList.remove('toggle-active');
                }, 300);
            });
        });
    }
        async initializeSettingsListener() {
        // Listen for settings updates from main process
        window.electronAPI.onTimerSettingsUpdated((newSettings) => {
            console.log('Timer settings updated:', newSettings);
            this.currentTimerSettings = newSettings;
        });
    }
    
    async loadInitialSettings() {
        try {
            this.currentTimerSettings = await window.electronAPI.getTimerSettings();
            console.log('Initial timer settings loaded:', this.currentTimerSettings);
        } catch (error) {
            console.error('Failed to load initial timer settings:', error);
            // Use fallback settings
            this.currentTimerSettings = {
                soundEnabled: true,
                soundType: 'bell',
                volume: 0.8,
                customSoundPath: null
            };
        }
    }
    setDefaultSession() {
        // Ensure we start with a work session as default
        this.currentSession = 'work';
        this.currentTime = this.settings.work * 60;
        this.totalTime = this.currentTime;
        
        // Set the work button as active by default
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            this.sessionBtns.forEach(btn => btn.classList.remove('active'));
            
            // Find and activate the work session button
            const workBtn = Array.from(this.sessionBtns).find(btn => 
                btn.dataset.type === 'work'
            );
            if (workBtn) {
                workBtn.classList.add('active');
            }
        }
        this.updateTheme();
        this.updateProgress();
        this.updateStitchState('ready');
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
        // if (this.closeSettings) {
        //     this.closeSettings.addEventListener('click', () => this.toggleSettings());
        // }
            if (this.settingsToggle) {
        console.log('✅ Binding click event to settings toggle');
        this.settingsToggle.addEventListener('click', () => {
            console.log('🖱️ Settings toggle clicked!');
            this.toggleSettings();
        });
    } else {
        console.log('❌ Settings toggle button not found, cannot bind events');
    }
    
    if (this.closeSettings) {
        console.log('✅ Binding click event to close settings');
        this.closeSettings.addEventListener('click', () => {
            console.log('🖱️ Close settings clicked!');
            this.toggleSettings();
        });
    } else {
        console.log('❌ Close settings button not found, cannot bind events');
    }
        
        // Work duration settings
        const workDurationInput = document.getElementById('workDuration');
        if (workDurationInput) {
            workDurationInput.addEventListener('input', (e) => {
                this.settings.work = parseInt(e.target.value);
                const workValue = document.getElementById('workValue');
                if (workValue) {
                    workValue.textContent = e.target.value;
                }
                this.updateSessionButtonDuration('work', e.target.value);
                if (this.currentSession === 'work') this.resetTimer();
            });
        }
        
        // Short break duration settings
        const shortBreakDurationInput = document.getElementById('shortBreakDuration');
        if (shortBreakDurationInput) {
            shortBreakDurationInput.addEventListener('input', (e) => {
                this.settings.shortBreak = parseInt(e.target.value);
                const shortBreakValue = document.getElementById('shortBreakValue');
                if (shortBreakValue) {
                    shortBreakValue.textContent = e.target.value;
                }
                this.updateSessionButtonDuration('short', e.target.value);
                if (this.currentSession === 'short') this.resetTimer();
            });
        }
        
        // Long break duration settings
        const longBreakDurationInput = document.getElementById('longBreakDuration');
        if (longBreakDurationInput) {
            longBreakDurationInput.addEventListener('input', (e) => {
                this.settings.longBreak = parseInt(e.target.value);
                const longBreakValue = document.getElementById('longBreakValue');
                if (longBreakValue) {
                    longBreakValue.textContent = e.target.value;
                }
                this.updateSessionButtonDuration('long', e.target.value);
                if (this.currentSession === 'long') this.resetTimer();
            });
        }
        
        // Auto-start setting
        const autoStartInput = document.getElementById('autoStart');
        if (autoStartInput) {
            autoStartInput.addEventListener('change', (e) => {
                this.settings.autoStart = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Sound notifications setting
        const soundNotificationsInput = document.getElementById('soundNotifications');
        if (soundNotificationsInput) {
            soundNotificationsInput.addEventListener('change', (e) => {
                this.settings.soundNotifications = e.target.checked;
                this.saveSettings();
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
    
    // New method to update session button duration
    updateSessionButtonDuration(sessionType, duration) {
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            const sessionBtn = Array.from(this.sessionBtns).find(btn => 
                btn.dataset.type === sessionType
            );
            if (sessionBtn) {
                sessionBtn.dataset.duration = duration;
                // Update the button text if it shows duration
                const durationText = sessionBtn.querySelector('.duration-text');
                if (durationText) {
                    durationText.textContent = `${duration}m`;
                }
            }
        }
    }
    
    // New method to save settings
    saveSettings() {
        try {
            localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
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
                this.switchSession({ target: { dataset: { type: 'long', duration: this.settings.longBreak.toString() } } });
            } else {
                this.switchSession({ target: { dataset: { type: 'short', duration: this.settings.shortBreak.toString() } } });
            }
        } else {
            this.switchSession({ target: { dataset: { type: 'work', duration: this.settings.work.toString() } } });
        }
        
        if (this.settings.autoStart) {
            setTimeout(() => this.startTimer(), 1000);
        }
    }
    
    switchSession(e) {
    let clickedButton;
    let type;
    let duration;
    
    // Handle real DOM events (user clicks)
    if (e && e.target && typeof e.target.closest === 'function') {
        clickedButton = e.target.closest('.session-btn');
        
        // If the clicked button is already active, don't allow deactivation
        if (clickedButton && clickedButton.classList.contains('active')) {
            return;
        }
        
        type = clickedButton.dataset.type;
        duration = parseInt(clickedButton.dataset.duration);
    } 
    // Handle programmatic calls (from switchToNextSession)
    else if (e && e.target && e.target.dataset) {
        type = e.target.dataset.type;
        duration = parseInt(e.target.dataset.duration);
        
        // Find the corresponding button in the DOM
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            clickedButton = Array.from(this.sessionBtns).find(btn => 
                btn.dataset.type === type
            );
        }
    }
    // Handle direct calls with type and duration
    else if (typeof e === 'string') {
        type = e;
        duration = this.settings[this.getSessionKey(type)] * 60;
        
        // Find the corresponding button in the DOM
        if (this.sessionBtns && this.sessionBtns.length > 0) {
            clickedButton = Array.from(this.sessionBtns).find(btn => 
                btn.dataset.type === type
            );
        }
    }
    
    // Validate inputs
    if (!type || !duration) {
        console.error('Invalid session type or duration');
        return;
    }
    
    this.currentSession = type;
    this.currentTime = duration * 60;
    this.totalTime = this.currentTime;
    
    // Update active button
    if (this.sessionBtns && this.sessionBtns.length > 0) {
        this.sessionBtns.forEach(btn => btn.classList.remove('active'));
        if (clickedButton && clickedButton.classList) {
            clickedButton.classList.add('active');
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
getSessionKey(sessionType = null) {
    const type = sessionType || this.currentSession;
    const keyMap = {
        work: 'work',
        short: 'shortBreak',
        long: 'longBreak'
    };
    return keyMap[type] || 'work';
}
switchSessionProgrammatically(sessionType) {
    const sessionSettings = {
        work: this.settings.work,
        short: this.settings.shortBreak,
        long: this.settings.longBreak
    };
    
    const duration = sessionSettings[sessionType];
    if (!duration) {
        console.error('Invalid session type:', sessionType);
        return;
    }
    
    this.currentSession = sessionType;
    this.currentTime = duration * 60;
    this.totalTime = this.currentTime;
    
    // Update active button
    if (this.sessionBtns && this.sessionBtns.length > 0) {
        this.sessionBtns.forEach(btn => btn.classList.remove('active'));
        
        const targetButton = Array.from(this.sessionBtns).find(btn => 
            btn.dataset.type === sessionType
        );
        if (targetButton) {
            targetButton.classList.add('active');
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
            this.sessionType.textContent = sessionTypes[this.currentSession] || 'Focus Time';
        }
        
        if (this.sessionCountEl) {
            const displayCount = this.sessionCount && this.sessionCount > 0 ? this.sessionCount : 1;
            this.sessionCountEl.textContent = displayCount;
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
            this.timerContainer.classList.remove('work', 'break','short','long');
            if (this.currentSession === 'work') {
                this.timerContainer.classList.add('work');
            } else if(this.currentSession === 'short') {
                this.timerContainer.classList.add('short');
            } else if(this.currentSession === 'long') {
                this.timerContainer.classList.add('long');
            }
        }
    }
    getStitchQuotes(state) {
    const quoteMappings = {
        work: {
            ready: this.stitchQuotes.work,
            working: this.stitchQuotes.work,
            paused: ["Take a breath!","Ready when you are!","No rush, friend!","Pause is okay!","Get back when ready!"],
            complete: this.stitchQuotes.complete
        },
        short: {
            ready: this.stitchQuotes.shortBreak || this.stitchQuotes.break,
            working: this.stitchQuotes.shortBreak || this.stitchQuotes.break,
            paused: ["Break time paused!","Whenever you're ready!","No pressure!","Take your time!","Relax mode on hold!"],
            complete: ["Short break done!","Back to work, buddy!","Ready to focus again!","Refreshed and ready!","Let's get back to it!"]
        },
        long: {
            ready: this.stitchQuotes.longBreak || this.stitchQuotes.break,
            working: this.stitchQuotes.longBreak || this.stitchQuotes.break,
            paused: ["Long break paused!","Take all the time you need!","Deep rest on hold!","No worries at all!","Recharge when ready!"],
            complete: ["Long break complete!","Fully recharged!","Ready for the next round!","You're refreshed!","Back to productivity!"]
        }
    };
    const sessionMappings = quoteMappings[this.currentSession] || quoteMappings.work;
    return sessionMappings[state] || this.stitchQuotes.work;
}
    updateStitchState(state) {
    if (this.images && this.images.gifs) {
        const gifKey = this.getStitchGifKey(state);
        
        if (this.stitchImg && gifKey && this.images.gifs[gifKey]) {
            this.stitchImg.src = this.images.gifs[gifKey];
            // console.log(`Updated Stitch GIF to: ${gifKey}`, this.images.gifs[gifKey]);
        }
    } else {
        console.warn('Image registry not available, Stitch GIF will not update');
    }
    const quotes = this.getStitchQuotes(state);
    if (this.stitchSpeech && quotes) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.stitchSpeech.textContent = randomQuote;
    }
}
getStitchGifKey(state) {
    const gifMappings = {
        work: {ready: 'hyping',    working: 'dancing', paused: 'eating',   complete: 'love'    },
        short: {ready: 'hyping',    working: 'eating',  paused: 'tantrum',  complete: 'love'    },
        long: {ready: 'hyping',    working: 'sleeping',paused: 'tantrum',  complete: 'love'    }
    };
    
    const sessionMappings = gifMappings[this.currentSession] || gifMappings.work;
    return sessionMappings[state] || 'hyping';
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
    // toggleSettings() {
    //     if (this.settingsPanel) {
    //         this.settingsPanel.classList.toggle('open');
    //     }
        
    // }
    // Add this to your toggleSettings method to debug CSS conflicts
// toggleSettings() {
//     console.log('🔧 toggleSettings() called');
    
//     if (this.settingsPanel) {
//         console.log('Before toggle - classes:', this.settingsPanel.classList.toString());
//         this.settingsPanel.classList.toggle('open');
//         console.log('After toggle - classes:', this.settingsPanel.classList.toString());
        
//         // Debug CSS conflicts
//         if (this.settingsPanel.classList.contains('open')) {
//             console.log('=== CSS DEBUG INFO ===');
            
//             // Get all applied styles
//             const computedStyle = window.getComputedStyle(this.settingsPanel);
//             console.log('Computed right:', computedStyle.right);
//             console.log('Computed position:', computedStyle.position);
//             console.log('Computed z-index:', computedStyle.zIndex);
            
//             // Check if our CSS rule exists
//             const sheets = Array.from(document.styleSheets);
//             let foundOpenRule = false;
            
//             try {
//                 sheets.forEach(sheet => {
//                     if (sheet.href && sheet.href.includes('timer.css')) {
//                         console.log('Found timer.css stylesheet:', sheet.href);
//                         try {
//                             Array.from(sheet.cssRules).forEach(rule => {
//                                 if (rule.selectorText && rule.selectorText.includes('.settings-panel.open')) {
//                                     console.log('Found .settings-panel.open rule:', rule.cssText);
//                                     foundOpenRule = true;
//                                 }
//                             });
//                         } catch (e) {
//                             console.log('Cannot read CSS rules (CORS):', e.message);
//                         }
//                     }
//                 });
//             } catch (error) {
//                 console.log('Error checking stylesheets:', error);
//             }
            
//             if (!foundOpenRule) {
//                 console.log('❌ .settings-panel.open CSS rule not found!');
//             }
            
//             // Force the style as a test
//             console.log('🧪 Testing forced style...');
//             this.settingsPanel.style.right = '0px';
//             setTimeout(() => {
//                 console.log('After forced style - computed right:', window.getComputedStyle(this.settingsPanel).right);
//             }, 100);
//         }
//     }
// }
toggleSettings() {
    console.log('🔧 toggleSettings() called');
    
    if (this.settingsPanel) {
        const isCurrentlyOpen = this.settingsPanel.classList.contains('open');
        console.log('Current state - isOpen:', isCurrentlyOpen);
        
        if (isCurrentlyOpen) {
            // Close the panel
            console.log('🔄 Closing panel...');
            this.settingsPanel.classList.remove('open');
            this.closeSettingsPanel();
        } else {
            // Open the panel
            console.log('🔄 Opening panel...');
            this.settingsPanel.classList.add('open');
            this.openSettingsPanel();
        }
    }
}

// Separate method to open panel with multiple fallbacks
openSettingsPanel() {
    if (!this.settingsPanel) return;
    
    console.log('📖 Opening settings panel...');
    
    // Method 1: Use CSS transform instead of right position
    this.settingsPanel.style.transform = 'translateX(0)';
    this.settingsPanel.style.right = '0px';
    this.settingsPanel.style.display = 'block';
    this.settingsPanel.style.visibility = 'visible';
    
    // Method 2: Force with !important via CSS text
    this.settingsPanel.style.cssText += 'right: 0px !important; transform: translateX(0) !important;';
    
    // Method 3: Use requestAnimationFrame to ensure it sticks
    requestAnimationFrame(() => {
        this.settingsPanel.style.right = '0px';
        this.settingsPanel.style.transform = 'translateX(0)';
        
        // Double-check after a brief delay
        setTimeout(() => {
            const computedRight = window.getComputedStyle(this.settingsPanel).right;
            console.log('Final computed right after opening:', computedRight);
            
            if (computedRight !== '0px') {
                console.log('🚨 Style was overridden, forcing again...');
                this.settingsPanel.style.cssText += 'right: 0px !important; position: fixed !important; z-index: 9999 !important;';
            }
        }, 50);
    });
}

// Separate method to close panel
closeSettingsPanel() {
    if (!this.settingsPanel) return;
    
    console.log('📕 Closing settings panel...');
    
    // Remove the forced styles and let CSS take over
    this.settingsPanel.style.transform = 'translateX(100%)';
    this.settingsPanel.style.right = '-400px';
    
    // Use CSS text for !important
    this.settingsPanel.style.cssText += 'right: -400px !important; transform: translateX(100%) !important;';
    
    // Clean up after animation
    setTimeout(() => {
        if (!this.settingsPanel.classList.contains('open')) {
            this.settingsPanel.style.display = 'block'; // Keep block but hidden
        }
    }, 300);
}
// Add this as a temporary method to your PomodoroTimer class for testing
testPanelManually() {
    console.log('🧪 Testing panel manually...');
    const panel = document.getElementById('settingsPanel');
    
    if (panel) {
        console.log('Panel found, forcing it to show...');
        
        // Remove any existing styles that might interfere
        panel.style.position = 'fixed';
        panel.style.top = '0';
        panel.style.right = '0px';
        panel.style.width = '350px';
        panel.style.height = '100vh';
        panel.style.backgroundColor = 'white';
        panel.style.zIndex = '9999';
        panel.style.border = '2px solid red'; // Make it obvious
        panel.style.transition = 'right 0.3s ease';
        
        console.log('Panel should now be visible with red border');
        
        // Test closing after 3 seconds
        setTimeout(() => {
            console.log('Now hiding panel...');
            panel.style.right = '-400px';
        }, 3000);
        
    } else {
        console.log('❌ Panel not found in DOM');
    }
}

// Call this from console: window.pomodoroTimer.testPanelManually()
    loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
            this.settings = { ...this.settings, ...saved };
            this.updateSettingsUI();
            this.updateSessionButtonDuration('work', this.settings.work);
            this.updateSessionButtonDuration('short', this.settings.shortBreak);
            this.updateSessionButtonDuration('long', this.settings.longBreak);
            
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
    }
    updateSettingsUI() {
        const workDurationInput = document.getElementById('workDuration');
        const workValue = document.getElementById('workValue');
        if (workDurationInput) workDurationInput.value = this.settings.work;
        if (workValue) workValue.textContent = this.settings.work;
        const shortBreakDurationInput = document.getElementById('shortBreakDuration');
        const shortBreakValue = document.getElementById('shortBreakValue');
        if (shortBreakDurationInput) shortBreakDurationInput.value = this.settings.shortBreak;
        if (shortBreakValue) shortBreakValue.textContent = this.settings.shortBreak;
        const longBreakDurationInput = document.getElementById('longBreakDuration');
        const longBreakValue = document.getElementById('longBreakValue');
        if (longBreakDurationInput) longBreakDurationInput.value = this.settings.longBreak;
        if (longBreakValue) longBreakValue.textContent = this.settings.longBreak;
        const autoStartInput = document.getElementById('autoStart');
        if (autoStartInput) autoStartInput.checked = this.settings.autoStart;
        const soundNotificationsInput = document.getElementById('soundNotifications');
        if (soundNotificationsInput) soundNotificationsInput.checked = this.settings.soundNotifications;
    }
    async playNotificationSound() {
        console.log('=== ATTEMPTING TO PLAY SOUND ===');

        if (!this.settingsReady) {
            console.log('⚠️ Settings not ready, using defaults');
            await this.playBeepSound(0.8);
            return;
        }

        // First check if sound is enabled from timer's own settings
        if (this.settings && this.settings.soundNotifications === false) {
            console.log('Timer sound is disabled in timer settings');
            return;
        }

        // Get sound settings - try multiple sources
        let soundType = 'bell';
        let volume = 0.8;
        let soundEnabled = true;
        let customSoundPath = null;

        // Try to get from settingsCore first
        if (window.settingsCore && window.settingsCore.isInitialized) {
            const settings = window.settingsCore.getCurrentSettings();
            if (settings.timer) {
                soundType = settings.timer.soundType || 'bell';
                volume = settings.timer.volume || 0.8;
                soundEnabled = settings.timer.soundEnabled !== false;
                customSoundPath = settings.timer.customSoundPath;
                console.log('🎵 Using settings from settingsCore:', { soundType, volume, soundEnabled });
            }
        }
        // Priority 2: currentTimerSettings
        else if (this.currentTimerSettings) {
            soundType = this.currentTimerSettings.soundType || 'bell';
            volume = this.currentTimerSettings.volume || 0.8;
            soundEnabled = this.currentTimerSettings.soundEnabled !== false;
            customSoundPath = this.currentTimerSettings.customSoundPath;
            console.log('🎵 Using currentTimerSettings:', { soundType, volume, soundEnabled });
        }

        else {
            // Fallback to timer's own settings
            soundEnabled = this.settings ? this.settings.soundNotifications : true;
            console.log('Using timer local settings, sound enabled:', soundEnabled);
        }

        if (!soundEnabled) {
            console.log('🔇Sound notifications are disabled');
            return;
        }

        try {
            // First try: Use the local SOUND_REGISTRY (imported at the top)
            if (SOUND_REGISTRY && SOUND_REGISTRY[soundType]) {
                console.log(`Playing sound from local SOUND_REGISTRY: ${soundType}`);
                const sound = SOUND_REGISTRY[soundType];
                const audio = new Audio(sound.path);
                audio.volume = volume;
                await audio.play();
                console.log('Successfully played sound from local SOUND_REGISTRY');
                return;
            }

            if (soundFile) {
                console.log(`Playing ${soundType} from direct import:`, soundFile);
                const audio = new Audio(soundFile);
                audio.volume = volume;
                await audio.play();
                console.log(`Successfully played ${soundType} from direct import`);
                return;
            }

            // Fallback to generated beep
            console.log('No sound file found, using fallback beep sound');
            await this.playBeepSound(volume);

        } catch (error) {
            console.error('Error playing notification sound:', error);
            // Final fallback
            try {
                await this.playBeepSound(volume);
                console.log('Played fallback beep sound');
            } catch (beepError) {
                console.error('Even fallback beep failed:', beepError);
            }
        }
    }
// Add this helper method for the beep fallback
async playBeepSound(volume = 0.8) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Return a promise that resolves when the sound ends
    return new Promise(resolve => {
        setTimeout(resolve, 600);
    });
}
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        if (this.timerContainer) {
            this.timerContainer.classList.remove('work', 'break', 'shortbreak', 'longbreak', 'running');
        }
        if (window.electronAPI && window.electronAPI.removeTimerSettingsListener) {
                window.electronAPI.removeTimerSettingsListener();
        }
    }
}

export default PomodoroTimer;

if (typeof window !== 'undefined') {
    window.PomodoroTimer = PomodoroTimer;
}