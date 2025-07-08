// // TODO:4 Need to make my own version of Wordle.
// // TODO:5 Need to make gamification and streaks. 
// // TODO:6 Add a preload file properly.

// CSS imports
import '@css/main.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

import 'bootstrap-icons/font/bootstrap-icons.css';
function initializeApp() {
    console.log('Initializing Stitch Productivity Tool...');
    loadAllImages();
    initTheme();
    setDailyQuote();
    updateDate();
    // Set up event listeners
    setupEventListeners();
    console.log('App initialized successfully!');
}



function setSidebarGif() {
    // Sets a random gif everytime the app starts
    const gifId = 'stitch-mood-gif'; // Your <img> ID
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Add any additional event listeners here
    // For example, if you have navigation buttons, productivity tool controls, etc.
    
    // Example: Add refresh quote button if it exists
    const refreshQuoteBtn = document.getElementById('refresh-quote');
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', () => {
            // Force refresh the quote
            dailyQuoteState.date = null;
            setDailyQuote();
        });
    }
    
    // Example: Add random gif refresh buttons
    const refreshTimerGif = document.getElementById('refresh-timer-gif');
    if (refreshTimerGif) {
        refreshTimerGif.addEventListener('click', setRandomGif);
    }
    
    const refreshSidebarGif = document.getElementById('refresh-sidebar-gif');
    if (refreshSidebarGif) {
        refreshSidebarGif.addEventListener('click', setSidebarGif);
    }
}

// Utility functions for external use





// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setTheme,
        toggleTheme,
        // getRandomQuote,
        // getRandomGifKey,
        // getCurrentTheme,
        setImage,
        setRandomGif,
        setSidebarGif
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle window events
window.addEventListener('beforeunload', () => {
    console.log('Landing page unloading...');
    // Clean up any intervals or event listeners if needed
});

// Electron-specific: Handle renderer process errors
window.addEventListener('error', (error) => {
    console.error('Renderer process error:', error);
});

// Optional: Expose some functions to global scope for debugging
window.stitchApp = {
    setTheme,
    toggleTheme,
    setRandomGif,
    setSidebarGif,
    // getRandomQuote,
    // getCurrentTheme
};
