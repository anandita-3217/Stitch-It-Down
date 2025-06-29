// // note-renderer.js 
// // CSS imports
// import '@css/main.css';
// import '@css/components/notes.css';
// import '@css/components/sidebar.css';
// import '@components/sidebar.js';
// import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

// // Import NotesManager
// import NotesManager from '@components/notes.js';

// import 'bootstrap-icons/font/bootstrap-icons.css';

// let noteManager;


// function initialize() {
//     loadAllImages();
//     setDailyQuote();
//     // debugFunctions();
//     initTheme();
//     console.log('Initializing NotesManager...');
//     window.noteManager = new NotesManager(); // Make globally accessible
//     noteManager = window.noteManager;

    
//     requestNotificationPermission();
//     setupNoteFilters();
// }


// function debugFunctions() {
//     const now = new Date();
//     console.log('Functions check:');
//     console.log('setDailyQuote:', typeof window.setDailyQuote);
// }

// function requestNotificationPermission() {
//     if ('Notification' in window && Notification.permission === 'default') {
//         Notification.requestPermission().then(permission => {
//             console.log('Notification permission:', permission);
//         });
//     }
// }


// // Initialize when DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initialize);
// } else {
//     // DOM is already ready
//     initialize();
// }

// // Listen for note updates from other modules
// document.addEventListener('noteUpdate', (event) => {
//     console.log('Note update received:', event.detail);
//     // Handle cross-module note updates if needed
// });

// console.log('Notes page loaded');
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
    window.noteManager = new NotesManager(); // Make globally accessible
    noteManager = window.noteManager;

    requestNotificationPermission();
    setupNoteFilters();
    setupSearchFunctionality();
    setupNoteActions();
    setupKeyboardShortcuts();
    setupExportImport();
    setupBulkActions();
    
    // Update stats periodically
    updateNoteStats();
    setInterval(updateNoteStats, 30000); // Update every 30 seconds
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

function setupNoteFilters() {
    console.log('Setting up note filters...');
    
    // Create filter container if it doesn't exist
    const filtersContainer = document.getElementById('noteFilters') || createFiltersContainer();
    
    // Filter buttons
    const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');
            setActiveFilter(button, filterType);
            applyFilter(filterType);
        });
    });

    // Category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            const category = categoryFilter.value;
            if (category === 'all') {
                applyFilter('all');
            } else {
                applyFilter('category', category);
            }
        });
    }

    // Color filter
    const colorFilter = document.getElementById('colorFilter');
    if (colorFilter) {
        colorFilter.addEventListener('change', () => {
            const color = colorFilter.value;
            if (color === 'all') {
                applyFilter('all');
            } else {
                applyFilter('color', color);
            }
        });
    }

    // View mode toggle
    const viewModeButtons = document.querySelectorAll('.view-mode-btn');
    viewModeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            setViewMode(mode);
        });
    });

    console.log('✓ Note filters setup complete');
}

function createFiltersContainer() {
    const container = document.createElement('div');
    container.id = 'noteFilters';
    container.className = 'note-filters';
    container.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <button class="filter-btn active" data-filter="all">
                    <i class="bi bi-grid"></i> All Notes
                </button>
                <button class="filter-btn" data-filter="pinned">
                    <i class="bi bi-pin-angle-fill"></i> Pinned
                </button>
                <button class="filter-btn" data-filter="archived">
                    <i class="bi bi-archive-fill"></i> Archived
                </button>
                <button class="filter-btn" data-filter="recent">
                    <i class="bi bi-clock"></i> Recent
                </button>
            </div>
            
            <div class="filter-group">
                <select id="categoryFilter" class="filter-select">
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="ideas">Ideas</option>
                    <option value="reminders">Reminders</option>
                    <option value="quotes">Quotes</option>
                    <option value="research">Research</option>
                </select>
                
                <select id="colorFilter" class="filter-select">
                    <option value="all">All Colors</option>
                    <option value="default">Default</option>
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="pink">Pink</option>
                    <option value="purple">Purple</option>
                </select>
            </div>
            
            <div class="filter-group">
                <button class="view-mode-btn active" data-mode="grid">
                    <i class="bi bi-grid-3x3-gap"></i>
                </button>
                <button class="view-mode-btn" data-mode="list">
                    <i class="bi bi-list"></i>
                </button>
            </div>
        </div>
    `;
    
    // Insert before notes container
    const notesContainer = document.getElementById('notesContainer');
    if (notesContainer && notesContainer.parentNode) {
        notesContainer.parentNode.insertBefore(container, notesContainer);
    }
    
    return container;
}

function setupSearchFunctionality() {
    console.log('Setting up search functionality...');
    
    const searchInput = document.getElementById('note-search') || createSearchInput();
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        // Real-time search
        searchInput.addEventListener('input', debounce(() => {
            const query = searchInput.value.trim();
            currentSearchQuery = query;
            performSearch(query);
        }, 300));
        
        // Search on enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                currentSearchQuery = query;
                performSearch(query);
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            performSearch('');
        });
    }
    
    console.log('✓ Search functionality setup complete');
}

function createSearchInput() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-input-group">
            <i class="bi bi-search search-icon"></i>
            <input type="text" id="note-search" placeholder="Search notes, categories, or tags..." class="search-input">
            <button id="clearSearch" class="clear-search-btn" title="Clear search">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    // Insert at the top of the page
    const mainContent = document.querySelector('.main-content') || document.body;
    const firstChild = mainContent.firstChild;
    mainContent.insertBefore(searchContainer, firstChild);
    
    return searchContainer.querySelector('#note-search');
}

function setupNoteActions() {
    console.log('Setting up note actions...');
    
    // Bulk selection
    const selectAllBtn = document.getElementById('selectAll');
    const deleteSelectedBtn = document.getElementById('deleteSelected');
    const archiveSelectedBtn = document.getElementById('archiveSelected');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAll);
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedNotes);
    }
    
    if (archiveSelectedBtn) {
        archiveSelectedBtn.addEventListener('click', archiveSelectedNotes);
    }
    
    console.log('✓ Note actions setup complete');
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
                performSearch('');
            }
        }
    });
    
    console.log('✓ Keyboard shortcuts setup complete');
}

function setupExportImport() {
    console.log('Setting up export/import functionality...');
    
    const exportBtn = document.getElementById('exportNotes') || createExportImportButtons().exportBtn;
    const importBtn = document.getElementById('importNotes') || createExportImportButtons().importBtn;
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
                            updateNoteStats();
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

function createExportImportButtons() {
    const container = document.createElement('div');
    container.className = 'export-import-container';
    container.innerHTML = `
        <div class="action-buttons">
            <button id="exportNotes" class="action-btn export-btn" title="Export notes">
                <i class="bi bi-download"></i> Export
            </button>
            <button id="importNotes" class="action-btn import-btn" title="Import notes">
                <i class="bi bi-upload"></i> Import
            </button>
            <input type="file" id="importFile" accept=".json" style="display: none;">
        </div>
    `;
    
    // Insert in the filters area or create a toolbar
    const filtersContainer = document.getElementById('noteFilters');
    if (filtersContainer) {
        filtersContainer.appendChild(container);
    }
    
    return {
        exportBtn: container.querySelector('#exportNotes'),
        importBtn: container.querySelector('#importNotes')
    };
}

function setupBulkActions() {
    console.log('Setting up bulk actions...');
    
    // Create bulk actions toolbar if it doesn't exist
    const bulkToolbar = document.getElementById('bulkToolbar') || createBulkToolbar();
    
    console.log('✓ Bulk actions setup complete');
}

function createBulkToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'bulkToolbar';
    toolbar.className = 'bulk-toolbar hidden';
    toolbar.innerHTML = `
        <div class="bulk-actions">
            <span class="selection-count">0 selected</span>
            <button id="selectAll" class="bulk-btn">
                <i class="bi bi-check-all"></i> Select All
            </button>
            <button id="archiveSelected" class="bulk-btn">
                <i class="bi bi-archive"></i> Archive
            </button>
            <button id="deleteSelected" class="bulk-btn danger">
                <i class="bi bi-trash"></i> Delete
            </button>
            <button id="clearSelection" class="bulk-btn">
                <i class="bi bi-x"></i> Clear
            </button>
        </div>
    `;
    
    const notesContainer = document.getElementById('notesContainer');
    if (notesContainer && notesContainer.parentNode) {
        notesContainer.parentNode.insertBefore(toolbar, notesContainer);
    }
    
    return toolbar;
}

// Filter and search functions
function setActiveFilter(button, filterType) {
    // Remove active class from all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    currentFilter = filterType;
}

function applyFilter(filterType, filterValue = null) {
    if (!noteManager) return;
    
    let filterFunction = null;
    
    switch (filterType) {
        case 'all':
            filterFunction = null; // Show all notes
            break;
        case 'pinned':
            filterFunction = (note) => note.pinned && !note.archived;
            break;
        case 'archived':
            filterFunction = (note) => note.archived;
            break;
        case 'recent':
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            filterFunction = (note) => new Date(note.timestamp) > twoDaysAgo && !note.archived;
            break;
        case 'category':
            filterFunction = (note) => note.category === filterValue && !note.archived;
            break;
        case 'color':
            filterFunction = (note) => note.color === filterValue && !note.archived;
            break;
        default:
            filterFunction = null;
    }
    
    // Apply search if there's a current search query
    if (currentSearchQuery) {
        const searchResults = noteManager.searchNotes(currentSearchQuery);
        if (filterFunction) {
            const filteredResults = searchResults.filter(filterFunction);
            noteManager.displayNotes((note) => filteredResults.includes(note));
        } else {
            noteManager.displayNotes((note) => searchResults.includes(note));
        }
    } else {
        noteManager.displayNotes(filterFunction);
    }
    
    updateNoteStats();
}

function performSearch(query) {
    if (!noteManager) return;
    
    if (!query) {
        // No search query, apply current filter
        applyFilter(currentFilter);
        return;
    }
    
    const searchResults = noteManager.searchNotes(query);
    noteManager.displayNotes((note) => searchResults.includes(note));
    updateNoteStats();
    
    // Update search UI
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = query ? 'block' : 'none';
    }
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

function updateNoteStats() {
    if (!noteManager) return;
    
    const notes = noteManager.getNotes();
    const pinnedNotes = noteManager.getPinnedNotes();
    const archivedNotes = noteManager.getArchivedNotes();
    
    // Update stats display
    const statsContainer = document.getElementById('noteStats') || createStatsContainer();
    
    const totalWords = notes.reduce((sum, note) => sum + (note.wordCount || 0), 0);
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${notes.length}</span>
            <span class="stat-label">Total Notes</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${pinnedNotes.length}</span>
            <span class="stat-label">Pinned</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${archivedNotes.length}</span>
            <span class="stat-label">Archived</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${totalWords}</span>
            <span class="stat-label">Total Words</span>
        </div>
    `;
}

function createStatsContainer() {
    const container = document.createElement('div');
    container.id = 'noteStats';
    container.className = 'note-stats';
    
    // Insert at the top or in a sidebar
    const mainContent = document.querySelector('.main-content') || document.body;
    const firstChild = mainContent.firstChild;
    mainContent.insertBefore(container, firstChild);
    
    return container;
}

// Bulk action functions
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.note-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateBulkToolbar();
}

function deleteSelectedNotes() {
    const selectedIds = getSelectedNoteIds();
    if (selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} note(s)?`)) {
        selectedIds.forEach(id => {
            noteManager.deleteNote(parseInt(id));
        });
        showNotification(`${selectedIds.length} note(s) deleted`, 'success');
        updateBulkToolbar();
    }
}

function archiveSelectedNotes() {
    const selectedIds = getSelectedNoteIds();
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
        noteManager.toggleArchiveNote(parseInt(id));
    });
    
    showNotification(`${selectedIds.length} note(s) archived`, 'success');
    updateBulkToolbar();
}

function getSelectedNoteIds() {
    const checkboxes = document.querySelectorAll('.note-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateBulkToolbar() {
    const selectedCount = getSelectedNoteIds().length;
    const bulkToolbar = document.getElementById('bulkToolbar');
    const selectionCount = document.querySelector('.selection-count');
    
    if (bulkToolbar) {
        bulkToolbar.classList.toggle('hidden', selectedCount === 0);
    }
    
    if (selectionCount) {
        selectionCount.textContent = `${selectedCount} selected`;
    }
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
            icon: '/assets/icon.png' // Adjust path as needed
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
    updateNoteStats();
    
    // Show notification for certain events
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
        case 'note-pinned':
            showNotification(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
            break;
        case 'note-archived':
            showNotification(note.archived ? 'Note archived' : 'Note unarchived', 'info');
            break;
    }
});

// Make functions available globally for debugging
window.noteRenderer = {
    applyFilter,
    performSearch,
    setViewMode,
    updateNoteStats,
    showNotification
};

console.log('Notes page loaded');