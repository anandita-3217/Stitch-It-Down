// // notes.js - Enhanced Note Manager with focus restoration and input validation
// import { detectAndCreateLinks, formatTimestamp } from '@components/utils.js';
// function closeModal() {
//     const modals = document.querySelectorAll('.note-category-modal, .note-edit-modal');
//     modals.forEach(modal => {
//         if (modal.parentNode) {
//             modal.parentNode.removeChild(modal);
//         }
//     });
// }
// class NotesManager {
//     constructor() {
//         this.STORAGE_KEY = 'stitch_Notes';
//         this.editingNote = null;
//         this.tempNoteData = null;
//         this.lastFocusedElement = null; 
//         this.debug = true;
//         this.init();
//     }
//     init() {
//         try {
//             const testData = this.getNotes();
//             if (!Array.isArray(testData)) {
//                 localStorage.removeItem(this.STORAGE_KEY);
//             }
//         } catch (error) {
//             localStorage.removeItem(this.STORAGE_KEY);
//         }
        
//         this.setupEventListeners();
//         this.loadNotes();
//         this.setupFocusTracking(); 
//     }

//     setupFocusTracking() {
//         const trackableFocusElements = ['noteInput', 'note-search'];
        
//         trackableFocusElements.forEach(id => {
//             const element = document.getElementById(id);
//             if (element) {
//                 element.addEventListener('focus', () => {
//                     this.lastFocusedElement = element;
//                 });
//             }
//         });
//     }

//     restoreFocus() {
//         setTimeout(() => {
//             if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
//                 this.lastFocusedElement.focus();
//             } else {
//                 const noteInput = document.getElementById('noteInput');
//                 if (noteInput) {
//                     noteInput.focus();
//                 }
//             }
//         }, 100);
//     }

//     validateInput(inputElement, errorMessage = 'Please enter a valid value') {
//         const value = inputElement.value.trim();
        
//         if (!value || value === '') {
//             this.shakeInput(inputElement);
//             return false;
//         }
//         return true;
//     }

//     shakeInput(inputElement) {
//         inputElement.classList.remove('shake-animation');
//         inputElement.offsetHeight;
//         inputElement.classList.add('shake-animation');
//         setTimeout(() => {
//             inputElement.classList.remove('shake-animation');
//         }, 600);
//     }

//     setupEventListeners() {
//         const addNoteBtn = document.getElementById('addNoteBtn');
//         const noteInput = document.getElementById('noteInput');
//         const notesContainer = document.getElementById('notesContainer');
        
//         console.log('Setting up event listeners...');
        
//         if (addNoteBtn) {
//             addNoteBtn.addEventListener('click', () => this.handleAddNote());
//         }
        
//         if (noteInput) {
//             noteInput.addEventListener('keypress', (e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) { // FEATURE IMPROVEMENT: Allow Shift+Enter for new lines in textarea
//                     e.preventDefault();
//                     this.handleAddNote();
//                 }
//             });
//         }

//         if (notesContainer) {
//             notesContainer.addEventListener('click', (e) => {
//                 const button = e.target.closest('button');
//                 if (button) {
//                     e.preventDefault();
//                     e.stopPropagation();
                    
//                     const noteId = parseInt(button.getAttribute('data-note-id'));
                    
//                     if (button.classList.contains('edit-note') || e.target.classList.contains('bi-pencil')) {
//                         console.log('Edit button clicked for note:', noteId);
//                         this.editNote(noteId);
//                     } else if (button.classList.contains('delete-note') || e.target.classList.contains('bi-trash')) {
//                         console.log('Delete button clicked for note:', noteId);
//                         this.deleteNote(noteId);
//                     } else if (button.classList.contains('pin-note') || e.target.classList.contains('bi-pin-angle')) {
//                         // FEATURE IMPROVEMENT: Add pin/unpin functionality for important notes
//                         console.log('Pin button clicked for note:', noteId);
//                         this.togglePinNote(noteId);
//                     } else if (button.classList.contains('archive-note') || e.target.classList.contains('bi-archive')) {
//                         // FEATURE IMPROVEMENT: Add archive functionality to hide notes without deleting
//                         console.log('Archive button clicked for note:', noteId);
//                         this.toggleArchiveNote(noteId);
//                     }
//                 }
//             });

//             console.log('✓ Notes container listeners attached');
//         }
//     }

//     handleAddNote() {
//         const noteInput = document.getElementById('noteInput');
//         if (!this.validateInput(noteInput, 'Please enter a note')) {
//             return;
//         }
        
//         const noteText = noteInput.value.trim();
//         this.showCategoryModal(noteText);
//         noteInput.value = '';
//     }

//     showCategoryModal(noteText) {
//         const modal = document.createElement('div');
//         modal.className = 'note-category-modal';
//         modal.innerHTML = `
//             <div class="modal-content">
//                 <h3>Note Settings</h3>
//                 <div class="note-text-preview">
//                     <strong>Note:</strong> ${noteText.length > 100 ? noteText.substring(0, 100) + '...' : noteText}
//                 </div>
                
//                 <div class="category-section">
//                     <label>Category:</label>
//                     <select id="note-category">
//                         <option value="general">General</option>
//                         <option value="work">Work</option>
//                         <option value="personal">Personal</option>
//                         <option value="ideas">Ideas</option>
//                         <option value="reminders">Reminders</option>
//                         <option value="quotes">Quotes</option>
//                         <option value="research">Research</option>
//                     </select>
//                 </div>
                
//                 <div class="color-section">
//                     <!-- FEATURE IMPROVEMENT: Color coding for visual organization -->
//                     <label>Color:</label>
//                     <div class="color-picker">
//                         <input type="radio" name="note-color" value="default" id="color-default" checked>
//                         <label for="color-default" class="color-option color-default"></label>
                        
//                         <input type="radio" name="note-color" value="yellow" id="color-yellow">
//                         <label for="color-yellow" class="color-option color-yellow"></label>
                        
//                         <input type="radio" name="note-color" value="blue" id="color-blue">
//                         <label for="color-blue" class="color-option color-blue"></label>
                        
//                         <input type="radio" name="note-color" value="green" id="color-green">
//                         <label for="color-green" class="color-option color-green"></label>
                        
//                         <input type="radio" name="note-color" value="pink" id="color-pink">
//                         <label for="color-pink" class="color-option color-pink"></label>
                        
//                         <input type="radio" name="note-color" value="purple" id="color-purple">
//                         <label for="color-purple" class="color-option color-purple"></label>
//                     </div>
//                 </div>
                
//                 <div class="tags-section">
//                     <!-- FEATURE IMPROVEMENT: Tags for better searchability and organization -->
//                     <label for="note-tags">Tags (comma-separated):</label>
//                     <input type="text" id="note-tags" placeholder="e.g., important, meeting, project">
//                 </div>
                
//                 <div class="options-section">
//                     <!-- FEATURE IMPROVEMENT: Additional note options -->
//                     <label>
//                         <input type="checkbox" id="note-pinned"> Pin this note
//                     </label>
//                 </div>
                
//                 <div class="modal-actions">
//                     <button data-action="create">Create Note</button>
//                     <button data-action="cancel">Cancel</button>
//                 </div>
//             </div>
//         `;
        
//         document.body.appendChild(modal);
//         this.tempNoteData = { text: noteText };
        
//         const buttons = modal.querySelectorAll('button');
//         buttons.forEach(button => {
//             button.addEventListener('click', (e) => {
//                 const action = e.target.getAttribute('data-action');
//                 if (action === 'create') {
//                     this.createNoteFromModal();
//                 } else if (action === 'cancel') {
//                     this.cancelNoteCreation(noteText);
//                 }
//             });
//         });
//     }

//     createNoteFromModal() {
//         if (!this.tempNoteData) return;
        
//         const category = document.getElementById('note-category').value;
//         const colorInput = document.querySelector('input[name="note-color"]:checked');
//         const tagsInput = document.getElementById('note-tags');
//         const pinnedCheckbox = document.getElementById('note-pinned');
        
//         const noteData = {
//             id: Date.now(),
//             text: this.tempNoteData.text,
//             type: 'note',
//             timestamp: new Date().toISOString(),
//             category: category,
//             color: colorInput ? colorInput.value : 'default',
//             tags: tagsInput.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
//             pinned: pinnedCheckbox.checked,
//             archived: false, // FEATURE IMPROVEMENT: Archive functionality
//             wordCount: this.countWords(this.tempNoteData.text), // FEATURE IMPROVEMENT: Word count tracking
//             lastModified: new Date().toISOString() // FEATURE IMPROVEMENT: Track modifications
//         };
        
//         this.saveNote(noteData);
//         closeModal();
//         this.tempNoteData = null;
//         this.restoreFocus(); 
//     }

//     cancelNoteCreation(noteText) {
//         const noteInput = document.getElementById('noteInput');
//         if (noteInput) {
//             noteInput.value = noteText;
//         }
//         closeModal();
//         this.tempNoteData = null;
//         this.restoreFocus();
//     }

//     // FEATURE IMPROVEMENT: Word count utility for notes
//     countWords(text) {
//         return text.trim().split(/\s+/).filter(word => word.length > 0).length;
//     }

//     saveNote(noteData) {
//         try {
//             const notes = this.getNotes();
//             notes.push(noteData);
//             localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
//             this.displayNotes();
//             this.emitNoteUpdate('note-added', noteData);
//         } catch (error) {
//             console.error('Could not save note to localStorage:', error);
//         }
//     }

//     getNotes() {
//         try {
//             const stored = localStorage.getItem(this.STORAGE_KEY);
//             if (!stored) {
//                 return [];
//             }
//             const parsed = JSON.parse(stored);
//             return Array.isArray(parsed) ? parsed : [];
//         } catch (error) {
//             console.error('Could not load notes from localStorage:', error);
//             localStorage.removeItem(this.STORAGE_KEY);
//             return [];
//         }
//     }

//     loadNotes() {
//         const notes = this.getNotes();
//         this.displayNotes();
//     }
    
//     displayNotes(filter = null) {
//         const notes = this.getNotes();
//         const container = document.getElementById('notesContainer');
//         if (!container) return;
        
//         container.innerHTML = '';
//         if (!Array.isArray(notes)) {
//             console.error('Notes is not an array:', notes);
//             this.showEmptyState(container);
//             return;
//         }

//         let filteredNotes = filter ? notes.filter(filter) : notes;

//         if (!Array.isArray(filteredNotes)) {
//             console.error('Filtered notes is not an array:', filteredNotes);
//             filteredNotes = [];
//         }

//         // FEATURE IMPROVEMENT: Enhanced sorting - pinned first, then by last modified
//         filteredNotes.sort((a, b) => {
//             // Pinned notes first
//             if (a.pinned && !b.pinned) return -1;
//             if (!a.pinned && b.pinned) return 1;
            
//             // Then by last modified (most recent first)
//             const aTime = new Date(a.lastModified || a.timestamp);
//             const bTime = new Date(b.lastModified || b.timestamp);
//             return bTime - aTime;
//         });
        
//         filteredNotes.forEach(note => {
//             const noteElement = this.createNoteElement(note);
//             container.appendChild(noteElement);
//         });
        
//         if (filteredNotes.length === 0) {
//             this.showEmptyState(container);
//         }
//     }

//     createNoteElement(note) {
//         const div = document.createElement('div');
//         div.className = `note-item color-${note.color} ${note.pinned ? 'pinned' : ''} ${note.archived ? 'archived' : ''}`;
        
//         // FEATURE IMPROVEMENT: Truncate long notes with expand/collapse functionality
//         const isLongNote = note.text.length > 200;
//         const truncatedText = isLongNote ? note.text.substring(0, 200) + '...' : note.text;
        
//         div.innerHTML = `
//             <div class="note-content">
//                 <div class="note-header">
//                     ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
//                     <span class="note-category">${note.category}</span>
//                     <span class="note-word-count">${note.wordCount} words</span>
//                 </div>
//                 <div class="note-text ${isLongNote ? 'expandable' : ''}" data-full-text="${note.text.replace(/"/g, '&quot;')}">
//                     ${detectAndCreateLinks(isLongNote ? truncatedText : note.text)}
//                     ${isLongNote ? '<button class="expand-note-btn" type="button">Show more</button>' : ''}
//                 </div>
//                 ${note.tags.length > 0 ? `
//                     <div class="note-tags">
//                         ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
//                     </div>
//                 ` : ''}
//             </div>
//             <div class="note-meta">
//                 <div class="note-timestamp">
//                     Created: ${formatTimestamp(note.timestamp)}
//                     ${note.lastModified !== note.timestamp ? `<br>Modified: ${formatTimestamp(note.lastModified)}` : ''}
//                 </div>
//             </div>
//             <div class="note-actions">
//                 <button class="pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}" type="button">
//                     <i class="bi ${note.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}"></i>
//                 </button>
//                 <button class="archive-note ${note.archived ? 'archived' : ''}" data-note-id="${note.id}" title="${note.archived ? 'Unarchive' : 'Archive'}" type="button">
//                     <i class="bi ${note.archived ? 'bi-archive-fill' : 'bi-archive'}"></i>
//                 </button>
//                 <button class="edit-note" data-note-id="${note.id}" title="Edit" type="button">
//                     <i class="bi bi-pencil"></i>
//                 </button>
//                 <button class="delete-note" data-note-id="${note.id}" title="Delete" type="button">
//                     <i class="bi bi-trash"></i>
//                 </button>
//             </div>
//         `;

//         // FEATURE IMPROVEMENT: Expand/collapse functionality for long notes
//         const expandBtn = div.querySelector('.expand-note-btn');
//         const noteTextDiv = div.querySelector('.note-text');
        
//         if (expandBtn && noteTextDiv) {
//             expandBtn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const isExpanded = noteTextDiv.classList.contains('expanded');
                
//                 if (isExpanded) {
//                     noteTextDiv.innerHTML = detectAndCreateLinks(truncatedText) + '<button class="expand-note-btn" type="button">Show more</button>';
//                     noteTextDiv.classList.remove('expanded');
//                 } else {
//                     noteTextDiv.innerHTML = detectAndCreateLinks(note.text) + '<button class="expand-note-btn" type="button">Show less</button>';
//                     noteTextDiv.classList.add('expanded');
//                 }
                
//                 // Re-attach event listener to the new button
//                 const newExpandBtn = noteTextDiv.querySelector('.expand-note-btn');
//                 if (newExpandBtn) {
//                     newExpandBtn.addEventListener('click', arguments.callee);
//                 }
//             });
//         }
        
//         return div;
//     }

//     // FEATURE IMPROVEMENT: Pin/unpin functionality
//     togglePinNote(noteId) {
//         console.log('togglePinNote called with ID:', noteId);
        
//         if (!noteId || isNaN(noteId)) {
//             console.error('Invalid note ID provided to togglePinNote:', noteId);
//             return;
//         }
        
//         try {
//             const notes = this.getNotes();
//             const noteIndex = notes.findIndex(note => note.id === noteId);
            
//             if (noteIndex !== -1) {
//                 const oldPinned = notes[noteIndex].pinned;
//                 notes[noteIndex].pinned = !notes[noteIndex].pinned;
//                 notes[noteIndex].lastModified = new Date().toISOString();
//                 const newPinned = notes[noteIndex].pinned;
                
//                 console.log(`✓ Note ${noteId} pin toggled: ${oldPinned} → ${newPinned}`);
                
//                 localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
//                 this.displayNotes();
//                 this.emitNoteUpdate('note-pinned', notes[noteIndex]);
                
//             } else {
//                 console.error('Note not found with ID:', noteId);
//             }
//         } catch (error) {
//             console.error('Error in togglePinNote:', error);
//         }
//     }

//     // FEATURE IMPROVEMENT: Archive/unarchive functionality
//     toggleArchiveNote(noteId) {
//         console.log('toggleArchiveNote called with ID:', noteId);
        
//         if (!noteId || isNaN(noteId)) {
//             console.error('Invalid note ID provided to toggleArchiveNote:', noteId);
//             return;
//         }
        
//         try {
//             const notes = this.getNotes();
//             const noteIndex = notes.findIndex(note => note.id === noteId);
            
//             if (noteIndex !== -1) {
//                 const oldArchived = notes[noteIndex].archived;
//                 notes[noteIndex].archived = !notes[noteIndex].archived;
//                 notes[noteIndex].lastModified = new Date().toISOString();
//                 const newArchived = notes[noteIndex].archived;
                
//                 console.log(`✓ Note ${noteId} archive toggled: ${oldArchived} → ${newArchived}`);
                
//                 localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
//                 this.displayNotes();
//                 this.emitNoteUpdate('note-archived', notes[noteIndex]);
                
//             } else {
//                 console.error('Note not found with ID:', noteId);
//             }
//         } catch (error) {
//             console.error('Error in toggleArchiveNote:', error);
//         }
//     }

//     deleteNote(noteId) {
//         console.log('deleteNote called with ID:', noteId);
        
//         if (!noteId || isNaN(noteId)) {
//             console.error('Invalid note ID:', noteId);
//             return;
//         }

//         if (!confirm('Are you sure you want to delete this note?')) {
//             this.restoreFocus();
//             return;
//         }
        
//         try {
//             let notes = this.getNotes();
//             console.log('Notes before delete:', notes.length);
            
//             const noteToDelete = notes.find(note => note.id === noteId);
//             console.log('Note to delete:', noteToDelete);
            
//             if (!noteToDelete) {
//                 console.error('Note not found with ID:', noteId);
//                 this.restoreFocus();
//                 return;
//             }
            
//             notes = notes.filter(note => note.id !== noteId);
//             console.log('Notes after delete:', notes.length);
            
//             localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
//             this.displayNotes();
//             this.emitNoteUpdate('note-deleted', noteToDelete);
            
//             console.log('Note deleted successfully');
//             this.restoreFocus();
//         } catch (error) {
//             console.error('Could not delete note:', error);
//             this.restoreFocus();
//         }
//     }

//     editNote(noteId) {
//         console.log('editNote called with ID:', noteId);
        
//         if (!noteId || isNaN(noteId)) {
//             console.error('Invalid note ID:', noteId);
//             return;
//         }

//         const notes = this.getNotes();
//         const note = notes.find(n => n.id === noteId);
        
//         if (!note) {
//             console.error('Note not found with ID:', noteId);
//             this.restoreFocus();
//             return;
//         }
        
//         console.log('Editing note:', note);
//         this.editingNote = note;
//         this.showEditModal(note);
//     }

//     showEditModal(note) {
//         closeModal();
        
//         const modal = document.createElement('div');
//         modal.className = 'note-edit-modal';
//         modal.innerHTML = `
//             <div class="modal-content">
//                 <h3>Edit Note</h3>
//                 <textarea id="editNoteText" rows="6">${note.text}</textarea>
                
//                 <div class="edit-sections">
//                     <div class="category-section">
//                         <label>Category:</label>
//                         <select id="editCategory">
//                             <option value="general" ${note.category === 'general' ? 'selected' : ''}>General</option>
//                             <option value="work" ${note.category === 'work' ? 'selected' : ''}>Work</option>
//                             <option value="personal" ${note.category === 'personal' ? 'selected' : ''}>Personal</option>
//                             <option value="ideas" ${note.category === 'ideas' ? 'selected' : ''}>Ideas</option>
//                             <option value="reminders" ${note.category === 'reminders' ? 'selected' : ''}>Reminders</option>
//                             <option value="quotes" ${note.category === 'quotes' ? 'selected' : ''}>Quotes</option>
//                             <option value="research" ${note.category === 'research' ? 'selected' : ''}>Research</option>
//                         </select>
//                     </div>
                    
//                     <div class="color-section">
//                         <label>Color:</label>
//                         <div class="color-picker">
//                             <input type="radio" name="edit-note-color" value="default" id="edit-color-default" ${note.color === 'default' ? 'checked' : ''}>
//                             <label for="edit-color-default" class="color-option color-default"></label>
                            
//                             <input type="radio" name="edit-note-color" value="yellow" id="edit-color-yellow" ${note.color === 'yellow' ? 'checked' : ''}>
//                             <label for="edit-color-yellow" class="color-option color-yellow"></label>
                            
//                             <input type="radio" name="edit-note-color" value="blue" id="edit-color-blue" ${note.color === 'blue' ? 'checked' : ''}>
//                             <label for="edit-color-blue" class="color-option color-blue"></label>
                            
//                             <input type="radio" name="edit-note-color" value="green" id="edit-color-green" ${note.color === 'green' ? 'checked' : ''}>
//                             <label for="edit-color-green" class="color-option color-green"></label>
                            
//                             <input type="radio" name="edit-note-color" value="pink" id="edit-color-pink" ${note.color === 'pink' ? 'checked' : ''}>
//                             <label for="edit-color-pink" class="color-option color-pink"></label>
                            
//                             <input type="radio" name="edit-note-color" value="purple" id="edit-color-purple" ${note.color === 'purple' ? 'checked' : ''}>
//                             <label for="edit-color-purple" class="color-option color-purple"></label>
//                         </div>
//                     </div>
                    
//                     <div class="tags-section">
//                         <label for="edit-tags">Tags:</label>
//                         <input type="text" id="edit-tags" value="${note.tags.join(', ')}">
//                     </div>
                    
//                     <div class="options-section">
//                         <label>
//                             <input type="checkbox" id="edit-pinned" ${note.pinned ? 'checked' : ''}> Pin this note
//                         </label>
//                     </div>
//                 </div>
                
//                 <div class="modal-actions">
//                     <button data-action="save" type="button">Save Changes</button>
//                     <button data-action="cancel" type="button">Cancel</button>
//                 </div>
//             </div>
//         `;
        
//         document.body.appendChild(modal);
        
//         const buttons = modal.querySelectorAll('button');
//         buttons.forEach(button => {
//             button.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const action = e.target.getAttribute('data-action');
//                 if (action === 'save') {
//                     this.saveEditedNote();
//                 } else if (action === 'cancel') {
//                     closeModal();
//                     this.editingNote = null;
//                     this.restoreFocus(); 
//                 }
//             });
//         });
//     }

//     saveEditedNote() {
//         const textArea = document.getElementById('editNoteText');
//         const categorySelect = document.getElementById('editCategory');
//         const colorInput = document.querySelector('input[name="edit-note-color"]:checked');
//         const tagsInput = document.getElementById('edit-tags');
//         const pinnedCheckbox = document.getElementById('edit-pinned');
        
//         if (!this.validateInput(textArea, 'Please enter a note')) {
//             return;
//         }
        
//         const newText = textArea.value.trim();
//         if (!this.editingNote) return;
        
//         try {
//             const notes = this.getNotes();
//             const noteIndex = notes.findIndex(note => note.id === this.editingNote.id);
            
//             if (noteIndex !== -1) {
//                 notes[noteIndex].text = newText;
//                 notes[noteIndex].category = categorySelect.value;
//                 notes[noteIndex].color = colorInput ? colorInput.value : 'default';
//                 notes[noteIndex].tags = tagsInput.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
//                 notes[noteIndex].pinned = pinnedCheckbox.checked;
//                 notes[noteIndex].wordCount = this.countWords(newText);
//                 notes[noteIndex].lastModified = new Date().toISOString();
                
//                 localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
//                 this.displayNotes();
//                 this.emitNoteUpdate('note-updated', notes[noteIndex]);
//             }
//         } catch (error) {
//             console.error('Could not save edited note:', error);
//         }
        
//         this.editingNote = null;
//         closeModal();
//         this.restoreFocus();
//     }

//     showEmptyState(container) {
//         const emptyState = document.createElement('div');
//         emptyState.className = 'empty-state';
//         emptyState.innerHTML = `
//             <div class="empty-icon"><i class="bi bi-journal-text"></i></div>
//             <p>No notes yet. Create your first note!</p>
//         `;
//         container.appendChild(emptyState);
//     }

//     emitNoteUpdate(eventType, noteData) {
//         const event = new CustomEvent('noteUpdate', {
//             detail: { type: eventType, note: noteData }
//         });
//         document.dispatchEvent(event);
//     }

//     // FEATURE IMPROVEMENT: Search functionality for notes
//     searchNotes(query) {
//         const notes = this.getNotes();
//         const searchTerm = query.toLowerCase();
        
//         return notes.filter(note => 
//             note.text.toLowerCase().includes(searchTerm) ||
//             note.category.toLowerCase().includes(searchTerm) ||
//             note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
//         );
//     }

//     // FEATURE IMPROVEMENT: Filter notes by category
//     getNotesByCategory(category) {
//         return this.getNotes().filter(note => note.category === category);
//     }

//     // FEATURE IMPROVEMENT: Filter notes by tag
//     getNotesByTag(tag) {
//         return this.getNotes().filter(note => 
//             note.tags.some(noteTag => noteTag.toLowerCase() === tag.toLowerCase())
//         );
//     }

//     // FEATURE IMPROVEMENT: Get pinned notes
//     getPinnedNotes() {
//         return this.getNotes().filter(note => note.pinned && !note.archived);
//     }

//     // FEATURE IMPROVEMENT: Get archived notes
//     getArchivedNotes() {
//         return this.getNotes().filter(note => note.archived);
//     }

//     // FEATURE IMPROVEMENT: Export notes as JSON
//     exportNotes() {
//         const notes = this.getNotes();
//         const dataStr = JSON.stringify(notes, null, 2);
//         const dataBlob = new Blob([dataStr], {type: 'application/json'});
//         const url = URL.createObjectURL(dataBlob);
        
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
//         link.click();
        
//         URL.revokeObjectURL(url);
//     }

//     // FEATURE IMPROVEMENT: Import notes from JSON
//     importNotes(jsonData) {
//         try {
//             const importedNotes = JSON.parse(jsonData);
//             if (!Array.isArray(importedNotes)) {
//                 throw new Error('Invalid notes format');
//             }
            
//             const existingNotes = this.getNotes();
//             const mergedNotes = [...existingNotes, ...importedNotes];
            
//             localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedNotes));
//             this.displayNotes();
            
//             return true;
//         } catch (error) {
//             console.error('Could not import notes:', error);
//             return false;
//         }
//     }
// }
// export default NotesManager;
// notes.js - Enhanced Note Manager with focus restoration and input validation
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
        this.debug = true;
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
        
        this.setupEventListeners();
        this.loadNotes();
        this.setupFocusTracking(); 
    }

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
            });

            console.log('✓ Notes container listeners attached');
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
            this.displayNotes();
            this.emitNoteUpdate('note-added', noteData);
        } catch (error) {
            console.error('Could not save note to localStorage:', error);
        }
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
        const notes = this.getNotes();
        this.displayNotes();
    }
    
    displayNotes(filter = null) {
        const notes = this.getNotes();
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        if (!Array.isArray(notes)) {
            console.error('Notes is not an array:', notes);
            this.showEmptyState(container);
            return;
        }

        let filteredNotes = filter ? notes.filter(filter) : notes;

        if (!Array.isArray(filteredNotes)) {
            console.error('Filtered notes is not an array:', filteredNotes);
            filteredNotes = [];
        }

        // Enhanced sorting - pinned first, then by last modified
        filteredNotes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            const aTime = new Date(a.lastModified || a.timestamp);
            const bTime = new Date(b.lastModified || b.timestamp);
            return bTime - aTime;
        });
        
        filteredNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            container.appendChild(noteElement);
        });
        
        if (filteredNotes.length === 0) {
            this.showEmptyState(container);
        }
    }

    // FIXED: Proper expand/collapse functionality
    // createNoteElement(note) {
    //     const div = document.createElement('div');
    //     div.className = `note-item color-${note.color} ${note.pinned ? 'pinned' : ''} ${note.archived ? 'archived' : ''}`;
        
    //     const isLongNote = note.text.length > 200;
    //     const truncatedText = isLongNote ? note.text.substring(0, 200) + '...' : note.text;
        
    //     div.innerHTML = `
    //         <div class="note-content">
    //             <div class="note-header">
    //                 ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
    //                 <span class="note-category">${note.category}</span>
    //                 <span class="note-word-count">${note.wordCount} words</span>
    //             </div>
    //             <div class="note-text ${isLongNote ? 'expandable' : ''}" data-full-text="${note.text.replace(/"/g, '&quot;')}">
    //                 ${detectAndCreateLinks(isLongNote ? truncatedText : note.text)}
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

    //     // FIXED: Proper expand/collapse functionality using arrow function to avoid 'arguments.callee'
    //     const expandBtn = div.querySelector('.expand-note-btn');
    //     const noteTextDiv = div.querySelector('.note-text');
        
    //     if (expandBtn && noteTextDiv) {
    //         // Create a reusable toggle function
    //         const toggleExpand = (e) => {
    //             e.preventDefault();
    //             const isExpanded = noteTextDiv.classList.contains('expanded');
                
    //             if (isExpanded) {
    //                 noteTextDiv.innerHTML = detectAndCreateLinks(truncatedText) + '<button class="expand-note-btn" type="button">Show more</button>';
    //                 noteTextDiv.classList.remove('expanded');
    //             } else {
    //                 noteTextDiv.innerHTML = detectAndCreateLinks(note.text) + '<button class="expand-note-btn" type="button">Show less</button>';
    //                 noteTextDiv.classList.add('expanded');
    //             }
                
    //             // Re-attach event listener to the new button
    //             const newExpandBtn = noteTextDiv.querySelector('.expand-note-btn');
    //             if (newExpandBtn) {
    //                 newExpandBtn.addEventListener('click', toggleExpand);
    //             }
    //         };
            
    //         expandBtn.addEventListener('click', toggleExpand);
    //     }
        
    //     return div;
    // }
    createNoteElement(note) {
        const div = document.createElement('div');
        div.className = `note-item color-${note.color} ${note.pinned ? 'pinned' : ''} ${note.archived ? 'archived' : ''}`;
        
        const isLongNote = note.text.length > 200;
        const truncatedText = isLongNote ? note.text.substring(0, 200) + '...' : note.text;
        
        // Helper function to safely escape HTML and then create links
        const safeTextWithLinks = (text) => {
            // First escape HTML entities
            const escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            // Then apply link detection on the escaped text
            return detectAndCreateLinks(escaped);
        };

        div.innerHTML = `
            <div class="note-content">
                <div class="note-header">
                    ${note.pinned ? '<i class="bi bi-pin-angle-fill pinned-icon"></i>' : ''}
                    <span class="note-category">${note.category}</span>
                    <span class="note-word-count">${note.wordCount} words</span>
                </div>
                <div class="note-text ${isLongNote ? 'expandable' : ''}" data-full-text="${note.text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">
                    ${safeTextWithLinks(isLongNote ? truncatedText : note.text)}
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
                
        // Fixed expand/collapse functionality
        const noteTextDiv = div.querySelector('.note-text');
        let isExpanded = false;
                
        // Use event delegation to handle both initial and dynamically created buttons
        const toggleExpand = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isExpanded) {
                // Collapse
                noteTextDiv.innerHTML = safeTextWithLinks(truncatedText) + '<button class="expand-note-btn" type="button">Show more</button>';
                noteTextDiv.classList.remove('expanded');
                isExpanded = false;
            } else {
                // Expand
                noteTextDiv.innerHTML = safeTextWithLinks(note.text) + '<button class="expand-note-btn" type="button">Show less</button>';
                noteTextDiv.classList.add('expanded');
                isExpanded = true;
            }
        };

        // Use event delegation on the noteTextDiv instead of individual button listeners
        if (isLongNote) {
            noteTextDiv.addEventListener('click', (e) => {
                if (e.target.classList.contains('expand-note-btn')) {
                    toggleExpand(e);
                }
            });
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
                this.displayNotes();
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
                this.displayNotes();
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
            this.displayNotes();
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
                this.displayNotes();
                this.emitNoteUpdate('note-updated', notes[noteIndex]);
            }
        } catch (error) {
            console.error('Could not save edited note:', error);
        }
        
        this.editingNote = null;
        closeModal();
        this.restoreFocus();
    }

    showEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon"><i class="bi bi-journal-text"></i></div>
            <p>No notes yet. Create your first note!</p>
        `;
        container.appendChild(emptyState);
    }

    emitNoteUpdate(eventType, noteData) {
        const event = new CustomEvent('noteUpdate', {
            detail: { type: eventType, note: noteData }
        });
        document.dispatchEvent(event);
    }

    // Additional utility methods
    searchNotes(query) {
        const notes = this.getNotes();
        const searchTerm = query.toLowerCase();
        
        return notes.filter(note => 
            note.text.toLowerCase().includes(searchTerm) ||
            note.category.toLowerCase().includes(searchTerm) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

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
}

export default NotesManager;