// CSS imports
import '@css/main.css';
import '@css/components/tasks.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
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
function initialize() {
    loadAllImages(); // Load all images including random gif
    setDailyQuote();
    initTheme();
    
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

console.log('Tasks page loaded');
