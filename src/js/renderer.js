// CSS imports
import '@css/main.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
// PNG imports
import stitchHappy from '@assets/images/characters/stitch-happy.png';
import stitchIcon from '@assets/images/characters/stitch-icon.png';
import stitchWink from '@assets/images/characters/stitch-wink.png';
import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';
// GIF imports
import stitchClothes from '@assets/gifs/stitch-clothes.gif';
import stitchDancing from '@assets/gifs/stitch-dancing.gif';
import stitchEating from '@assets/gifs/stitch-eating.gif';
import stitchFrustrated from '@assets/gifs/stitch-frustrated.gif';
import stitchHyping from '@assets/gifs/stitch-hyping.gif';
import stitchLove from '@assets/gifs/stitch-love.gif';
import stitchShocked from '@assets/gifs/stitch-shocked.gif';
import stitchSinging from '@assets/gifs/stitch-singing.gif';
import stitchSleeping from '@assets/gifs/stitch-sleeping.gif';
import stitchTantrum from '@assets/gifs/stitch-tantrum.gif';

// Create an image registry
const images = {
    characters: {
    happy: stitchHappy,
    icon: stitchIcon,
    wink: stitchWink,
    corner1: stitchCorner1,
    corner2: stitchCorner2
    },
    gifs: {
    clothes: stitchClothes,
    dancing: stitchDancing,
    eating: stitchEating,
    frustrated: stitchFrustrated,
    hyping: stitchHyping,
    love: stitchLove,
    shocked: stitchShocked,
    singing: stitchSinging,
    sleeping: stitchSleeping,
    tantrum: stitchTantrum
    }
};

const quotes = [
    "Ohana means family. Family means nobody gets left behind or forgotten.",
    "This is my family. I found it all on my own. It's little, and broken, but still good. Yeah, still good.",
    "Also cute and fluffy!",
    "Aloha! Today is a new day to make progress!",
    "Sometimes you try your hardest, but things don't work out. Sometimes things don't go according to plan.",
    "I like you better as you.",
    "Remember to feed your fish! If you give him food, he will be your friend.",
    "Family is always there for you, even when no one else is.",
    "Just because we look different doesn't mean we aren't family."
];

const gifKeys = [
    'clothes',
    'dancing',
    'eating',
    'frustrated',
    'hyping',
    'love',
    'shocked',
    'singing',
    'sleeping',
    'tantrum'
];


function setImage(elementId, category, imageName) {
    // sets an image to a given elementId
    const element = document.getElementById(elementId);
    if (element && images[category] && images[category][imageName]) {
    element.src = images[category][imageName];
    }
}
function setDailyQuote() {
    // Daily refreshes a quote
    const quoteElement = document.querySelector('.daily-quote');
    if (!quoteElement) return;

    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-30"
    const stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};

    if (stored.date === today && stored.quote) {
        quoteElement.textContent = stored.quote;
        return;
    }

    // Pick a new quote randomly
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    localStorage.setItem('dailyQuote', JSON.stringify({ date: today, quote: newQuote }));
    quoteElement.textContent = newQuote;
}
function setRandomGif() {
    // Sets a random gif everytime the app starts
    const gifId = 'stitch-mood-gif'; // Your <img> ID
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}

// Themes 
function initTheme() {
    
    let savedTheme = 'light'; // default
    try {
        savedTheme = localStorage.getItem('stitchTheme') || 'light';
    } catch (error) {
        console.warn('localStorage not available, using default theme');
    }
    
    setTheme(savedTheme);
    
    // Set up the theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
        themeToggle.checked = savedTheme === 'dark';
    } else {
        console.error('Theme toggle element not found');
    }
}

function setTheme(theme) {
    // Validate theme value
    if (theme !== 'light' && theme !== 'dark') {
        theme = 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme); // Also set on body for better CSS targeting
    
    // Save to localStorage if available
    try {
        localStorage.setItem('stitchTheme', theme);
    } catch (error) {
        console.warn('Could not save theme to localStorage');
    }
    
    // Update toggle state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
    }
    
    console.log(`Theme set to: ${theme}`); // Debug log
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
    setTheme(newTheme);
}

// Date and Time
function updateDate() {
    const now = new Date();
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    // Get date
    const currentDate = now.getDate();
    
    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = months[now.getMonth()];
    
    // Update the HTML elements
    const dayElement = document.getElementById('current-day');
    const dateElement = document.getElementById('current-date');
    const monthElement = document.getElementById('current-month');
    
    if (dayElement) dayElement.textContent = currentDay;
    if (dateElement) dateElement.textContent = currentDate;
    if (monthElement) monthElement.textContent = currentMonth;
    
    updateClock();
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Add leading zeros
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    // Format time string
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Update clock element
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.textContent = timeString;
        
        // Optional: Add blink effect to the colons
        const pulseEffect = Math.floor(now.getSeconds()) % 2 === 0 ? 'pulse' : '';
        clockElement.className = `digital-clock ${pulseEffect}`;
    }
    
    // Update every second
    setTimeout(updateClock, 1000);
}

function initNoteSystem() {
    const noteInput = document.getElementById('noteInput');
    const addNoteBtn = document.getElementById('addNoteBtn');
    
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', handleAddNote);
    }
    
    if (noteInput) {
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddNote();
        });
    }
    
    // Initialize category filters - THIS IS NEW
    initCategoryFilters();
    
    loadNotes();
    setupProgressTracking();
}

function handleAddNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    
    if (!noteText) return;
    
    // Show modal to select note type
    showNoteTypeModal(noteText);
    noteInput.value = '';
}

function showNoteTypeModal(noteText) {
    // Create modal elements dynamically
    const modal = document.createElement('div');
    modal.className = 'note-type-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>What type is this?</h3>
            <button data-type="note">📝 Note</button>
            <button data-type="task">📌 Task</button>
            <button data-type="important">⭐ Important</button>
            <button data-action="cancel">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store the text temporarily
    window.tempNoteText = noteText;
    
    // Add event listeners to buttons
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.getAttribute('data-type');
            const action = e.target.getAttribute('data-action');
            
            if (type) {
                createNote(type);
            } else if (action === 'cancel') {
                closeModal();
            }
        });
    });
}

function createNote(type, selectedDate = null) {
    const text = window.tempNoteText;
    if (!text) return;
    
    const noteData = {
        id: Date.now(),
        text: text,
        type: type,
        timestamp: new Date().toISOString(),
        completed: false,
        dueDate: selectedDate || new Date().toISOString().split('T')[0]
    };
    
    if (type === 'task') {
        showFrequencyModal(noteData);
    } else {
        saveNote(noteData);
        closeModal();
    }
}

function showFrequencyModal(noteData) {
    const modal = document.querySelector('.note-type-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Task Frequency</h3>
            <button data-frequency="daily">Daily</button>
            <button data-frequency="weekly">Weekly</button>
            <button data-frequency="biweekly">Bi-weekly</button>
            <button data-frequency="monthly">Monthly</button>
            <button data-action="cancel">Cancel</button>
            
            <div class="deadline-section">
                <label for="task-deadline">Deadline (optional):</label>
                <input type="datetime-local" id="task-deadline" min="${new Date().toISOString().slice(0, 16)}">
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
        </div>
    `;
    
    // Store the noteData temporarily
    window.tempNoteData = noteData;
    
    // Add event listeners to new buttons
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const frequency = e.target.getAttribute('data-frequency');
            const action = e.target.getAttribute('data-action');
            
            if (frequency) {
                setTaskFrequency(frequency);
            } else if (action === 'cancel') {
                closeModal();
            }
        });
    });
}

// function setTaskFrequency(frequency) {
//     const noteData = window.tempNoteData;
//     if (!noteData) return;
    
//     noteData.frequency = frequency;
//     noteData.nextReset = calculateNextReset(frequency);
//     saveNote(noteData);
//     closeModal();
    
//     // Clean up temporary data
//     delete window.tempNoteData;
// }
function setTaskFrequency(frequency) {
    const noteData = window.tempNoteData;
    if (!noteData) return;
    
    const deadlineInput = document.getElementById('task-deadline');
    const alertSelect = document.getElementById('alert-time');
    
    noteData.frequency = frequency;
    noteData.nextReset = calculateNextReset(frequency);
    
    // Add deadline and alert data
    if (deadlineInput && deadlineInput.value) {
        noteData.deadline = new Date(deadlineInput.value).toISOString();
        noteData.alertMinutes = parseInt(alertSelect.value) || 0;
        
        if (noteData.alertMinutes > 0) {
            const alertTime = new Date(deadlineInput.value);
            alertTime.setMinutes(alertTime.getMinutes() - noteData.alertMinutes);
            noteData.alertTime = alertTime.toISOString();
        }
    }
    
    saveNote(noteData);
    closeModal();
    delete window.tempNoteData;
}

function calculateNextReset(frequency) {
    const now = new Date();
    switch(frequency) {
        case 'daily': return new Date(now.getTime() + 24*60*60*1000);
        case 'weekly': return new Date(now.getTime() + 7*24*60*60*1000);
        case 'biweekly': return new Date(now.getTime() + 14*24*60*60*1000);
        case 'monthly': return new Date(now.setMonth(now.getMonth() + 1));
        default: return new Date(now.getTime() + 24*60*60*1000);
    }
}
function saveNote(noteData) {
    try {
        let notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        notes.push(noteData);
        localStorage.setItem('stitchNotes', JSON.stringify(notes));
        displayNotes();
        updateProgress();
    } catch (error) {
        console.warn('Could not save note to localStorage');
    }
}

// =============================================================================
// CATEGORY FILTER SYSTEM - ADD AFTER saveNote() FUNCTION
// =============================================================================

// Global variable to track current filter
let currentFilter = 'all'; // 'all', 'note', 'task', 'important'

function initCategoryFilters() {
    const categoryElements = document.querySelectorAll('.category');
    
    categoryElements.forEach(category => {
        category.addEventListener('click', (e) => {
            const clickedCategory = e.currentTarget;
            const filterType = clickedCategory.getAttribute('data-type');
            
            // Update active state
            categoryElements.forEach(cat => cat.classList.remove('active'));
            clickedCategory.classList.add('active');
            
            // Update current filter
            currentFilter = filterType;
            
            // Filter and display notes
            displayFilteredNotes();
            
            // Update progress for current filter
            updateFilteredProgress();
        });
    });
    
    // Add "All" category if it doesn't exist
    addAllCategory();
}

function addAllCategory() {
    const taskCategories = document.querySelector('.task-categories');
    if (!taskCategories) return;
    
    // Check if "All" category already exists
    if (taskCategories.querySelector('[data-type="all"]')) return;
    
    const allCategory = document.createElement('div');
    allCategory.className = 'category active'; // Start with "All" active
    allCategory.setAttribute('data-type', 'all');
    allCategory.innerHTML = `
        <span class="category-icon">📋</span>
        <span>All</span>
    `;
    
    // Insert at the beginning
    taskCategories.insertBefore(allCategory, taskCategories.firstChild);
    
    // Add click listener
    allCategory.addEventListener('click', (e) => {
        const categoryElements = document.querySelectorAll('.category');
        categoryElements.forEach(cat => cat.classList.remove('active'));
        allCategory.classList.add('active');
        
        currentFilter = 'all';
        displayFilteredNotes();
        updateFilteredProgress();
    });
}

function displayFilteredNotes() {
    try {
        const notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Filter notes based on current filter
        const filteredNotes = currentFilter === 'all' 
            ? notes 
            : notes.filter(note => note.type === currentFilter);
        
        // Display filtered notes
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            container.appendChild(noteElement);
        });
        
        // Show message if no notes in category
        if (filteredNotes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-category-message';
            emptyMessage.innerHTML = getEmptyMessage(currentFilter);
            container.appendChild(emptyMessage);
        }
    } catch (error) {
        console.warn('Could not display filtered notes');
    }
}

function getEmptyMessage(filterType) {
    const messages = {
        'all': `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No items yet. Add your first note, task, or important item!</p>
            </div>
        `,
        'note': `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No notes yet. Add your first note!</p>
            </div>
        `,
        'task': `
            <div class="empty-state">
                <span class="empty-icon">📌</span>
                <p>No tasks yet. Add your first task!</p>
            </div>
        `,
        'important': `
            <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>No important items yet. Mark something as important!</p>
            </div>
        `
    };
    return messages[filterType] || messages['all'];
}

function updateFilteredProgress() {
    try {
        const notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        
        // Get filtered notes based on current filter
        const filteredNotes = currentFilter === 'all' 
            ? notes 
            : notes.filter(note => note.type === currentFilter);
        
        // Calculate progress based on filtered notes
        const tasks = filteredNotes.filter(note => note.type === 'task');
        const completedTasks = tasks.filter(task => task.completed);
        const totalItems = filteredNotes.length;
        const completedItems = filteredNotes.filter(item => 
            item.type === 'task' ? item.completed : true // Notes and important items are always "completed"
        ).length;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        const completedTasksSpan = document.querySelector('.completed-tasks');
        
        if (progressBar && completedTasksSpan) {
            const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            
            // Update text based on filter
            if (currentFilter === 'all') {
                completedTasksSpan.textContent = `${completedTasks.length}/${tasks.length} tasks`;
            } else if (currentFilter === 'task') {
                completedTasksSpan.textContent = `${completedTasks.length}/${tasks.length} tasks`;
            } else {
                completedTasksSpan.textContent = `${filteredNotes.length} ${currentFilter}${filteredNotes.length !== 1 ? 's' : ''}`;
            }
        }
        
        // Update stats based on current filter
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            if (currentFilter === 'all' || currentFilter === 'task') {
                statValues[0].textContent = tasks.length;
                statValues[1].textContent = completedTasks.length;
                statValues[2].textContent = tasks.length - completedTasks.length;
            } else {
                // For notes and important items
                statValues[0].textContent = filteredNotes.length;
                statValues[1].textContent = filteredNotes.length; // All notes/important items are "completed"
                statValues[2].textContent = 0;
            }
        }
        
        // Update stat labels based on filter
        const statLabels = document.querySelectorAll('.stat-label');
        if (statLabels.length >= 3) {
            if (currentFilter === 'all') {
                statLabels[0].textContent = 'Total Tasks';
                statLabels[1].textContent = 'Completed';
                statLabels[2].textContent = 'Remaining';
            } else if (currentFilter === 'task') {
                statLabels[0].textContent = 'Total Tasks';
                statLabels[1].textContent = 'Completed';
                statLabels[2].textContent = 'Remaining';
            } else {
                const labelText = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1) + 's';
                statLabels[0].textContent = `Total ${labelText}`;
                statLabels[1].textContent = 'Items';
                statLabels[2].textContent = 'Active';
            }
        }
    } catch (error) {
        console.warn('Could not update filtered progress');
    }
}

// Add CSS for the category states and empty messages
const categoryStyles = `
.category {
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
    opacity: 0.7;
}

.category:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
}

.category.active {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.empty-category-message {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.6);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.empty-icon {
    font-size: 48px;
    opacity: 0.5;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}
`;

// Inject the CSS
if (!document.querySelector('#category-filter-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'category-filter-styles';
    styleElement.textContent = categoryStyles;
    document.head.appendChild(styleElement);
}

// =============================================================================
// END OF CATEGORY FILTER SYSTEM
// =============================================================================

function loadNotes() {
    try {
        const notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        displayNotes(notes);
        updateProgress();
    } catch (error) {
        console.warn('Could not load notes from localStorage');
    }
}

function displayNotes(notes = null) {
    if (!notes) {
        try {
            notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        } catch (error) {
            notes = [];
        }
    }
    
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        container.appendChild(noteElement);
    });
}


function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = `note-item ${note.type}`;
    div.innerHTML = `
        <div class="note-content">
            ${note.type === 'task' ? 
                `<input type="checkbox" ${note.completed ? 'checked' : ''} data-task-id="${note.id}"> ` : ''
            }
            ${note.completed ? `<del>${note.text}</del>` : note.text}
            ${note.frequency ? ` (${note.frequency})` : ''}
            ${note.deadline ? `<div class="deadline-info ${isOverdue(note.deadline) ? 'overdue' : ''}">
            📅 Due: ${formatDeadline(note.deadline)}
            </div>` : ''}
        </div>
        <span class="note-timestamp">${formatTimestamp(note.timestamp)}</span>
        <button class="delete-note" data-note-id="${note.id}">×</button>
    `;
    
    // Add event listeners
    const checkbox = div.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.getAttribute('data-task-id'));
            toggleTask(taskId);
        });
    }
    
    const deleteBtn = div.querySelector('.delete-note');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            const noteId = parseInt(e.target.getAttribute('data-note-id'));
            deleteNote(noteId);
        });
    }
    
    return div;
}
function formatDeadline(deadline) {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return `Overdue by ${formatTimeDiff(Math.abs(diff))}`;
    if (diff < 24 * 60 * 60 * 1000) return `Due in ${formatTimeDiff(diff)}`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatTimeDiff(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function isOverdue(deadline) {
    return new Date(deadline) < new Date();
}

function setupDeadlineAlerts() {
    setInterval(checkAlerts, 60000); // Check every minute
    checkAlerts(); // Check immediately
}

function checkAlerts() {
    try {
        const notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        const now = new Date();
        
        notes.forEach(note => {
            if (note.type === 'task' && note.alertTime && !note.alerted) {
                const alertTime = new Date(note.alertTime);
                
                if (now >= alertTime) {
                    sendNotification(note);
                    // Mark as alerted to prevent repeated notifications
                    note.alerted = true;
                }
            }
        });
        
        localStorage.setItem('stitchNotes', JSON.stringify(notes));
    } catch (error) {
        console.warn('Could not check alerts');
    }
}

function checkOverdueTasks() {
    setInterval(() => {
        updateProgress(); // This will refresh the display with overdue styling
    }, 300000); // Check every 5 minutes
}

function sendNotification(note) {
    // For Electron apps, use the Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Deadline Alert', {
            body: `Task "${note.text}" is due soon!`,
            icon: 'path/to/your/app/icon.png' // Update with your app icon path
        });
    }
}

function toggleTask(taskId) {
    try {
        let notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        const taskIndex = notes.findIndex(note => note.id === taskId);
        
        if (taskIndex !== -1) {
            notes[taskIndex].completed = !notes[taskIndex].completed;
            localStorage.setItem('stitchNotes', JSON.stringify(notes));
            updateProgress();
            displayNotes();
        }
    } catch (error) {
        console.warn('Could not update task');
    }
}

function updateProgress() {
    try {
        const notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        const tasks = notes.filter(note => note.type === 'task');
        const completedTasks = tasks.filter(task => task.completed);
        
        const progressBar = document.querySelector('.progress-bar');
        const completedTasksSpan = document.querySelector('.completed-tasks');
        const totalTasksSpan = document.querySelector('.stat-value');
        
        if (progressBar && completedTasksSpan) {
            const percentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            completedTasksSpan.textContent = `${completedTasks.length}/${tasks.length} tasks`;
        }
        
        // Update stats
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = tasks.length;
            statValues[1].textContent = completedTasks.length;
            statValues[2].textContent = tasks.length - completedTasks.length;
        }
    } catch (error) {
        console.warn('Could not update progress');
    }
}

function setupProgressTracking() {
    // Check for task resets every minute
    setInterval(checkTaskResets, 60000);
    checkTaskResets(); // Run immediately
}

function checkTaskResets() {
    try {
        let notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        const now = new Date();
        let updated = false;
        
        notes = notes.map(note => {
            if (note.type === 'task' && note.nextReset && new Date(note.nextReset) <= now) {
                note.completed = false;
                note.nextReset = calculateNextReset(note.frequency);
                updated = true;
            }
            return note;
        });
        
        if (updated) {
            localStorage.setItem('stitchNotes', JSON.stringify(notes));
            displayNotes();
            updateProgress();
        }
    } catch (error) {
        console.warn('Could not check task resets');
    }
}
function initDateClickHandler() {
    const dateCircle = document.querySelector('.date-circle');
    if (dateCircle) {
        dateCircle.addEventListener('click', showCalendarModal);
        dateCircle.style.cursor = 'pointer';
    }
}


function showCalendarModal() {
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Select Date for Task</h3>
            <input type="date" id="task-date-picker" min="${new Date().toISOString().split('T')[0]}">
            <input type="text" id="future-task-input" placeholder="Enter task for selected date">
            <button data-action="create">Create Task</button>
            <button data-action="cancel">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners to buttons
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            
            if (action === 'create') {
                createFutureTask();
            } else if (action === 'cancel') {
                closeModal();
            }
        });
    });
}

function createFutureTask() {
    const dateInput = document.getElementById('task-date-picker');
    const taskInput = document.getElementById('future-task-input');
    
    if (dateInput.value && taskInput.value.trim()) {
        const taskText = taskInput.value.trim();
        const selectedDate = dateInput.value;
        
        const noteData = {
            id: Date.now(),
            text: taskText,
            type: 'task',
            timestamp: new Date().toISOString(),
            completed: false,
            dueDate: selectedDate,
            frequency: 'daily', // Default for future tasks
            nextReset: new Date(selectedDate + 'T23:59:59')
        };
        
        saveNote(noteData);
        closeModal();
    }
}

// Utility functions
function closeModal() {
    const modals = document.querySelectorAll('.note-type-modal, .calendar-modal');
    modals.forEach(modal => modal.remove());
    
    // Clean up any temporary data
    delete window.tempNoteText;
    delete window.tempNoteData;
}

function deleteNote(noteId) {
    try {
        let notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
        notes = notes.filter(note => note.id !== noteId);
        localStorage.setItem('stitchNotes', JSON.stringify(notes));
        displayNotes();
        updateProgress();
    } catch (error) {
        console.warn('Could not delete note');
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}
function setupISTReset() {
    const checkIST = () => {
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
        
        if (istTime.getHours() === 0 && istTime.getMinutes() === 0) {
            // Reset daily tasks at midnight IST
            try {
                let notes = JSON.parse(localStorage.getItem('stitchNotes')) || [];
                notes = notes.map(note => {
                    if (note.type === 'task' && note.frequency === 'daily') {
                        note.completed = false;
                    }
                    return note;
                });
                localStorage.setItem('stitchNotes', JSON.stringify(notes));
                displayNotes();
                updateProgress();
            } catch (error) {
                console.warn('Could not reset daily tasks');
            }
        }
    };
    
    // Check every minute
    setInterval(checkIST, 60000);
}



function debugFunctions() {
    const now = new Date();
    console.log('Functions check:');
    console.log('createNote:', typeof window.createNote);
    console.log('setTaskFrequency:', typeof window.setTaskFrequency);
    
}


// Expose all functions to global scope - MUST be at the end
window.createNote = createNote;
window.setTaskFrequency = setTaskFrequency;
window.toggleTask = toggleTask;
window.deleteNote = deleteNote;
window.closeModal = closeModal;
window.createFutureTask = createFutureTask;
window.showNoteTypeModal = showNoteTypeModal;
window.showFrequencyModal = showFrequencyModal;
window.showCalendarModal = showCalendarModal;
window.formatDeadline = formatDeadline;
window.setupDeadlineAlerts = setupDeadlineAlerts;
window.checkOverdueTasks = checkOverdueTasks;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...'); // Debug log
    
    // Set up images
    setImage('happy-stitch', 'characters', 'happy');
    setImage('icon-stitch', 'characters', 'icon');
    setImage('wink-stitch', 'characters', 'wink');
    setImage('corner1-stitch', 'characters', 'corner1');
    setImage('corner2-stitch', 'characters','corner2');
    
    setImage('clothes-stitch', 'gifs', 'clothes');
    setImage('dancing-stitch', 'gifs', 'dancing');
    setImage('eating-stitch', 'gifs', 'eating');
    setImage('frustrated-stitch', 'gifs', 'frustrated');
    setImage('hyping-stitch', 'gifs', 'hyping');
    setImage('love-stitch', 'gifs', 'love');
    setImage('shocked-stitch', 'gifs', 'shocked');
    setImage('singing-stitch', 'gifs', 'singing');
    setImage('tantrum-stitch', 'gifs', 'tantrum');
    
    // Initialize theme system
    initTheme();
    updateDate();
    setDailyQuote();
    setRandomGif();
    initNoteSystem();
    initDateClickHandler();
    debugFunctions();
});

// Alternative initialization in case DOMContentLoaded has already fired

if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}
function initializeApp() {
    // Fallback initialization function
    if (!document.getElementById('themeToggle')?.hasAttribute('data-initialized')) {
        initTheme();
        updateDate();
        setDailyQuote();
        // Mark as initialized
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.setAttribute('data-initialized', 'true');
        }
    }
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
}
}

// TODO:1 Need to make the notes tasks and important tabs functionsl so that only elements belonging to that category will show up.
// TODO:1.1: Prevent the progress bar for important and notes
// TODO:2 Add deadlines and alerts
// TODO:3 User should can Create their own labels like tasks, important notes and deadlines etc.
// TODO:4 Need to make my own version of Wordle.
// TODO:5 Need to make gamification and streaks. 
// TODO:6 Add a preload file properly.