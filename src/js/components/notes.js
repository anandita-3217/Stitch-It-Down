// notes.js - Enhanced Note Manager with focus restoration and input validation
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';

class NoteManager {
    constructor() {
        this.STORAGE_KEY = 'stitchNotes';
        this.editingNote = null;
        this.tempNoteData = null;
        this.lastFocusedElement = null; // Track last focused element
        this.debug = true;

        this.init();
    }

    init() {
        // Clear any corrupted data on initialization
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
        this.setupProgressTracking();
        this.setupDeadlineAlerts();
        this.setupISTReset();
        this.setupFocusTracking(); // Add focus tracking
    }

    // New method to track focus on input elements
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

    // Method to restore focus to the last focused input
    restoreFocus() {
        setTimeout(() => {
            if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            } else {
                // Default to note input if no last focused element
                const noteInput = document.getElementById('noteInput');
                if (noteInput) {
                    noteInput.focus();
                }
            }
        }, 100); // Small delay to ensure modal is fully closed
    }

    // Enhanced input validation with shake animation
    validateInput(inputElement, errorMessage = 'Please enter a valid value') {
        const value = inputElement.value.trim();
        
        if (!value || value === '') {
            this.shakeInput(inputElement);
            return false;
        }
        return true;
    }

    // Shake animation for invalid inputs
    shakeInput(inputElement) {
        inputElement.classList.remove('shake-animation');
        // Force reflow to restart animation
        inputElement.offsetHeight;
        inputElement.classList.add('shake-animation');
        
        // Remove shake class after animation
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
            if (e.key === 'Enter') this.handleAddNote();
        });
    }

    if (notesContainer) {
        // FIXED: Separate click handler specifically for checkboxes
        notesContainer.addEventListener('click', (e) => {
            const target = e.target;
            
            // Handle checkbox clicks FIRST
            if (target.type === 'checkbox' && target.classList.contains('note-checkbox')) {
                console.log('Checkbox clicked:', target);
                const noteId = parseInt(target.getAttribute('data-note-id'));
                console.log('Toggling note ID:', noteId);
                
                if (noteId && !isNaN(noteId)) {
                    // Small delay to let checkbox state update
                    setTimeout(() => {
                        this.toggleNote(noteId);
                    }, 10);
                }
                return; // Exit early for checkbox clicks
            }
            
            // Handle button clicks (edit/delete)
            const button = target.closest('button');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                
                const noteId = parseInt(button.getAttribute('data-note-id'));
                
                if (button.classList.contains('edit-note') || target.classList.contains('bi-pencil')) {
                    console.log('Edit button clicked for note:', noteId);
                    this.editNote(noteId);
                } else if (button.classList.contains('delete-note') || target.classList.contains('bi-trash')) {
                    console.log('Delete button clicked for note:', noteId);
                    this.deleteNote(noteId);
                }
            }
        });

        // BACKUP: Also listen for change events (in case click doesn't work)
        notesContainer.addEventListener('change', (e) => {
            console.log('Change event detected:', e.target);
            
            if (e.target.type === 'checkbox' && e.target.classList.contains('note-checkbox')) {
                const noteId = parseInt(e.target.getAttribute('data-note-id'));
                console.log('Change event - toggling note ID:', noteId, 'Checked:', e.target.checked);
                
                if (noteId && !isNaN(noteId)) {
                    this.toggleNote(noteId);
                }
            }
        });

        console.log('✓ note container listeners attached');
    }
}



    handleAddNote() {
        const noteInput = document.getElementById('noteInput');
        
        // Validate input with shake animation
        if (!this.validateInput(noteInput, 'Please enter a note description')) {
            return;
        }
        
        const noteText = noteInput.value.trim();
        this.showFrequencyModal(noteText);
        noteInput.value = '';
    }

    showFrequencyModal(noteText) {
        const modal = document.createElement('div');
        modal.className = 'note-frequency-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Note Settings</h3>
                <div class="note-text-preview">
                    <strong>note:</strong> ${noteText}
                </div>
                
                <div class="frequency-section">
                    <label>Frequency:</label>
                    <select id="note-frequency">
                        <option value="once">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                
                <div class="deadline-section">
                    <label for="note-deadline">Deadline (optional):</label>
                    <input type="datetime-local" id="note-deadline" 
                           min="${new Date().toISOString().slice(0, 16)}">
                </div>
                
                <div class="alert-section">
                    <label for="alert-time">Alert before deadline:</label>
                    <select id="alert-time">
                        <option value="0">No alert</option>
                        <option value="15">15 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="1440">1 day</option>
                        <option value="10080">1 week</option>
                    </select>
                </div>
                
                <div class="priority-section">
                    <label for="note-priority">Priority:</label>
                    <select id="note-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                
                <div class="modal-actions">
                    <button data-action="create">Create note</button>
                    <button data-action="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.tempNoteData = { text: noteText };
        
        // Add event listeners
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
        
        const frequency = document.getElementById('note-frequency').value;
        const deadlineInput = document.getElementById('note-deadline');
        const alertSelect = document.getElementById('alert-time');
        const prioritySelect = document.getElementById('note-priority');
        
        const noteData = {
            id: Date.now(),
            text: this.tempNoteData.text,
            type: 'note',
            timestamp: new Date().toISOString(),
            completed: false,
            frequency: frequency,
            priority: prioritySelect.value,
            dueDate: new Date().toISOString().split('T')[0]
        };
        
        // Set next reset for recurring notes
        if (frequency !== 'once') {
            noteData.nextReset = this.calculateNextReset(frequency);
        }
        
        // Handle deadline and alerts
        if (deadlineInput.value) {
            noteData.deadline = new Date(deadlineInput.value).toISOString();
            const alertMinutes = parseInt(alertSelect.value) || 0;
            
            if (alertMinutes > 0) {
                const alertTime = new Date(deadlineInput.value);
                alertTime.setMinutes(alertTime.getMinutes() - alertMinutes);
                noteData.alertTime = alertTime.toISOString();
                noteData.alertMinutes = alertMinutes;
            }
        }
        
        this.saveNote(noteData);
        closeModal();
        this.tempNoteData = null;
        this.restoreFocus(); // Restore focus after creating Note
    }

    cancelNoteCreation(noteText) {
        // Return text to input field
        const noteInput = document.getElementById('noteInput');
        if (noteInput) {
            noteInput.value = noteText;
        }
        closeModal();
        this.tempNoteData = null;
        this.restoreFocus(); // Restore focus after canceling
    }

    calculateNextReset(frequency) {
        const now = new Date();
        switch(frequency) {
            case 'daily': 
                return new Date(now.getTime() + 24*60*60*1000);
            case 'weekly': 
                return new Date(now.getTime() + 7*24*60*60*1000);
            case 'biweekly': 
                return new Date(now.getTime() + 14*24*60*60*1000);
            case 'monthly': 
                const nextMonth = new Date(now);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth;
            default: 
                return new Date(now.getTime() + 24*60*60*1000);
        }
    }

    saveNote(noteData) {
        try {
            const notes = this.getNotes();
            notes.push(noteData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes();
            this.updateProgress();
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
            // Ensure we always return an array
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Could not load Notes from localStorage:', error);
            // Clear corrupted data
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
        }
    }

    loadNotes() {
        const notes = this.getNotes();
        this.displayNotes();
        this.updateProgress();
    }
    
    displayNotes(filter = null) {
        const notes = this.getNotes();
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Ensure notes is always an array
        if (!Array.isArray(notes)) {
            console.error('notes is not an array:', notes);
            this.showEmptyState(container);
            return;
        }
        
        let filteredNotes = filter ? notes.filter(filter) : notes;
        
        // Double-check that filteredNotes is an array
        if (!Array.isArray(filteredNotes)) {
            console.error('Filtered Notes is not an array:', filteredNotes);
            filteredNotes = [];
        }
        
        // Sort by priority and due date
        filteredNotes.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            
            if (aPriority !== bPriority) return bPriority - aPriority;
            
            // If same priority, sort by deadline
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return 0;
        });
        
        filteredNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            container.appendChild(noteElement);
        });
        
        if (filteredNotes.length === 0) {
            this.showEmptyState(container);
        }
    }

    createNoteElement(note) {
    const div = document.createElement('div');
    div.className = `note-item priority-${note.priority} ${note.completed ? 'completed' : ''}`;
    
    const isOverdue = note.deadline && this.isOverdue(note.deadline);
    if (isOverdue) div.classList.add('overdue');
    
    div.innerHTML = `
        <div class="note-content">
            <input type="checkbox" 
                   ${note.completed ? 'checked' : ''} 
                   data-note-id="${note.id}" 
                   class="note-checkbox"
                   id="checkbox-${note.id}">
            <div class="note-text ${note.completed ? 'completed-text' : ''}">
                ${note.completed ? 
                    `<del>${detectAndCreateLinks(note.text)}</del>` : 
                    detectAndCreateLinks(note.text)
                }
            </div>
            <div class="note-meta">
                <span class="note-frequency">${note.frequency}</span>
                <span class="note-priority priority-${note.priority}">${note.priority}</span>
                ${note.deadline ? `
                    <div class="deadline-info ${isOverdue ? 'overdue' : ''}">
                        📅 ${this.formatDeadline(note.deadline)}
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="note-timestamp">${formatTimestamp(note.timestamp)}</div>
        <div class="note-actions">
            <button class="edit-note" data-note-id="${note.id}" title="Edit" type="button">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="delete-note" data-note-id="${note.id}" title="Delete" type="button">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    // SOLUTION 2: Direct event binding (more reliable than delegation)
    const checkbox = div.querySelector('.note-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', (e) => {
            console.log('Direct checkbox event:', e.target.checked, 'note ID:', note.id);
            this.toggleNote(note.id);
        });
        
        // Also handle click events
        checkbox.addEventListener('click', (e) => {
            console.log('Direct checkbox click:', e.target.checked, 'note ID:', note.id);
            // Let the change event handle the toggle
        });
    }
    
    return div;
}


    detectAndCreateLinks(text) {
        // Simple link detection and creation
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    toggleNote(noteId) {
    console.log('toggleNote called with ID:', noteId);
    
    if (!noteId || isNaN(noteId)) {
        console.error('Invalid note ID provided to toggleNote:', noteId);
        return;
    }
    
    try {
        const notes = this.getNotes();
        const noteIndex = notes.findIndex(note => note.id === noteId);
        
        if (noteIndex !== -1) {
            const oldStatus = notes[noteIndex].completed;
            notes[noteIndex].completed = !notes[noteIndex].completed;
            const newStatus = notes[noteIndex].completed;
            
            console.log(`✓ note ${noteId} toggled: ${oldStatus} → ${newStatus}`);
            
            // Reset alert flag if note is being uncompleted
            if (!notes[noteIndex].completed) {
                delete notes[noteIndex].alerted;
            }
            
            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            
            // IMMEDIATE visual update for the specific checkbox
            const checkbox = document.querySelector(`input[data-note-id="${noteId}"]`);
            if (checkbox) {
                checkbox.checked = newStatus;
                console.log('✓ Checkbox visual state updated');
            }
            
            // Update display and progress
            this.displayNotes();
            this.updateProgress();
            this.emitNoteUpdate('note-toggled', notes[noteIndex]);
            
        } else {
            console.error('note not found with ID:', noteId);
        }
    } catch (error) {
        console.error('Error in toggleNote:', error);
    }
}


    deleteNote(noteId) {
        console.log('deletenote called with ID:', noteId);
        
        if (!noteId || isNaN(noteId)) {
            console.error('Invalid note ID:', noteId);
            return;
        }

        if (!confirm('Are you sure you want to delete this note?')) {
            this.restoreFocus(); // Restore focus if user cancels
            return;
        }
        
        try {
            let notes = this.getNotes();
            console.log('Notes before delete:', notes.length);
            
            const noteToDelete = notes.find(note => note.id === noteId);
            console.log('note to delete:', noteToDelete);
            
            if (!noteToDelete) {
                console.error('note not found with ID:', noteId);
                this.restoreFocus();
                return;
            }
            
            notes = notes.filter(note => note.id !== noteId);
            console.log('notes after delete:', notes.length);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            this.displayNotes();
            this.updateProgress();
            this.emitNoteUpdate('note-deleted', noteToDelete);
            
            console.log('note deleted successfully');
            this.restoreFocus(); // Restore focus after successful deletion
        } catch (error) {
            console.error('Could not delete note:', error);
            this.restoreFocus();
        }
    }

    editNote(noteId) {
        console.log('editnote called with ID:', noteId);
        
        if (!noteId || isNaN(noteId)) {
            console.error('Invalid note ID:', noteId);
            return;
        }

        const notes = this.getnotes();
        const note = notes.find(t => t.id === noteId);
        
        if (!note) {
            console.error('note not found with ID:', noteId);
            this.restoreFocus();
            return;
        }
        
        console.log('Editing note:', note);
        this.editingNote = note;
        this.showEditModal(note);
    }

    showEditModal(note) {
        // Close any existing modals first
        closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'note-edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit note</h3>
                <textarea id="editNoteText" rows="3">${note.text}</textarea>
                
                <div class="edit-sections">
                    <div class="frequency-section">
                        <label>Frequency:</label>
                        <select id="editFrequency">
                            <option value="once" ${note.frequency === 'once' ? 'selected' : ''}>One-time</option>
                            <option value="daily" ${note.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${note.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="biweekly" ${note.frequency === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
                            <option value="monthly" ${note.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>
                    
                    <div class="priority-section">
                        <label>Priority:</label>
                        <select id="editPriority">
                            <option value="low" ${note.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${note.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${note.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="urgent" ${note.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                        </select>
                    </div>
                    
                    <div class="deadline-section">
                        <label for="edit-deadline">Deadline:</label>
                        <input type="datetime-local" id="edit-deadline" 
                               value="${note.deadline ? new Date(note.deadline).toISOString().slice(0, 16) : ''}">
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
                    this.restoreFocus(); // Restore focus when canceling edit
                }
            });
        });
    }

    saveEditedNote() {
        const textArea = document.getElementById('editNoteText');
        const frequencySelect = document.getElementById('editFrequency');
        const prioritySelect = document.getElementById('editPriority');
        const deadlineInput = document.getElementById('edit-deadline');
        
        // Validate the textarea input
        if (!this.validateInput(textArea, 'Please enter a Note description')) {
            return;
        }
        
        const newText = textArea.value.trim();
        if (!this.editingNote) return;
        
        try {
            const notes = this.getNotes();
            const noteIndex = notes.findIndex(note => note.id === this.editingNote.id);
            
            if (noteIndex !== -1) {
                notes[noteIndex].text = newText;
                notes[noteIndex].frequency = frequencySelect.value;
                notes[noteIndex].priority = prioritySelect.value;
                
                // Handle frequency changes
                if (frequencySelect.value !== 'once') {
                    notes[noteIndex].nextReset = this.calculateNextReset(frequencySelect.value);
                } else {
                    delete notes[noteIndex].nextReset;
                }
                
                // Handle deadline changes
                if (deadlineInput.value) {
                    notes[noteIndex].deadline = new Date(deadlineInput.value).toISOString();
                } else {
                    delete notes[noteIndex].deadline;
                    delete notes[noteIndex].alertTime;
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
                this.displayNotes();
                this.updateProgress();
                this.emitNoteUpdate('note-updated', notes[noteIndex]);
            }
        } catch (error) {
            console.error('Could not save edited note:', error);
        }
        
        this.editingNote = null;
        closeModal();
        this.restoreFocus(); // Restore focus after saving
    }

    updateProgress() {
        const notes = this.getNotes();
        const completedNotes = notes.filter(note => note.completed);
        const overdueNotes = notes.filter(note => 
            note.deadline && this.isOverdue(note.deadline) && !note.completed
        );
        
        // Update progress bar
        const progressBar = document.querySelector('.note-progress-bar');
        const progressText = document.querySelector('.note-progress-text');
        
        if (progressBar && progressText) {
            const percentage = notes.length > 0 ? (completedNotes.length / notes.length) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completedNotes.length}/${notes.length} notes completed`;
        }
        
        // Update stats
        this.updateNoteStats(notes, completedNotes, overdueNotes);
    }

    updateNoteStats(notes, completedNotes, overdueNotes) {
        const statElements = {
            total: document.querySelector('.stat-total-notes'),
            completed: document.querySelector('.stat-completed-notes'),
            remaining: document.querySelector('.stat-remaining-notes'),
            overdue: document.querySelector('.stat-overdue-notes')
        };
        
        if (statElements.total) statElements.total.textContent = notes.length;
        if (statElements.completed) statElements.completed.textContent = completedNotes.length;
        if (statElements.remaining) statElements.remaining.textContent = notes.length - completedNotes.length;
        if (statElements.overdue) statElements.overdue.textContent = overdueNotes.length;
    }

    // Utility methods
    formatDeadline(deadline) {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return `Overdue by ${this.formatTimeDiff(Math.abs(diff))}`;
        if (diff < 24 * 60 * 60 * 1000) return `Due in ${this.formatTimeDiff(diff)}`;
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    formatTimeDiff(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    isOverdue(deadline) {
        return new Date(deadline) < new Date();
    }

    showEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon"><i class="bi bi-pin-angle"></i></div>
            <p>No notes yet. Create your first note!</p>
        `;
        container.appendChild(emptyState);
    }

    // Event system for inter-module communication
    emitNoteUpdate(eventType, noteData) {
        const event = new CustomEvent('noteUpdate', {
            detail: { type: eventType, note: noteData }
        });
        document.dispatchEvent(event);
    }

    // Alert and notification system
    setupDeadlineAlerts() {
        setInterval(() => this.checkAlerts(), 60000); // Check every minute
        this.checkAlerts(); // Check immediately
    }

    checkAlerts() {
        try {
            const notes = this.getNotes();
            const now = new Date();
            let hasUpdates = false;
            
            notes.forEach(note => {
                if (note.alertTime && !note.alerted && !note.completed) {
                    const alertTime = new Date(note.alertTime);
                    
                    if (now >= alertTime) {
                        this.sendNotification(note);
                        note.alerted = true;
                        hasUpdates = true;
                    }
                }
            });
            
            if (hasUpdates) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
            }
        } catch (error) {
            console.error('Could not check alerts:', error);
        }
    }

    sendNotification(note) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Note Deadline Alert', {
                body: `Note "${note.text}" is due soon!`,
                icon: '/assets/icon.png'
            });
        }
    }

    // Recurring note management
    setupProgressTracking() {
        setInterval(() => this.checkNoteResets(), 60000);
        this.checkNoteResets();
    }

    checkNoteResets() {
        try {
            const notes = this.getNotes();
            const now = new Date();
            let updated = false;
            
            const updatedNotes = notes.map(note => {
                if (note.nextReset && new Date(note.nextReset) <= now) {
                    note.completed = false;
                    note.nextReset = this.calculateNextReset(note.frequency);
                    delete note.alerted; // Reset alert flag
                    updated = true;
                }
                return note;
            });
            
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotes));
                this.displayNotes();
                this.updateProgress();
            }
        } catch (error) {
            console.error('Could not check note resets:', error);
        }
    }

    // IST timezone reset for daily notes
    setupISTReset() {
        const checkMidnight = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
            
            if (istTime.getHours() === 0 && istTime.getMinutes() === 1) {
                this.resetDailyNotes();
            }
        };
        
        setInterval(checkMidnight, 60000);
        checkMidnight();
    }

    resetDailyNotes() {
        try {
            const notes = this.getNotes();
            let updated = false;
            
            const updatedNotes = notes.map(note => {
                if (note.frequency === 'daily' && note.completed) {
                    note.completed = false;
                    delete note.alerted;
                    updated = true;
                }
                return note;
            });
            
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotes));
                this.displayNotes();
                this.updateProgress();
            }
        } catch (error) {
            console.error('Could not reset daily notes:', error);
        }
    }

    // Public API methods
    getNoteStats() {
        const notes = this.getNotes();
        return {
            total: notes.length,
            completed: notes.filter(t => t.completed).length,
            pending: notes.filter(t => !t.completed).length,
            overdue: notes.filter(t => t.deadline && this.isOverdue(t.deadline) && !t.completed).length
        };
    }

    getNotesByPriority(priority) {
        return this.getNotes().filter(note => note.priority === priority);
    }

    getNotesByFrequency(frequency) {
        return this.getNotes().filter(note => note.frequency === frequency);
    }
}

// Export for use in other modules
export default NoteManager;