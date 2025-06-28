// note-renderer.js 
// CSS imports
import '@css/main.css';
import '@css/components/notes.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

// Import NoteManager
import NoteManager from '@components/notes.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

let noteManager;

// function initialize() {
//     loadAllImages();
//     setDailyQuote();
//     debugFunctions();
//     initTheme();
    
//     // Initialize NoteManager
//     noteManager = new NoteManager();
    
//     // Request notification permission
//     requestNotificationPermission();
    
//     // Setup note filters if they exist
//     setupNoteFilters();
// }
// Replace your current initialize function with this enhanced version
function initialize() {
    loadAllImages();
    setDailyQuote();
    // debugFunctions();
    initTheme();
    console.log('Initializing NoteManager...');
    window.noteManager = new NoteManager(); // Make globally accessible
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
function debugNoteCompletion() {
    console.log('=== TASK COMPLETION DEBUG ===');
    
    // Check if NoteManager instance exists
    if (window.noteManager) {
        const notes = window.noteManager.getNotes();
        console.log('Total notes:', notes.length);
        console.log('Notes:', notes);
        
        // Check each note's structure
        notes.forEach((note, index) => {
            console.log(`Note ${index}:`, {
                id: note.id,
                text: note.text,
                completed: note.completed,
                hasValidId: !isNaN(note.id) && note.id !== null && note.id !== undefined
            });
        });
    } else {
        console.log('NoteManager instance not found in window object');
    }
    
    // Check DOM elements
    const checkboxes = document.querySelectorAll('.note-checkbox');
    console.log('Checkboxes found:', checkboxes.length);
    
    checkboxes.forEach((checkbox, index) => {
        const noteId = checkbox.getAttribute('data-note-id');
        console.log(`Checkbox ${index}:`, {
            noteId: noteId,
            checked: checkbox.checked,
            hasEventListener: checkbox.onclick !== null || checkbox.onchange !== null
        });
    });
    
    // Check if notes container exists
    const notesContainer = document.getElementById('notesContainer');
    console.log('Notes container found:', !!notesContainer);
    
    console.log('=== END DEBUG ===');
}

// Add this to window for easy debugging
window.debugNoteCompletion = debugNoteCompletion;



function setupNoteFilters() {
    // Priority filter
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            const priority = e.target.value;
            if (priority === 'all') {
                noteManager.displayNotes();
            } else {
                noteManager.displayNotes(note => note.priority === priority);
            }
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            switch(status) {
                case 'all':
                    noteManager.displayNotes();
                    break;
                case 'completed':
                    noteManager.displayNotes(note => note.completed);
                    break;
                case 'pending':
                    noteManager.displayNotes(note => !note.completed);
                    break;
                case 'overdue':
                    noteManager.displayNotes(note => 
                        note.deadline && noteManager.isOverdue(note.deadline) && !note.completed
                    );
                    break;
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('note-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (searchTerm === '') {
                noteManager.displayNotes();
            } else {
                noteManager.displayNotes(note => 
                    note.text.toLowerCase().includes(searchTerm)
                );
            }
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