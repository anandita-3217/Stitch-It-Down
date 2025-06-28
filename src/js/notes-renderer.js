// note-renderer.js 
// CSS imports
import '@css/main.css';
import '@css/components/notes.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

// Import NotesManager
import NotesManager from '@components/notes.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

let noteManager;


function initialize() {
    loadAllImages();
    setDailyQuote();
    // debugFunctions();
    initTheme();
    console.log('Initializing NotesManager...');
    window.noteManager = new NotesManager(); // Make globally accessible
    noteManager = window.noteManager;

    
    requestNotificationPermission();
    setupNoteFilters();
}


function debugFunctions() {
    const now = new Date();
    console.log('Functions check:');
    console.log('setDailyQuote:', typeof window.setDailyQuote);
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

// Listen for note updates from other modules
document.addEventListener('noteUpdate', (event) => {
    console.log('Note update received:', event.detail);
    // Handle cross-module note updates if needed
});

console.log('Notes page loaded');