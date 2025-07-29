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
            this.setDefaultSession();
            this.updateDisplay();
            this.updateStats();
            this.addToggleEnhancements();
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

                // Optional: Add haptic feedback on mobile devices
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            });
        });
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
        
        // Update theme and display
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
        
        if (this.settingsToggle) {
            this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        }
        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', () => this.toggleSettings());
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
            console.log(`Updated Stitch GIF to: ${gifKey}`, this.images.gifs[gifKey]);
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
    toggleSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.toggle('open');
        }
    }
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
    if (this.timerContainer) {
        this.timerContainer.classList.remove('work', 'break', 'shortbreak', 'longbreak', 'running');
    }
}
}

export default PomodoroTimer;

if (typeof window !== 'undefined') {
    window.PomodoroTimer = PomodoroTimer;
}