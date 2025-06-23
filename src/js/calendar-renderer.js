// CSS imports
import '@css/main.css';
import '@css/components/calendar.css';
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
    
} from '@components/utils.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

function initialize() {
    loadAllImages(); // Load all images including random gif
    initTheme();
    setDailyQuote();
    
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

console.log('Calendar page loaded');

// Add any tasks-specific functionality here
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Calendar page DOM loaded');
//     // Calendar page initialization
// });