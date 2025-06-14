// import '@css/main.css'
// import '@css/components/timer.css';
// import '@css/components/sidebar.css';
// import '@components/sidebar.js';
// import '@components/timer.js';

// // GIF imports
// import stitchClothes from '@assets/gifs/stitch-clothes.gif';
// import stitchDancing from '@assets/gifs/stitch-dancing.gif';
// import stitchEating from '@assets/gifs/stitch-eating.gif';
// import stitchFrustrated from '@assets/gifs/stitch-frustrated.gif';
// import stitchHyping from '@assets/gifs/stitch-hyping.gif';
// import stitchLove from '@assets/gifs/stitch-love.gif';
// import stitchShocked from '@assets/gifs/stitch-shocked.gif';
// import stitchSinging from '@assets/gifs/stitch-singing.gif';
// import stitchSleeping from '@assets/gifs/stitch-sleeping.gif';
// import stitchTantrum from '@assets/gifs/stitch-tantrum.gif';
// import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
// import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';
// // PNG imports
// import stitchHappy from '@assets/images/characters/stitch-happy.png';
// import stitchIcon from '@assets/images/characters/stitch-icon.png';
// import stitchWink from '@assets/images/characters/stitch-wink.png';

// // Create an image registry
// const images = {
//     characters: {
//     happy: stitchHappy,
//     icon: stitchIcon,
//     wink: stitchWink,
//     corner1: stitchCorner1,
//     corner2: stitchCorner2
//     },
//     gifs: {
//     clothes: stitchClothes,
//     dancing: stitchDancing,
//     eating: stitchEating,
//     frustrated: stitchFrustrated,
//     hyping: stitchHyping,
//     love: stitchLove,
//     shocked: stitchShocked,
//     singing: stitchSinging,
//     sleeping: stitchSleeping,
//     tantrum: stitchTantrum
//     }
// };

// const quotes = [
//     "Ohana means family. Family means nobody gets left behind or forgotten.",
//     "This is my family. I found it all on my own. It's little, and broken, but still good. Yeah, still good.",
//     "Also cute and fluffy!",
//     "Aloha! Today is a new day to make progress!",
//     "Sometimes you try your hardest, but things don't work out. Sometimes things don't go according to plan.",
//     "I like you better as you.",
//     "Remember to feed your fish! If you give him food, he will be your friend.",
//     "Family is always there for you, even when no one else is.",
//     "Just because we look different doesn't mean we aren't family."
// ];

// const gifKeys = [
//     'clothes',
//     'dancing',
//     'eating',
//     'frustrated',
//     'hyping',
//     'love',
//     'shocked',
//     'singing',
//     'sleeping',
//     'tantrum'
// ];


// function setImage(elementId, category, imageName) {
//     // sets an image to a given elementId
//     const element = document.getElementById(elementId);
//     if (element && images[category] && images[category][imageName]) {
//     element.src = images[category][imageName];
//     }
// }
// function setDailyQuote() {
//     // Daily refreshes a quote
//     const quoteElement = document.querySelector('.daily-quote');
//     if (!quoteElement) return;

//     const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-30"
//     const stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};

//     if (stored.date === today && stored.quote) {
//         quoteElement.textContent = stored.quote;
//         return;
//     }

//     // Pick a new quote randomly
//     const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
//     localStorage.setItem('dailyQuote', JSON.stringify({ date: today, quote: newQuote }));
//     quoteElement.textContent = newQuote;
// }
// function setRandomGif() {
//     // Sets a random gif everytime the app starts
//     const gifId = 'stitch-mood-gif'; // Your <img> ID
//     const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
//     setImage(gifId, 'gifs', randomKey);
// }


// // Timer-specific initialization
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('DOM loaded, timer page...'); // Debug log
    
//     // Set up images
//     setImage('happy-stitch', 'characters', 'happy');
//     setImage('icon-stitch', 'characters', 'icon');
//     setImage('wink-stitch', 'characters', 'wink');
//     setImage('corner1-stitch', 'characters', 'corner1');
//     setImage('corner2-stitch', 'characters','corner2');
    
//     setImage('clothes-stitch', 'gifs', 'clothes');
//     setImage('dancing-stitch', 'gifs', 'dancing');
//     setImage('eating-stitch', 'gifs', 'eating');
//     setImage('frustrated-stitch', 'gifs', 'frustrated');
//     setImage('hyping-stitch', 'gifs', 'hyping');
//     setImage('love-stitch', 'gifs', 'love');
//     setImage('shocked-stitch', 'gifs', 'shocked');
//     setImage('singing-stitch', 'gifs', 'singing');
//     setImage('tantrum-stitch', 'gifs', 'tantrum');
//     setRandomGif();
//    // Initialize theme
//    const savedTheme = localStorage.getItem('theme') || 'light';
//    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
   
//    // Add some timer-specific enhancements
//    addTimerEnhancements();
// });

// function addTimerEnhancements() {
//    // Add keyboard shortcuts info
//    const shortcutsInfo = document.createElement('div');
//    shortcutsInfo.className = 'shortcuts-info';
//    shortcutsInfo.innerHTML = `
//        <div class="shortcuts-toggle" id="shortcutsToggle">?</div>
//        <div class="shortcuts-panel" id="shortcutsPanel">
//            <h4>Keyboard Shortcuts</h4>
//            <div class="shortcut"><kbd>Space</kbd> Start/Pause timer</div>
//            <div class="shortcut"><kbd>R</kbd> Reset timer</div>
//            <div class="shortcut"><kbd>S</kbd> Skip session</div>
//            <div class="shortcut"><kbd>Ctrl+B</kbd> Toggle sidebar</div>
//        </div>
//    `;
//    document.body.appendChild(shortcutsInfo);
   
//    // Add shortcuts panel toggle
//    document.getElementById('shortcutsToggle').addEventListener('click', () => {
//        document.getElementById('shortcutsPanel').classList.toggle('show');
//    });
   
//    // Add more keyboard shortcuts
//    document.addEventListener('keydown', (e) => {
//        if (e.target.matches('input')) return;
       
//        switch(e.key.toLowerCase()) {
//            case 'r':
//                e.preventDefault();
//                document.getElementById('resetBtn').click();
//                break;
//            case 's':
//                e.preventDefault();
//                document.getElementById('skipBtn').click();
//                break;
//        }
//    });
// }

// timer-renderer.js - Timer window renderer process
import PomodoroTimer from '@components/timer.js';
import '@css/main.css'
import '@css/components/timer.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import '@components/timer.js';

// Global timer instance for this window
let timerInstance = null;

function initTheme() {
    
    let savedTheme = 'light'; // default
    try {
        savedTheme = localStorage.getItem('stitchTheme') || 'light';
    } catch (error) {
        console.warn('localStorage not available, using default theme');
    }
    
    setTheme(savedTheme);
    
    // Set up the theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
        themeToggle.checked = savedTheme === 'dark';
    } else {
        console.error('Theme toggle element not found');
    }
}

function setTheme(theme) {
    // Validate theme value
    if (theme !== 'light' && theme !== 'dark') {
        theme = 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme); // Also set on body for better CSS targeting
    
    // Save to localStorage if available
    try {
        localStorage.setItem('stitchTheme', theme);
    } catch (error) {
        console.warn('Could not save theme to localStorage');
    }
    
    // Update toggle state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
    }
    
    console.log(`Theme set to: ${theme}`); // Debug log
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
    setTheme(newTheme);
}

// Initialize timer when DOM is ready
function initializeTimer() {
    if (timerInstance) {
        // Clean up existing instance
        timerInstance.destroy();
    }
    
    console.log('Initializing Pomodoro Timer...');
    
    try {
        timerInstance = new PomodoroTimer();
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTimer);
} else {
    initTheme();
    initializeTimer();
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
        cleanup: cleanupTimer
    };
}