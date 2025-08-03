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
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';    
import 'bootstrap-icons/font/bootstrap-icons.css';
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
(async () => {
    console.log('🚀 Timer page starting...');
    
    // Initialize SettingsCore first if not already done
    if (!window.settingsCore) {
        const { SettingsCore } = await import('@components/settings.js');
        window.settingsCore = new SettingsCore();
        await window.settingsCore.init();
    } else if (!window.settingsCore.isInitialized) {
        await window.settingsCore.init();
    }
    
    // Now initialize timer and other components
    // Your existing timer initialization code goes here
    
    console.log('✅ Timer page fully initialized');
})();

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
// In your timer page HTML or initialization script
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for settings to be available
    let attempts = 0;
    while (!window.settingsCore && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (window.settingsCore) {
        console.log('Settings core found, initializing timer...');
    } else {
        console.warn('Settings core not found after waiting, timer will use localStorage settings');
    }
    
    // Now initialize timer
    const timer = new PomodoroTimer();
    window.pomodoroTimer = timer;
});