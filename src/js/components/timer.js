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
            this.setDefaultSession(); // Add this line to set default session
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
    
    // Add this new method to set the default session
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
    const clickedButton = e.target.closest('.session-btn'); // Use closest to handle clicks on child elements
    
    // If the clicked button is already active, don't allow deactivation
    if (clickedButton && clickedButton.classList.contains('active')) {
        return; // Exit early, keeping the current active state
    }
    
    const type = clickedButton.dataset.type;
    const duration = parseInt(clickedButton.dataset.duration);
    
    this.currentSession = type;
    this.currentTime = duration * 60;
    this.totalTime = this.currentTime;
    
    // Update active button - add null check
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
            // Ensure sessionCount is always a valid number
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