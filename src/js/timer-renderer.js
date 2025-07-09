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