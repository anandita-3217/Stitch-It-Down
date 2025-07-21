// notes.js
import { detectAndCreateLinks, formatTimestamp } from '@components/utils.js';
function closeModal() {
    const modals = document.querySelectorAll('.note-category-modal, .note-edit-modal');
    modals.forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
}
class NotesManager {
    constructor() {
        this.STORAGE_KEY = 'stitch_Notes';
        this.editingNote = null;
        this.tempNoteData = null;
        this.lastFocusedElement = null; 
        this.selectedNotes = new Set();
        this.bulkMode = false;
        this.activeFilters = {view: 'all',category: null,color: null};
        this.searchQuery = '';
        this.init();
    }
    init() {
        try {
            const testData = this.getNotes();
            if (!Array.isArray(testData)) {
                localStorage.removeItem(this.STORAGE_KEY);
            }
        } catch (error) {
            localStorage.removeItem(this.STORAGE_KEY);
        }
        this.setupFocusTracking(); 
        this.loadNotes();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);}}
    setupFocusTracking() {
        const trackableFocusElements = ['noteInput', 'note-search'];
        trackableFocusElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('focus', () => {
                    this.lastFocusedElement = element;
                });
            }
        });
    }
    restoreFocus() {
        setTimeout(() => {
            if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            } else {
                const noteInput = document.getElementById('noteInput');
                if (noteInput) {
                    noteInput.focus();
                }
            }
        }, 100);
    }
    validateInput(inputElement, errorMessage = 'Please enter a valid value') {
        const value = inputElement.value.trim();
        
        if (!value || value === '') {
            this.shakeInput(inputElement);
            return false;
        }
        return true;
    }
    shakeInput(inputElement) {
        inputElement.classList.remove('shake-animation');
        inputElement.offsetHeight;
        inputElement.classList.add('shake-animation');
        setTimeout(() => {
            inputElement.classList.remove('shake-animation');
        }, 600);
    }
    setupEventListeners() {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const noteInput = document.getElementById('noteInput');
        const bulkActionsBtn = document.getElementById('bulkActionsBtn');
        const notesContainer = document.getElementById('notesContainer');        
        console.log('Setting up event listeners...');        
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => this.handleAddNote());
        }
        if (noteInput) {
            noteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleAddNote();
                }
            });
        }
            if (bulkActionsBtn) {
        bulkActionsBtn.addEventListener('click', () => this.toggleBulkMode());
    }

    // ADD BULK CONTROL LISTENERS
    this.setupBulkControlListeners();
        const searchInput = document.getElementById('note-search');
        const clearSearchBtn = document.getElementById('clearSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyFilters();
                }
            });
        }
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        this.setupFilterListeners();
        if (notesContainer) {
            notesContainer.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button) {
                    e.preventDefault();
                    e.stopPropagation();
                    const noteId = parseInt(button.getAttribute('data-note-id'));
                    if (button.classList.contains('edit-note') || e.target.classList.contains('bi-pencil')) {
                        console.log('Edit button clicked for note:', noteId);
                        this.editNote(noteId);
                    } else if (button.classList.contains('delete-note') || e.target.classList.contains('bi-trash')) {
                        console.log('Delete button clicked for note:', noteId);
                        this.deleteNote(noteId);
                    } else if (button.classList.contains('pin-note') || e.target.classList.contains('bi-pin-angle')) {
                        console.log('Pin button clicked for note:', noteId);
                        this.togglePinNote(noteId);
                    } else if (button.classList.contains('archive-note') || e.target.classList.contains('bi-archive')) {
                        console.log('Archive button clicked for note:', noteId);
                        this.toggleArchiveNote(noteId);
                    }
                }
                // ADD THIS NEW SECTION FOR EXPAND/COLLAPSE
                if (e.target.classList.contains('expand-note-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showNoteModal(e.target);
                }
            });
        }
    }
    setupBulkControlListeners() {
    const setupBulkListeners = () => {
        const selectAllBtn = document.getElementById('selectAllBtn');
        const deselectAllBtn = document.getElementById('deselectAllBtn');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
        const bulkPinBtn = document.getElementById('bulkPinBtn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllNotes());
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAllNotes());
        }
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteNotes());
        }
        if (bulkArchiveBtn) {
            bulkArchiveBtn.addEventListener('click', () => this.bulkArchiveNotes());
        }
        if (bulkPinBtn) {
            bulkPinBtn.addEventListener('click', () => this.bulkPinNotes());
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBulkListeners);
    } else {
        setupBulkListeners();
    }
}
    handleAddNote() {
        const noteInput = document.getElementById('noteInput');
        if (!this.validateInput(noteInput, 'Please enter a note')) {
            return;
        }
        const noteText = noteInput.value.trim();
        this.showCategoryModal(noteText);
        noteInput.value = '';
    }
    showCategoryModal(noteText) {
        const modal = document.createElement('div');
        modal.className = 'note-category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Note Settings</h3>
                <div class="note-text-preview">
                    <strong>Note:</strong> ${noteText.length > 100 ? noteText.substring(0, 100) + '...' : noteText}
                </div>
                <div class="category-section">
                    <label>Category:</label>
                    <select id="note-category">
                        <option value="general">General</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="ideas">Ideas</option>
                        <option value="reminders">Reminders</option>
                        <option value="quotes">Quotes</option>
                        <option value="research">Research</option>
                    </select>
                </div>                
                <div class="color-section">
                    <label>Color:</label>
                    <div class="color-picker">
                        <input type="radio" name="note-color" value="default" id="color-default" checked>
                        <label for="color-default" class="color-option color-default"></label>                        
                        <input type="radio" name="note-color" value="yellow" id="color-yellow">
                        <label for="color-yellow" class="color-option color-yellow"></label>                        
                        <input type="radio" name="note-color" value="blue" id="color-blue">
                        <label for="color-blue" class="color-option color-blue"></label>                        
                        <input type="radio" name="note-color" value="green" id="color-green">
                        <label for="color-green" class="color-option color-green"></label>                        
                        <input type="radio" name="note-color" value="pink" id="color-pink">
                        <label for="color-pink" class="color-option color-pink"></label>                        
                        <input type="radio" name="note-color" value="purple" id="color-purple">
                        <label for="color-purple" class="color-option color-purple"></label>
                    </div>
                </div>                
                <div class="tags-section">
                    <label for="note-tags">Tags (comma-separated):</label>
                    <input type="text" id="note-tags" placeholder="e.g., important, meeting, project">
                </div>                
                <div class="options-section">
                    <label>
                        <input type="checkbox" id="note-pinned"> Pin this note
                    </label>
                </div>                
                <div class="modal-actions">
                    <button data-action="create">Create Note</button>
                    <button data-action="cancel">Cancel</button>
                </div>
            </div>
        `;        
        document.body.appendChild(modal);
        this.tempNoteData = { text: noteText };        
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'create') {
                    this.createNoteFromModal();
                } else if (action === 'cancel') {
                    this.cancelNoteCreation(noteText);
                }
            });
        });
    }
    createNoteFromModal() {
        if (!this.tempNoteData) return;
        const category = document.getElementById('note-category').value;
        const colorInput = document.querySelector('input[name="note-color"]:checked');
        const tagsInput = document.getElementById('note-tags');
        const pinnedCheckbox = document.getElementById('note-pinned');
        const noteData = {
            id: Date.now(),
            text: this.tempNoteData.text,
            type: 'note',
            timestamp: new Date().toISOString(),
            category: category,
            color: colorInput ? colorInput.value : 'default',
            tags: tagsInput.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            pinned: pinnedCheckbox.checked,
            archived: false,
            wordCount: this.countWords(this.tempNoteData.text),
            lastModified: new Date().toISOString()
        };
        this.saveNote(noteData);
        closeModal();
        this.tempNoteData = null;
        this.restoreFocus(); 
    }
    cancelNoteCreation(noteText) {
        const noteInput = document.getElementById('noteInput');
        if (noteInput) {
            noteInput.value = noteText;
        }
        closeModal();
        this.tempNoteData = null;
        this.restoreFocus();
    }
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    saveNote(noteData) {
        try {
            const notes = this.getNotes();
            notes.push(noteData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes(false);
            this.emitNoteUpdate('note-added', noteData);
        } catch (error) {
            console.error('Could not save note to localStorage:', error);
        }
    }
    saveModalNote(noteId, modal) {
    const textarea = modal.querySelector('#modalNoteText');
    if (!this.validateInput(textarea, 'Please enter a note')) {
        return;
    }    
    const newText = textarea.value.trim();    
    try {
        const notes = this.getNotes();
        const noteIndex = notes.findIndex(note => note.id === noteId);        
        if (noteIndex !== -1) {
            notes[noteIndex].text = newText;
            notes[noteIndex].wordCount = this.countWords(newText);
            notes[noteIndex].lastModified = new Date().toISOString();            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes(false);
            this.emitNoteUpdate('note-updated', notes[noteIndex]);
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            this.restoreFocus();
        }
    } catch (error) {
        console.error('Could not save modal note:', error);
    }
}
showNoteModal(button) {
    const noteTextDiv = button.closest('.note-text');
    if (!noteTextDiv) return;    
    const fullText = noteTextDiv.getAttribute('data-full-text');
    const noteItem = button.closest('.note-item');
    const noteId = parseInt(noteItem.querySelector('[data-note-id]').getAttribute('data-note-id'));
    const notes = this.getNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    this.showFullNoteModal(note);
    }
    setupModalEventListeners(modal, note) {
    const closeBtn = modal.querySelector('.modal-close-btn');
    const cancelBtn = modal.querySelector('.cancel-modal');
    const closeModal = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.restoreFocus();
    };    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }    };
    document.addEventListener('keydown', escHandler);
    const saveBtn = modal.querySelector('.save-modal-note');
    saveBtn?.addEventListener('click', () => {
        this.saveModalNote(note.id, modal);
    });
    const actionButtons = modal.querySelectorAll('.note-actions button');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const noteId = parseInt(button.getAttribute('data-note-id'));
            if (button.classList.contains('pin-note')) {
                this.togglePinNote(noteId);
                closeModal();
            } else if (button.classList.contains('archive-note')) {
                this.toggleArchiveNote(noteId);
                closeModal();
            } else if (button.classList.contains('edit-note')) {
                this.showEditModal(note);
                closeModal();
            } else if (button.classList.contains('delete-note')) {
                this.deleteNote(noteId);
                closeModal();
            }
        });
    });
}
showFullNoteModal(note) {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'note-view-modal';
    modal.innerHTML = `
        <div class="modal-content note-modal-content">
            <div class="modal-header">
                <h3>View/Edit Note</h3>
                <button class="modal-close-btn" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="note-header-info">
                    <span class="note-category">${note.category}</span>
                    <span class="note-word-count">${note.wordCount} words</span>
                    ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
                </div>
                <div class="editable-note-content">
                    <textarea id="modalNoteText" class="modal-note-textarea">${note.text}</textarea>
                </div>
                ${note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="note-meta">
                    <div class="note-timestamp">
                        Created: ${formatTimestamp(note.timestamp)}
                        ${note.lastModified !== note.timestamp ? `<br>Modified: ${formatTimestamp(note.lastModified)}` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="note-actions modal-actions">
                    <button class="pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}" type="button">
                        <i class="bi ${note.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}"></i>
                    </button>
                    <button class="archive-note ${note.archived ? 'archived' : ''}" data-note-id="${note.id}" title="${note.archived ? 'Unarchive' : 'Archive'}" type="button">
                        <i class="bi ${note.archived ? 'bi-archive-fill' : 'bi-archive'}"></i>
                    </button>
                    <button class="edit-note" data-note-id="${note.id}" title="Edit" type="button">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="delete-note" data-note-id="${note.id}" title="Delete" type="button">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="modal-save-actions">
                    <button class="save-modal-note" data-note-id="${note.id}" type="button">Save Changes</button>
                    <button class="cancel-modal" type="button">Close</button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);
    this.setupModalEventListeners(modal, note);
}
    safeTextWithLinks(text) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const decodedText = tempDiv.textContent || tempDiv.innerText || '';
        const escaped = decodedText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        return detectAndCreateLinks(escaped);
    }
    getNotes() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return [];
            }
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Could not load notes from localStorage:', error);
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
        }
    }
    loadNotes() {
        this.applyFilters();
    }
    displayNotes(resetFilters = false) {
    if (resetFilters) {
        this.resetAllFilters();
        this.searchQuery = '';
        const searchInput = document.getElementById('note-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }
    this.applyFilters();
    }
// createNoteElement(note) {
//     const div = document.createElement('div');
//     div.className = `note-item color-${note.color} ${note.pinned ? 'pinned' : ''} ${note.archived ? 'archived' : ''}`;
//     const isLongNote = note.text.length > 200;
//     const truncatedText = isLongNote ? note.text.substring(0, 200) + '...' : note.text;
    
//     const safeTextWithLinks = (text) => {
//         const escaped = text
//             .replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;')
//             .replace(/'/g, '&#39;');
//         return detectAndCreateLinks(escaped);
//     };
//     div.innerHTML = `
//         ${this.bulkMode ? `
//             <div class="note-checkbox-container">
//                 <input type="checkbox" class="note-checkbox" data-note-id="${note.id}" 
//                        ${this.selectedNotes.has(note.id) ? 'checked' : ''}>
//             </div>
//         ` : ''}
//         <div class="note-content">
//             <div class="note-header">
//                 ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
//                 <span class="note-category">${note.category}</span>
//                 <span class="note-word-count">${note.wordCount} words</span>
//             </div>
//             <div class="note-text ${isLongNote ? 'expandable' : ''}" data-full-text="${note.text.replace(/"/g, '&quot;')}">
//                 ${safeTextWithLinks(isLongNote ? truncatedText : note.text)}
//                 ${isLongNote ? '<button class="expand-note-btn" type="button">Show more</button>' : ''}
//             </div>
//             ${note.tags.length > 0 ? `
//                 <div class="note-tags">
//                     ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
//                 </div>
//             ` : ''}
//         </div>
//         <div class="note-meta">
//             <div class="note-timestamp">
//                 Created: ${formatTimestamp(note.timestamp)}
//                 ${note.lastModified !== note.timestamp ? `<br>Modified: ${formatTimestamp(note.lastModified)}` : ''}
//             </div>
//         </div>
//         <div class="note-actions">
//             <button class="pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}" type="button">
//                 <i class="bi ${note.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}"></i>
//             </button>
//             <button class="archive-note ${note.archived ? 'archived' : ''}" data-note-id="${note.id}" title="${note.archived ? 'Unarchive' : 'Archive'}" type="button">
//                 <i class="bi ${note.archived ? 'bi-archive-fill' : 'bi-archive'}"></i>
//             </button>
//             <button class="edit-note" data-note-id="${note.id}" title="Edit" type="button">
//                 <i class="bi bi-pencil"></i>
//             </button>
//             <button class="delete-note" data-note-id="${note.id}" title="Delete" type="button">
//                 <i class="bi bi-trash"></i>
//             </button>
//         </div>
//     `;
    
//     if (this.bulkMode) {
//         const checkbox = div.querySelector('.note-checkbox');
//         if (checkbox) {
//             checkbox.addEventListener('change', (e) => {
//                 e.stopPropagation();
//                 this.toggleNoteSelection(note.id);
//             });
//         }
//     }
    
//     return div;
// }
createNoteElement(note) {
    const div = document.createElement('div');
    div.className = `note-item color-${note.color} ${note.pinned ? 'pinned' : ''} ${note.archived ? 'archived' : ''}`;
    const isLongNote = note.text.length > 200;
    const truncatedText = isLongNote ? note.text.substring(0, 200) + '...' : note.text;
    
    // FIX: Use the existing safeTextWithLinks method properly
    const fullTextSafe = this.safeTextWithLinks(note.text);
    const truncatedTextSafe = this.safeTextWithLinks(truncatedText);
    
    div.innerHTML = `
        ${this.bulkMode ? `
            <div class="note-checkbox-container">
                <input type="checkbox" class="note-checkbox" data-note-id="${note.id}" 
                       ${this.selectedNotes.has(note.id) ? 'checked' : ''}>
            </div>
        ` : ''}
        <div class="note-content">
            <div class="note-header">
                ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
                <span class="note-category">${note.category}</span>
                <span class="note-word-count">${note.wordCount} words</span>
            </div>
            <div class="note-text ${isLongNote ? 'expandable' : ''}" data-full-text="${note.text.replace(/"/g, '&quot;')}">
                ${isLongNote ? truncatedTextSafe : fullTextSafe}
                ${isLongNote ? '<button class="expand-note-btn" type="button">Show more</button>' : ''}
            </div>
            ${note.tags.length > 0 ? `
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="note-meta">
            <div class="note-timestamp">
                Created: ${formatTimestamp(note.timestamp)}
                ${note.lastModified !== note.timestamp ? `<br>Modified: ${formatTimestamp(note.lastModified)}` : ''}
            </div>
        </div>
        <div class="note-actions">
            <button class="pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}" type="button">
                <i class="bi ${note.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}"></i>
            </button>
            <button class="archive-note ${note.archived ? 'archived' : ''}" data-note-id="${note.id}" title="${note.archived ? 'Unarchive' : 'Archive'}" type="button">
                <i class="bi ${note.archived ? 'bi-archive-fill' : 'bi-archive'}"></i>
            </button>
            <button class="edit-note" data-note-id="${note.id}" title="Edit" type="button">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="delete-note" data-note-id="${note.id}" title="Delete" type="button">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    if (this.bulkMode) {
        const checkbox = div.querySelector('.note-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                this.toggleNoteSelection(note.id);
            });
        }
    }
    
    return div;
}
    togglePinNote(noteId) {
    console.log('togglePinNote called with ID:', noteId);        
    if (!noteId || isNaN(noteId)) {
        console.error('Invalid note ID provided to togglePinNote:', noteId);
        return;
    }        
    try {
        const notes = this.getNotes();
        const noteIndex = notes.findIndex(note => note.id === noteId);            
        if (noteIndex !== -1) {
            const oldPinned = notes[noteIndex].pinned;
            notes[noteIndex].pinned = !notes[noteIndex].pinned;
            notes[noteIndex].lastModified = new Date().toISOString();
            const newPinned = notes[noteIndex].pinned;                
            console.log(`✓ Note ${noteId} pin toggled: ${oldPinned} → ${newPinned}`);                
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes(false); 
            this.emitNoteUpdate('note-pinned', notes[noteIndex]);                
        } else {
            console.error('Note not found with ID:', noteId);
        }
    } catch (error) {
        console.error('Error in togglePinNote:', error);
    }
    }
    toggleArchiveNote(noteId) {
        console.log('toggleArchiveNote called with ID:', noteId);        
        if (!noteId || isNaN(noteId)) {
            console.error('Invalid note ID provided to toggleArchiveNote:', noteId);
            return;
        }        
        try {
            const notes = this.getNotes();
            const noteIndex = notes.findIndex(note => note.id === noteId);            
            if (noteIndex !== -1) {
                const oldArchived = notes[noteIndex].archived;
                notes[noteIndex].archived = !notes[noteIndex].archived;
                notes[noteIndex].lastModified = new Date().toISOString();
                const newArchived = notes[noteIndex].archived;                
                console.log(`✓ Note ${noteId} archive toggled: ${oldArchived} → ${newArchived}`);                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
                this.displayNotes(false); 
                this.emitNoteUpdate('note-archived', notes[noteIndex]);                
            } else {
                console.error('Note not found with ID:', noteId);
            }
        } catch (error) {
            console.error('Error in toggleArchiveNote:', error);
        }
    }
    deleteNote(noteId) {
        console.log('deleteNote called with ID:', noteId);        
        if (!noteId || isNaN(noteId)) {
            console.error('Invalid note ID:', noteId);
            return;
        }
        if (!confirm('Are you sure you want to delete this note?')) {
            this.restoreFocus();
            return;
        }        
        try {
            let notes = this.getNotes();
            console.log('Notes before delete:', notes.length);
            const noteToDelete = notes.find(note => note.id === noteId);
            console.log('Note to delete:', noteToDelete);            
            if (!noteToDelete) {
                console.error('Note not found with ID:', noteId);
                this.restoreFocus();
                return;
            }            
            notes = notes.filter(note => note.id !== noteId);
            console.log('Notes after delete:', notes.length);            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes(false); 
            this.emitNoteUpdate('note-deleted', noteToDelete);            
            console.log('Note deleted successfully');
            this.restoreFocus();
        } catch (error) {
            console.error('Could not delete note:', error);
            this.restoreFocus();
        }
    }
    editNote(noteId) {
        console.log('editNote called with ID:', noteId);        
        if (!noteId || isNaN(noteId)) {
            console.error('Invalid note ID:', noteId);
            return;
        }
        const notes = this.getNotes();
        const note = notes.find(n => n.id === noteId);        
        if (!note) {
            console.error('Note not found with ID:', noteId);
            this.restoreFocus();
            return;
        }        
        console.log('Editing note:', note);
        this.editingNote = note;
        this.showEditModal(note);
    }
    showEditModal(note) {
        closeModal();        
        const modal = document.createElement('div');
        modal.className = 'note-edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Note</h3>
                <textarea id="editNoteText" rows="6">${note.text}</textarea>                
                <div class="edit-sections">
                    <div class="category-section">
                        <label>Category:</label>
                        <select id="editCategory">
                            <option value="general" ${note.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="work" ${note.category === 'work' ? 'selected' : ''}>Work</option>
                            <option value="personal" ${note.category === 'personal' ? 'selected' : ''}>Personal</option>
                            <option value="ideas" ${note.category === 'ideas' ? 'selected' : ''}>Ideas</option>
                            <option value="reminders" ${note.category === 'reminders' ? 'selected' : ''}>Reminders</option>
                            <option value="quotes" ${note.category === 'quotes' ? 'selected' : ''}>Quotes</option>
                            <option value="research" ${note.category === 'research' ? 'selected' : ''}>Research</option>
                        </select>
                    </div>                    
                    <div class="color-section">
                        <label>Color:</label>
                        <div class="color-picker">
                            <input type="radio" name="edit-note-color" value="default" id="edit-color-default" ${note.color === 'default' ? 'checked' : ''}>
                            <label for="edit-color-default" class="color-option color-default"></label>
                            <input type="radio" name="edit-note-color" value="yellow" id="edit-color-yellow" ${note.color === 'yellow' ? 'checked' : ''}>
                            <label for="edit-color-yellow" class="color-option color-yellow"></label>
                            <input type="radio" name="edit-note-color" value="blue" id="edit-color-blue" ${note.color === 'blue' ? 'checked' : ''}>
                            <label for="edit-color-blue" class="color-option color-blue"></label>
                            <input type="radio" name="edit-note-color" value="green" id="edit-color-green" ${note.color === 'green' ? 'checked' : ''}>
                            <label for="edit-color-green" class="color-option color-green"></label>
                            <input type="radio" name="edit-note-color" value="pink" id="edit-color-pink" ${note.color === 'pink' ? 'checked' : ''}>
                            <label for="edit-color-pink" class="color-option color-pink"></label>
                            <input type="radio" name="edit-note-color" value="purple" id="edit-color-purple" ${note.color === 'purple' ? 'checked' : ''}>
                            <label for="edit-color-purple" class="color-option color-purple"></label>
                        </div>
                    </div>
                    <div class="tags-section">
                        <label for="edit-tags">Tags:</label>
                        <input type="text" id="edit-tags" value="${note.tags.join(', ')}">
                    </div>
                    <div class="options-section">
                        <label>
                            <input type="checkbox" id="edit-pinned" ${note.pinned ? 'checked' : ''}> Pin this note
                        </label>
                    </div>
                </div>
                <div class="modal-actions">
                    <button data-action="save" type="button">Save Changes</button>
                    <button data-action="cancel" type="button">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.getAttribute('data-action');
                if (action === 'save') {
                    this.saveEditedNote();
                } else if (action === 'cancel') {
                    closeModal();
                    this.editingNote = null;
                    this.restoreFocus(); 
                }
            });
        });
    }
    saveEditedNote() {
        const textArea = document.getElementById('editNoteText');
        const categorySelect = document.getElementById('editCategory');
        const colorInput = document.querySelector('input[name="edit-note-color"]:checked');
        const tagsInput = document.getElementById('edit-tags');
        const pinnedCheckbox = document.getElementById('edit-pinned');
        if (!this.validateInput(textArea, 'Please enter a note')) {
            return;
        }
        const newText = textArea.value.trim();
        if (!this.editingNote) return;
        try {
            const notes = this.getNotes();
            const noteIndex = notes.findIndex(note => note.id === this.editingNote.id);
            if (noteIndex !== -1) {
                notes[noteIndex].text = newText;
                notes[noteIndex].category = categorySelect.value;
                notes[noteIndex].color = colorInput ? colorInput.value : 'default';
                notes[noteIndex].tags = tagsInput.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                notes[noteIndex].pinned = pinnedCheckbox.checked;
                notes[noteIndex].wordCount = this.countWords(newText);
                notes[noteIndex].lastModified = new Date().toISOString();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
                this.displayNotes(false); 
                this.emitNoteUpdate('note-updated', notes[noteIndex]);
            }
        } catch (error) {
            console.error('Could not save edited note:', error);
        }
        this.editingNote = null;
        closeModal();
        this.restoreFocus();
    }
    // showEmptyState(container) {
    //     const emptyState = document.createElement('div');
    //     emptyState.className = 'empty-state';
    //     emptyState.innerHTML = `
    //         <div class="empty-icon"><i class="bi bi-journal-text"></i></div>
    //         <p>No notes yet. Create your first note!</p>
    //     `;
    //     container.appendChild(emptyState);
    // }

    clearAllFilters() {
    this.resetAllFilters();
    this.searchQuery = '';
    const searchInput = document.getElementById('note-search');
    if (searchInput) {
        searchInput.value = '';
    }
    this.applyFilters();
}

    showEmptyState(container) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    // Check if we have active filters or search
    const hasActiveSearch = this.searchQuery && this.searchQuery.trim() !== '';
    const hasActiveFilters = this.hasActiveFilters();
    
    if (hasActiveSearch || hasActiveFilters) {
        // Show search/filter empty state with clear button
        emptyState.classList.add('search-empty');
        emptyState.innerHTML = `
            <div class="empty-icon"><i class="bi bi-search"></i></div>
            <p>No notes match your search criteria</p>
            <button class="btn-clear-filters" type="button">
                Clear filters
            </button>
        `;
        
        // Add event listener for clear filters button
        const clearBtn = emptyState.querySelector('.btn-clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
    } else {
        // Show default empty state
        emptyState.innerHTML = `
            <div class="empty-icon"><i class="bi bi-journal-text"></i></div>
            <p>No notes yet. Create your first note!</p>
        `;
    }
    
    container.appendChild(emptyState);
}
    emitNoteUpdate(eventType, noteData) {
        const event = new CustomEvent('noteUpdate', {
            detail: { type: eventType, note: noteData }
        });
        document.dispatchEvent(event);
    }
    searchNotes(query) {
        const notes = this.getNotes();
        const searchTerm = query.toLowerCase();
        return notes.filter(note => 
            note.text.toLowerCase().includes(searchTerm) ||
            note.category.toLowerCase().includes(searchTerm) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    clearSearch() {
        const searchInput = document.getElementById('note-search');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.applyFilters();
        }
    }
    setupFilterListeners() {
        const setupFilters = () => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        console.log('Found filter buttons:', filterButtons.length);
        if (filterButtons.length === 0) {
            console.warn('No filter buttons found. Retrying in 100ms...');
            setTimeout(setupFilters, 100);
            return;
        }
        filterButtons.forEach((btn, index) => {
            console.log(`Setting up filter button ${index}:`, btn.getAttribute('data-filter'), btn.getAttribute('data-value'));
            btn.addEventListener('click', (e) => this.handleNewFilterClick(e.target));
        });
        
        console.log('✓ Filter listeners set up successfully');
    };
        if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFilters);
    } else {
        setupFilters();
    }
}
    handleNewFilterClick(button) {
        console.log('Filter clicked:', button.getAttribute('data-filter'), button.getAttribute('data-value'));        
        const filterType = button.getAttribute('data-filter');
        const filterValue = button.getAttribute('data-value');
        const filterGroup = button.closest('.filter-group');
        if (filterType === 'view' && filterValue === 'all') {
            this.resetAllFilters();
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            console.log('All filters reset');
        } else {
            const currentValue = this.activeFilters[filterType];
            if (currentValue === filterValue) {
                this.activeFilters[filterType] = null;
                button.classList.remove('active');
                console.log(`Filter ${filterType}:${filterValue} deactivated`);
            } else {
                const groupButtons = filterGroup.querySelectorAll('.filter-btn');
                groupButtons.forEach(btn => btn.classList.remove('active'));
                this.activeFilters[filterType] = filterValue;
                button.classList.add('active');
                console.log(`Filter ${filterType}:${filterValue} activated`);
            }
            const allButton = document.querySelector('.filter-btn[data-value="all"]');
            if (allButton && this.hasActiveFilters()) {
                allButton.classList.remove('active');
            }
            if (!this.hasActiveFilters()) {
                if (allButton) {
                    allButton.classList.add('active');
                }
            }
        }
        console.log('Active filters:', this.activeFilters);
        this.applyFilters();
    }
    resetAllFilters() {
        this.activeFilters = {
            view: 'all',
            category: null,
            color: null
        };
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });        
        document.querySelector('.filter-btn[data-value="all"]')?.classList.add('active');
    }
    applyFilters() {
            const notes = this.getNotes();
            let filteredNotes = notes;
            if (this.searchQuery) {
                filteredNotes = filteredNotes.filter(note => 
                    note.text.toLowerCase().includes(this.searchQuery) ||
                    note.category.toLowerCase().includes(this.searchQuery) ||
                    note.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
                );
            }
            if (this.activeFilters.view && this.activeFilters.view !== 'all') {
                switch (this.activeFilters.view) {
                    case 'pinned':
                        filteredNotes = filteredNotes.filter(note => note.pinned);
                        break;
                    case 'archived':
                        filteredNotes = filteredNotes.filter(note => note.archived);
                        break;
                    case 'recent':
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        filteredNotes = filteredNotes.filter(note => 
                            new Date(note.timestamp) > weekAgo
                        );
                        break;
                }
            }
            if (this.activeFilters.category) {
                filteredNotes = filteredNotes.filter(note => 
                    note.category === this.activeFilters.category
                );
            }
            if (this.activeFilters.color) {
                filteredNotes = filteredNotes.filter(note => 
                    note.color === this.activeFilters.color
                );
            }
            this.displayFilteredNotes(filteredNotes);
    }
    hasActiveFilters() {
        return this.activeFilters.category !== null || 
            this.activeFilters.color !== null ||
            (this.activeFilters.view !== 'all' && this.activeFilters.view !== null);
    }
    displayFilteredNotes(filteredNotes) {
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort notes (pinned first, then by last modified)
    filteredNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        const aTime = new Date(a.lastModified || a.timestamp);
        const bTime = new Date(b.lastModified || b.timestamp);
        return bTime - aTime;
    });
    
    // Display notes
    filteredNotes.forEach(note => {
        const noteElement = this.createNoteElement(note);
        container.appendChild(noteElement);
    });
    
    // Show empty state if no notes
    if (filteredNotes.length === 0) {
        this.showEmptyState(container);
    }
    
    // Update bulk controls if in bulk mode
    if (this.bulkMode) {
        this.updateBulkControls();
    }
}
    // displayFilteredNotes(filteredNotes) {
    //     const container = document.getElementById('notesContainer');
    //     if (!container) return;
    //     container.innerHTML = '';
    //     filteredNotes.sort((a, b) => {
    //         if (a.pinned && !b.pinned) return -1;
    //         if (!a.pinned && b.pinned) return 1;

    //         const aTime = new Date(a.lastModified || a.timestamp);
    //         const bTime = new Date(b.lastModified || b.timestamp);
    //         return bTime - aTime;
    //     });
    //     filteredNotes.forEach(note => {
    //         const noteElement = this.createNoteElement(note);
    //         container.appendChild(noteElement);
    //     });
    //     if (filteredNotes.length === 0) {
    //         this.showEmptyState(container);
    //     }
    // }
    getNotesByCategory(category) {
        return this.getNotes().filter(note => note.category === category);
    }
    getNotesByTag(tag) {
        return this.getNotes().filter(note => 
            note.tags.some(noteTag => noteTag.toLowerCase() === tag.toLowerCase())
        );
    }
    getPinnedNotes() {
        return this.getNotes().filter(note => note.pinned && !note.archived);
    }
    getArchivedNotes() {
        return this.getNotes().filter(note => note.archived);
    }
    exportNotes() {
        const notes = this.getNotes();
        const dataStr = JSON.stringify(notes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
    importNotes(jsonData) {
        try {
            const importedNotes = JSON.parse(jsonData);
            if (!Array.isArray(importedNotes)) {
                throw new Error('Invalid notes format');
            }
            const existingNotes = this.getNotes();
            const mergedNotes = [...existingNotes, ...importedNotes];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedNotes));
            this.displayNotes();
            return true;
        } catch (error) {
            console.error('Could not import notes:', error);
            return false;
        }
    }
    toggleBulkMode() {
        this.bulkMode = !this.bulkMode;
        this.selectedNotes.clear();        
        const bulkButton = document.getElementById('bulkActionsBtn');
        const bulkControls = document.getElementById('bulkControls');        
        if (this.bulkMode) {
            bulkButton?.classList.add('active');
            bulkControls?.classList.remove('hidden');
            this.displayNotes(false); 
        } else {
            bulkButton?.classList.remove('active');
            bulkControls?.classList.add('hidden');
            this.displayNotes(false); 
        }
        this.updateBulkControls();
    }
    toggleNoteSelection(noteId) {
        if (this.selectedNotes.has(noteId)) {
            this.selectedNotes.delete(noteId);
        } else {
            this.selectedNotes.add(noteId);
        }
        const checkbox = document.querySelector(`input[data-note-id="${noteId}"]`);
        if (checkbox) {
            checkbox.checked = this.selectedNotes.has(noteId);
        }        
        this.updateBulkControls();
    }
    selectAllNotes() {
        const visibleNotes = document.querySelectorAll('.note-item:not(.hidden)');        
        visibleNotes.forEach(noteElement => {
            const noteId = parseInt(noteElement.querySelector('[data-note-id]').getAttribute('data-note-id'));
            this.selectedNotes.add(noteId);            
            const checkbox = noteElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
            }
        });        
        this.updateBulkControls();
    }    
    deselectAllNotes() {
        this.selectedNotes.clear();
        
        const checkboxes = document.querySelectorAll('.note-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.updateBulkControls();
    }    
    updateBulkControls() {
        const selectedCount = this.selectedNotes.size;
        const selectedCountSpan = document.getElementById('selectedCount');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
        const bulkPinBtn = document.getElementById('bulkPinBtn');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const deselectAllBtn = document.getElementById('deselectAllBtn');        
        if (selectedCountSpan) {
            selectedCountSpan.textContent = selectedCount;
        }        
        const hasSelection = selectedCount > 0;
        bulkDeleteBtn?.toggleAttribute('disabled', !hasSelection);
        bulkArchiveBtn?.toggleAttribute('disabled', !hasSelection);
        bulkPinBtn?.toggleAttribute('disabled', !hasSelection);
        const visibleNotesCount = document.querySelectorAll('.note-item:not(.hidden)').length;
        if (selectAllBtn && deselectAllBtn) {
            if (selectedCount === visibleNotesCount && visibleNotesCount > 0) {
                selectAllBtn.style.display = 'none';
                deselectAllBtn.style.display = 'inline-block';
            } else {
                selectAllBtn.style.display = 'inline-block';
                deselectAllBtn.style.display = 'none';
            }
        }
    }    
    bulkDeleteNotes() {
        if (this.selectedNotes.size === 0) return;
        const count = this.selectedNotes.size;
        if (!confirm(`Are you sure you want to delete ${count} selected note${count > 1 ? 's' : ''}?`)) {
            return;
        }
        try {
            let notes = this.getNotes();
            const selectedArray = Array.from(this.selectedNotes);
            notes = notes.filter(note => !this.selectedNotes.has(note.id));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            selectedArray.forEach(noteId => {
                this.emitNoteUpdate('note-deleted', { id: noteId });
            });            
            this.selectedNotes.clear();
            this.displayNotes(false);
            this.updateBulkControls();
            console.log(`✓ Bulk deleted ${count} notes`);
        } catch (error) {
            console.error('Error in bulk delete:', error);
        }
    }    
    bulkArchiveNotes() {
        if (this.selectedNotes.size === 0) return;
        try {
            const notes = this.getNotes();
            let modifiedCount = 0;
            notes.forEach(note => {
                if (this.selectedNotes.has(note.id)) {
                    note.archived = !note.archived;
                    note.lastModified = new Date().toISOString();
                    modifiedCount++;
                    this.emitNoteUpdate('note-archived', note);
                }
            });            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));            
            this.selectedNotes.clear();
            this.displayNotes(false);
            this.updateBulkControls();            
            console.log(`✓ Bulk archived/unarchived ${modifiedCount} notes`);
        } catch (error) {
            console.error('Error in bulk archive:', error);
        }
    }
    bulkPinNotes() {
        if (this.selectedNotes.size === 0) return;        
        try {
            const notes = this.getNotes();
            let modifiedCount = 0;            
            notes.forEach(note => {
                if (this.selectedNotes.has(note.id)) {
                    note.pinned = !note.pinned;
                    note.lastModified = new Date().toISOString();
                    modifiedCount++;
                    this.emitNoteUpdate('note-pinned', note);
                }
            });        
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));        
            this.selectedNotes.clear();
            this.displayNotes(false);
            this.updateBulkControls();
            
            console.log(`✓ Bulk pinned/unpinned ${modifiedCount} notes`);
        } catch (error) {
            console.error('Error in bulk pin:', error);
        }
    }
}
export default NotesManager;