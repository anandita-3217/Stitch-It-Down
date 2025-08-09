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
let currentFilter = 'all';
let currentSearchQuery = '';

function initialize() {
    loadAllImages();
    setDailyQuote();
    // debugFunctions();
    initTheme();
    console.log('Initializing NotesManager...');
    window.noteManager = new NotesManager(); 
    noteManager = window.noteManager;

    requestNotificationPermission();
    setupKeyboardShortcuts();
    setupExportImport();
    setupViewModeButtons();
    
    // Initialize view mode from localStorage
    const savedViewMode = localStorage.getItem('noteViewMode') || 'grid';
    setViewMode(savedViewMode);
}

function debugFunctions() {
    console.log('Functions check:');
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}
function setupKeyboardShortcuts() {
    console.log('Setting up keyboard shortcuts...');
    
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: New note (focus input)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const noteInput = document.getElementById('noteInput');
            if (noteInput) {
                noteInput.focus();
            }
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('note-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + E: Export notes
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (noteManager) {
                noteManager.exportNotes();
            }
        }
        
        // Escape: Clear search or close modals
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('note-search');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                currentSearchQuery = '';
                // performSearch('');
            }
        }
    });
    
    console.log('✓ Keyboard shortcuts setup complete');
}

function setupExportImport() {
    console.log('Setting up export/import functionality...');
    
    const exportBtn = document.getElementById('exportNotes');
    const importBtn = document.getElementById('importNotes');
    const importFile = document.getElementById('importFile');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (noteManager) {
                noteManager.exportNotes();
                showNotification('Notes exported successfully!', 'success');
            }
        });
    }
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const success = noteManager.importNotes(event.target.result);
                        if (success) {
                            showNotification('Notes imported successfully!', 'success');
                        } else {
                            showNotification('Failed to import notes. Invalid format.', 'error');
                        }
                    } catch (error) {
                        showNotification('Error importing notes: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            } else {
                showNotification('Please select a valid JSON file', 'error');
            }
            
            // Reset file input
            e.target.value = '';
        });
    }
    
    console.log('✓ Export/import setup complete');
}

function setupViewModeButtons() {
    console.log('Setting up view mode buttons...');
    
    const viewModeButtons = document.querySelectorAll('.view-mode-btn');
    viewModeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            setViewMode(mode);
        });
    });
    
    console.log('✓ View mode buttons setup complete');
}

function setViewMode(mode) {
    const notesContainer = document.getElementById('notesContainer');
    if (notesContainer) {
        notesContainer.className = notesContainer.className.replace(/view-\w+/, '');
        notesContainer.classList.add(`view-${mode}`);
    }
    
    // Update active view button
    const viewButtons = document.querySelectorAll('.view-mode-btn');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    
    // Save preference
    localStorage.setItem('noteViewMode', mode);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Browser notification for important events
    if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Stitch Notes', {
            body: message,
            icon: '@assets/images/characters/stitch-icon.png' // Adjust path as needed
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
        const { type, note } = event.detail;
    switch (type) {
        case 'note-added':
            showNotification('Note created successfully!', 'success');
            break;
        case 'note-updated':
            showNotification('Note updated successfully!', 'success');
            break;
        case 'note-deleted':
            showNotification('Note deleted', 'info');
            break;
        // case 'note-pinned':
        //     showNotification(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
        //     break;
        // case 'note-archived':
        //     showNotification(note.archived ? 'Note archived' : 'Note unarchived', 'info');
        //     break;
    }
});

window.noteRenderer = {
    setViewMode,
    showNotification
};

console.log('Notes page loaded');