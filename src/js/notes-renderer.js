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
// let currentFilter = 'all';
// let currentSearchQuery = '';

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
//     setupSearchFunctionality();
//     setupNoteActions();
//     setupKeyboardShortcuts();
//     setupExportImport();
//     setupBulkActions();
//     setupViewModeButtons();
    
//     // Initialize view mode from localStorage
//     const savedViewMode = localStorage.getItem('noteViewMode') || 'grid';
//     setViewMode(savedViewMode);
    
//     // Update stats periodically
//     updateNoteStats();
//     setInterval(updateNoteStats, 30000); // Update every 30 seconds
// }

// function debugFunctions() {
//     console.log('Functions check:');
// }

// function requestNotificationPermission() {
//     if ('Notification' in window && Notification.permission === 'default') {
//         Notification.requestPermission().then(permission => {
//             console.log('Notification permission:', permission);
//         });
//     }
// }

// function setupNoteFilters() {
//     console.log('Setting up note filters...');
    
//     // Filter buttons - delegate to NotesManager if it has a handleFilterClick method
//     const filterButtons = document.querySelectorAll('.filter-btn');
//     filterButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const filterType = button.getAttribute('data-filter');
            
//             // Check if NotesManager has its own filter handler
//             if (noteManager && typeof noteManager.handleFilterClick === 'function') {
//                 noteManager.handleFilterClick(button, filterType);
//             } else {
//                 // Fallback to our own filter handling
//                 setActiveFilter(button, filterType);
//                 applyFilter(filterType);
//             }
//         });
//     });

//     // Category filter dropdown
//     const categoryFilter = document.getElementById('categoryFilter');
//     if (categoryFilter) {
//         categoryFilter.addEventListener('change', () => {
//             const category = categoryFilter.value;
//             if (category === 'all') {
//                 applyFilter('all');
//             } else {
//                 applyFilter('category', category);
//             }
//         });
//     }

//     // Color filter
//     const colorFilter = document.getElementById('colorFilter');
//     if (colorFilter) {
//         colorFilter.addEventListener('change', () => {
//             const color = colorFilter.value;
//             if (color === 'all') {
//                 applyFilter('all');
//             } else {
//                 applyFilter('color', color);
//             }
//         });
//     }

//     console.log('✓ Note filters setup complete');
// }

// function setupSearchFunctionality() {
//     console.log('Setting up search functionality...');
    
//     const searchInput = document.getElementById('note-search');
//     const clearSearchBtn = document.getElementById('clearSearch');
    
//     if (searchInput) {
//         // Real-time search
//         searchInput.addEventListener('input', debounce(() => {
//             const query = searchInput.value.trim();
//             currentSearchQuery = query;
//             performSearch(query);
//         }, 300));
        
//         // Search on enter
//         searchInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') {
//                 e.preventDefault();
//                 const query = searchInput.value.trim();
//                 currentSearchQuery = query;
//                 performSearch(query);
//             }
//         });
//     }
    
//     if (clearSearchBtn) {
//         clearSearchBtn.addEventListener('click', () => {
//             searchInput.value = '';
//             currentSearchQuery = '';
//             performSearch('');
//         });
//     }
    
//     console.log('✓ Search functionality setup complete');
// }

// function setupNoteActions() {
//     console.log('Setting up note actions...');
    
//     // Bulk selection
//     const selectAllBtn = document.getElementById('selectAll');
//     const deleteSelectedBtn = document.getElementById('deleteSelected');
//     const archiveSelectedBtn = document.getElementById('archiveSelected');
//     const clearSelectionBtn = document.getElementById('clearSelection');
    
//     if (selectAllBtn) {
//         selectAllBtn.addEventListener('click', toggleSelectAll);
//     }
    
//     if (deleteSelectedBtn) {
//         deleteSelectedBtn.addEventListener('click', deleteSelectedNotes);
//     }
    
//     if (archiveSelectedBtn) {
//         archiveSelectedBtn.addEventListener('click', archiveSelectedNotes);
//     }
    
//     if (clearSelectionBtn) {
//         clearSelectionBtn.addEventListener('click', clearSelection);
//     }
    
//     console.log('✓ Note actions setup complete');
// }

// function setupKeyboardShortcuts() {
//     console.log('Setting up keyboard shortcuts...');
    
//     document.addEventListener('keydown', (e) => {
//         // Ctrl/Cmd + N: New note (focus input)
//         if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
//             e.preventDefault();
//             const noteInput = document.getElementById('noteInput');
//             if (noteInput) {
//                 noteInput.focus();
//             }
//         }
        
//         // Ctrl/Cmd + F: Focus search
//         if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
//             e.preventDefault();
//             const searchInput = document.getElementById('note-search');
//             if (searchInput) {
//                 searchInput.focus();
//                 searchInput.select();
//             }
//         }
        
//         // Ctrl/Cmd + E: Export notes
//         if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
//             e.preventDefault();
//             if (noteManager) {
//                 noteManager.exportNotes();
//             }
//         }
        
//         // Escape: Clear search or close modals
//         if (e.key === 'Escape') {
//             const searchInput = document.getElementById('note-search');
//             if (searchInput && searchInput.value) {
//                 searchInput.value = '';
//                 currentSearchQuery = '';
//                 performSearch('');
//             }
//         }
//     });
    
//     console.log('✓ Keyboard shortcuts setup complete');
// }

// function setupExportImport() {
//     console.log('Setting up export/import functionality...');
    
//     const exportBtn = document.getElementById('exportNotes');
//     const importBtn = document.getElementById('importNotes');
//     const importFile = document.getElementById('importFile');
    
//     if (exportBtn) {
//         exportBtn.addEventListener('click', () => {
//             if (noteManager) {
//                 noteManager.exportNotes();
//                 showNotification('Notes exported successfully!', 'success');
//             }
//         });
//     }
    
//     if (importBtn && importFile) {
//         importBtn.addEventListener('click', () => importFile.click());
        
//         importFile.addEventListener('change', (e) => {
//             const file = e.target.files[0];
//             if (file && file.type === 'application/json') {
//                 const reader = new FileReader();
//                 reader.onload = (event) => {
//                     try {
//                         const success = noteManager.importNotes(event.target.result);
//                         if (success) {
//                             showNotification('Notes imported successfully!', 'success');
//                             updateNoteStats();
//                         } else {
//                             showNotification('Failed to import notes. Invalid format.', 'error');
//                         }
//                     } catch (error) {
//                         showNotification('Error importing notes: ' + error.message, 'error');
//                     }
//                 };
//                 reader.readAsText(file);
//             } else {
//                 showNotification('Please select a valid JSON file', 'error');
//             }
            
//             // Reset file input
//             e.target.value = '';
//         });
//     }
    
//     console.log('✓ Export/import setup complete');
// }

// function setupBulkActions() {
//     console.log('Setting up bulk actions...');
    
//     // Listen for checkbox changes to update bulk toolbar
//     document.addEventListener('change', (e) => {
//         if (e.target.classList.contains('note-checkbox')) {
//             updateBulkToolbar();
//         }
//     });
    
//     console.log('✓ Bulk actions setup complete');
// }

// function setupViewModeButtons() {
//     console.log('Setting up view mode buttons...');
    
//     const viewModeButtons = document.querySelectorAll('.view-mode-btn');
//     viewModeButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const mode = button.getAttribute('data-mode');
//             setViewMode(mode);
//         });
//     });
    
//     console.log('✓ View mode buttons setup complete');
// }

// // Filter and search functions
// function setActiveFilter(button, filterType) {
//     // Remove active class from all filter buttons
//     const filterButtons = document.querySelectorAll('.filter-btn');
//     filterButtons.forEach(btn => btn.classList.remove('active'));
    
//     // Add active class to clicked button
//     button.classList.add('active');
//     currentFilter = filterType;
// }

// function applyFilter(filterType, filterValue = null) {
//     if (!noteManager) return;
    
//     let filterFunction = null;
    
//     switch (filterType) {
//         case 'all':
//             filterFunction = null; // Show all notes
//             break;
//         case 'pinned':
//             filterFunction = (note) => note.pinned && !note.archived;
//             break;
//         case 'archived':
//             filterFunction = (note) => note.archived;
//             break;
//         case 'recent':
//             const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
//             filterFunction = (note) => new Date(note.timestamp) > twoDaysAgo && !note.archived;
//             break;
//         case 'category':
//             filterFunction = (note) => note.category === filterValue && !note.archived;
//             break;
//         case 'color':
//             filterFunction = (note) => note.color === filterValue && !note.archived;
//             break;
//         default:
//             filterFunction = null;
//     }
    
//     // Apply search if there's a current search query
//     if (currentSearchQuery) {
//         const searchResults = noteManager.searchNotes(currentSearchQuery);
//         if (filterFunction) {
//             const filteredResults = searchResults.filter(filterFunction);
//             noteManager.displayNotes((note) => filteredResults.includes(note));
//         } else {
//             noteManager.displayNotes((note) => searchResults.includes(note));
//         }
//     } else {
//         noteManager.displayNotes(filterFunction);
//     }
    
//     updateNoteStats();
// }

// function performSearch(query) {
//     if (!noteManager) return;
    
//     if (!query) {
//         // No search query, apply current filter
//         applyFilter(currentFilter);
//         return;
//     }
    
//     const searchResults = noteManager.searchNotes(query);
//     noteManager.displayNotes((note) => searchResults.includes(note));
//     updateNoteStats();
    
//     // Update search UI
//     const clearSearchBtn = document.getElementById('clearSearch');
//     if (clearSearchBtn) {
//         clearSearchBtn.style.display = query ? 'block' : 'none';
//     }
// }

// function setViewMode(mode) {
//     const notesContainer = document.getElementById('notesContainer');
//     if (notesContainer) {
//         notesContainer.className = notesContainer.className.replace(/view-\w+/, '');
//         notesContainer.classList.add(`view-${mode}`);
//     }
    
//     // Update active view button
//     const viewButtons = document.querySelectorAll('.view-mode-btn');
//     viewButtons.forEach(btn => {
//         btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
//     });
    
//     // Save preference
//     localStorage.setItem('noteViewMode', mode);
// }

// function updateNoteStats() {
//     if (!noteManager) return;
    
//     const notes = noteManager.getNotes();
//     const pinnedNotes = noteManager.getPinnedNotes();
//     const archivedNotes = noteManager.getArchivedNotes();
    
//     // Update stats display
//     const statsContainer = document.getElementById('noteStats');
    
//     if (statsContainer) {
//         const totalWords = notes.reduce((sum, note) => sum + (note.wordCount || 0), 0);
        
//         statsContainer.innerHTML = `
//             <div class="stat-item">
//                 <span class="stat-value">${notes.length}</span>
//                 <span class="stat-label">Total Notes</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-value">${pinnedNotes.length}</span>
//                 <span class="stat-label">Pinned</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-value">${archivedNotes.length}</span>
//                 <span class="stat-label">Archived</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-value">${totalWords}</span>
//                 <span class="stat-label">Total Words</span>
//             </div>
//         `;
//     }
// }

// // Bulk action functions
// function toggleSelectAll() {
//     const checkboxes = document.querySelectorAll('.note-checkbox');
//     const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
//     checkboxes.forEach(cb => {
//         cb.checked = !allChecked;
//     });
    
//     updateBulkToolbar();
// }

// function deleteSelectedNotes() {
//     const selectedIds = getSelectedNoteIds();
//     if (selectedIds.length === 0) return;
    
//     if (confirm(`Are you sure you want to delete ${selectedIds.length} note(s)?`)) {
//         selectedIds.forEach(id => {
//             noteManager.deleteNote(parseInt(id));
//         });
//         showNotification(`${selectedIds.length} note(s) deleted`, 'success');
//         updateBulkToolbar();
//     }
// }

// function archiveSelectedNotes() {
//     const selectedIds = getSelectedNoteIds();
//     if (selectedIds.length === 0) return;
    
//     selectedIds.forEach(id => {
//         noteManager.toggleArchiveNote(parseInt(id));
//     });
    
//     showNotification(`${selectedIds.length} note(s) archived`, 'success');
//     updateBulkToolbar();
// }

// function clearSelection() {
//     const checkboxes = document.querySelectorAll('.note-checkbox');
//     checkboxes.forEach(cb => {
//         cb.checked = false;
//     });
//     updateBulkToolbar();
// }

// function getSelectedNoteIds() {
//     const checkboxes = document.querySelectorAll('.note-checkbox:checked');
//     return Array.from(checkboxes).map(cb => cb.value);
// }

// function updateBulkToolbar() {
//     const selectedCount = getSelectedNoteIds().length;
//     const bulkToolbar = document.getElementById('bulkToolbar');
//     const selectionCount = document.querySelector('.selection-count');
    
//     if (bulkToolbar) {
//         bulkToolbar.classList.toggle('hidden', selectedCount === 0);
//     }
    
//     if (selectionCount) {
//         selectionCount.textContent = `${selectedCount} selected`;
//     }
// }

// // Utility functions
// function debounce(func, wait) {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// }

// function showNotification(message, type = 'info') {
//     // Create notification element
//     const notification = document.createElement('div');
//     notification.className = `notification notification-${type}`;
//     notification.innerHTML = `
//         <div class="notification-content">
//             <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
//             <span>${message}</span>
//         </div>
//     `;
    
//     // Add to page
//     document.body.appendChild(notification);
    
//     // Auto-remove after 3 seconds
//     setTimeout(() => {
//         notification.classList.add('fade-out');
//         setTimeout(() => {
//             if (notification.parentNode) {
//                 notification.parentNode.removeChild(notification);
//             }
//         }, 300);
//     }, 3000);
    
//     // Browser notification for important events
//     if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
//         new Notification('Stitch Notes', {
//             body: message,
//             icon: '@assets/images/characters/stitch-icon.png' // Adjust path as needed
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
//     updateNoteStats();
    
//     // Show notification for certain events
//     const { type, note } = event.detail;
//     switch (type) {
//         case 'note-added':
//             showNotification('Note created successfully!', 'success');
//             break;
//         case 'note-updated':
//             showNotification('Note updated successfully!', 'success');
//             break;
//         case 'note-deleted':
//             showNotification('Note deleted', 'info');
//             break;
//         case 'note-pinned':
//             showNotification(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
//             break;
//         case 'note-archived':
//             showNotification(note.archived ? 'Note archived' : 'Note unarchived', 'info');
//             break;
//     }
// });

// // Make functions available globally for debugging
// window.noteRenderer = {
//     applyFilter,
//     performSearch,
//     setViewMode,
//     updateNoteStats,
//     showNotification
// };

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
    setupViewModeButtons();
    
    // Initialize view mode from localStorage
    const savedViewMode = localStorage.getItem('noteViewMode') || 'grid';
    setViewMode(savedViewMode);
    
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
    
    // Filter buttons - delegate to NotesManager if it has a handleFilterClick method
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');
            
            // Check if NotesManager has its own filter handler
            if (noteManager && typeof noteManager.handleFilterClick === 'function') {
                noteManager.handleFilterClick(button, filterType);
            } else {
                // Fallback to our own filter handling
                setActiveFilter(button, filterType);
                applyFilter(filterType);
            }
        });
    });

    console.log('✓ Note filters setup complete');
}

function setupSearchFunctionality() {
    console.log('Setting up search functionality...');
    
    const searchInput = document.getElementById('note-search');
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

function setupNoteActions() {
    console.log('Setting up note actions...');
    
    // Bulk selection
    const selectAllBtn = document.getElementById('selectAll');
    const deleteSelectedBtn = document.getElementById('deleteSelected');
    const archiveSelectedBtn = document.getElementById('archiveSelected');
    const clearSelectionBtn = document.getElementById('clearSelection');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAll);
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedNotes);
    }
    
    if (archiveSelectedBtn) {
        archiveSelectedBtn.addEventListener('click', archiveSelectedNotes);
    }
    
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', clearSelection);
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

function setupBulkActions() {
    console.log('Setting up bulk actions...');
    
    // Listen for checkbox changes to update bulk toolbar
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('note-checkbox')) {
            updateBulkToolbar();
        }
    });
    
    console.log('✓ Bulk actions setup complete');
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
    const statsContainer = document.getElementById('noteStats');
    
    if (statsContainer) {
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

function clearSelection() {
    const checkboxes = document.querySelectorAll('.note-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
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