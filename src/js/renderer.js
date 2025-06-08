// CSS imports
import '@css/main.css';
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

// Note/Task management system
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

function setTaskFrequency(frequency) {
    const noteData = window.tempNoteData;
    if (!noteData) return;
    
    noteData.frequency = frequency;
    noteData.nextReset = calculateNextReset(frequency);
    saveNote(noteData);
    closeModal();
    
    // Clean up temporary data
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
    console.log('Functions check:');
    console.log('createNote:', typeof window.createNote);
    console.log('setTaskFrequency:', typeof window.setTaskFrequency);
    console.log('closeModal:', typeof window.closeModal);
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
}

// TODO: Need to make the notes tasks and important tabs functionsl so that only elements belonging to that category will show up.
// TODO: User should can Create their own labels like tasks, important notes and deadlines etc.
// TODO: Need to make my own version of Wordle.
// TODO: Need to make gamification and streaks. 
// TODO: Add a preload file properly.