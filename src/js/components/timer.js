class PomodoroTimer {
    constructor() {
        this.currentTime = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.currentSession = 'work';
        this.sessionCount = 1;
        this.totalSessions = 0;
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
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
        this.updateStats();
    }
    
    bindElements() {
        // Timer elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionType = document.getElementById('sessionType');
        this.motivationText = document.getElementById('motivationText');
        this.sessionCountEl = document.getElementById('sessionCount');
        
        // Progress ring
        this.progressRing = document.querySelector('.progress-ring-progress');
        this.circumference = 2 * Math.PI * 130; // radius = 130
        this.progressRing.style.strokeDasharray = this.circumference;
        
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
        this.totalTime = document.getElementById('totalTime');
        this.streak = document.getElementById('streak');
        
        // Timer container
        this.timerContainer = document.querySelector('.timer-container');
    }
    
    bindEvents() {
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.skipBtn.addEventListener('click', () => this.skipSession());
        
        this.sessionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSession(e));
        });
        
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.closeSettings.addEventListener('click', () => this.toggleSettings());
        
        // Settings inputs
        document.getElementById('workDuration').addEventListener('input', (e) => {
            this.settings.work = parseInt(e.target.value);
            document.getElementById('workValue').textContent = e.target.value;
            if (this.currentSession === 'work') this.resetTimer();
        });
        
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
        this.timerContainer.classList.add('running');
        this.startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        this.startPauseBtn.classList.remove('pulse');
        
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
        this.timerContainer.classList.remove('running');
        this.startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
        this.startPauseBtn.classList.add('pulse');
        clearInterval(this.interval);
        
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
        
        // Auto-switch to next session
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
        
        // Update active button
        this.sessionBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
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
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update session type
        const sessionTypes = {
            work: 'Focus Time',
            short: 'Short Break',
            long: 'Long Break'
        };
        this.sessionType.textContent = sessionTypes[this.currentSession];
        
        // Update session counter
        this.sessionCountEl.textContent = this.sessionCount;
    }
    
    updateProgress() {
        const progress = (this.totalTime - this.currentTime) / this.totalTime;
        const offset = this.circumference - (progress * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    updateTheme() {
        this.timerContainer.classList.remove('work', 'break');
        if (this.currentSession === 'work') {
            this.timerContainer.classList.add('work');
        } else {
            this.timerContainer.classList.add('break');
        }
    }
    
    updateStitchState(state) {
        const gifs = {
            ready: '../assets/gifs/stitch-hyping.gif',
            working: '../assets/gifs/stitch-dancing.gif',
            paused: '../assets/gifs/stitch-eating.gif',
            complete: '../assets/gifs/stitch-love.gif',
            break: '../assets/gifs/stitch-sleeping.gif'
        };
        
        let gif = gifs[state];
        if (this.currentSession !== 'work' && state === 'working') {
            gif = gifs.break;
        }
        
        this.stitchImg.src = gif;
        
        // Update speech bubble
        let quotes;
        if (state === 'complete') {
            quotes = this.stitchQuotes.complete;
        } else if (this.currentSession === 'work') {
            quotes = this.stitchQuotes.work;
        } else {
            quotes = this.stitchQuotes.break;
        }
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.stitchSpeech.textContent = randomQuote;
    }
    
    updateStats() {
        // This would typically save to localStorage or send to backend
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
        if (!stats[today]) {
            stats[today] = { completed: 0, totalTime: 0 };
        }
        
        if (this.currentSession === 'work') {
            stats[today].completed++;
            stats[today].totalTime += this.settings.work;
        }
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
        // Update display
        this.todayPomodoros.textContent = stats[today].completed;
        this.totalTime.textContent = `${Math.floor(stats[today].totalTime / 60)}h ${stats[today].totalTime % 60}m`;
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
        this.settingsPanel.classList.toggle('open');
    }
    
    loadSettings() {
        const saved = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
        this.settings = { ...this.settings, ...saved };
    }
    
    playNotificationSound() {
        // Create a simple beep sound
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
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

export default PomodoroTimer;