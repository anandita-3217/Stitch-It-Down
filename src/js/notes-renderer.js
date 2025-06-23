// CSS imports
import '@css/main.css';
import '@css/components/notes.css';
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
    initTheme();
    setDailyQuote();
}

console.log('Notes page loaded');
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

