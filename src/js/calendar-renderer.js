// CSS imports
import '@css/main.css';
import '@css/components/calendar.css';
import '@css/components/sidebar.css';

// Component imports
import '@components/sidebar.js';
import '@components/calendar.js';
import {
    setImage,
    setDailyQuote,
    setRandomGif,
    loadAllImages,
    initTheme,
    setTheme,
    toggleTheme,
} from '@components/utils.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Calendar-specific initialization
function initializeCalendar() {
    // Initialize theme and images
    loadAllImages();
    initTheme();
    setDailyQuote();
    
    // Create and inject the event modal into the DOM
    createEventModal();
    
    // Setup analytics toggle functionality
    setupAnalyticsToggle();
    
    // Setup modal event handlers
    setupModalHandlers();
    
    // Setup keyboard shortcuts for calendar
    setupCalendarKeyboardShortcuts();
}

function createEventModal() {
    const modalHTML = `
        <div id="eventModal" class="modal-overlay">
            <div class="modal-content event-modal">
                <div class="modal-header">
                    <h3 id="modalTitle">Create Event</h3>
                    <button id="closeEventModal" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="validationErrors" class="validation-errors" style="display: none;"></div>
                    <form id="eventForm" class="event-form">
                        <div class="form-group">
                            <label for="eventTitle">Event Title</label>
                            <input type="text" id="eventTitle" placeholder="Enter event title" class="form-input" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="eventDate">Date</label>
                                <input type="date" id="eventDate" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="eventStartTime">Start Time</label>
                                <input type="time" id="eventStartTime" class="form-input" value="09:00">
                            </div>
                            <div class="form-group">
                                <label for="eventEndTime">End Time</label>
                                <input type="time" id="eventEndTime" class="form-input" value="10:00">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="eventCategory">Category</label>
                            <select id="eventCategory" class="form-select">
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="meetings">Meeting</option>
                                <option value="deadlines">Deadline</option>
                                <option value="focus">Focus Time</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="eventDescription">Description</label>
                            <textarea id="eventDescription" placeholder="Event description (optional)" class="form-textarea" rows="3"></textarea>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="isRecurring">
                                <span class="checkmark"></span>
                                Recurring event
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="isAllDay">
                                <span class="checkmark"></span>
                                All day event
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="hasReminder">
                                <span class="checkmark"></span>
                                Set reminder
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" id="saveEvent" class="btn btn-primary">Save Event</button>
                            <button type="button" id="deleteEvent" class="btn btn-danger" style="display: none;">Delete Event</button>
                            <button type="button" id="cancelEvent" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if it exists
    const existingModal = document.getElementById('eventModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function setupAnalyticsToggle() {
    // Create analytics toggle button if it doesn't exist
    const calendarHeader = document.querySelector('.calendar-header .action-controls');
    if (calendarHeader && !document.getElementById('analyticsToggle')) {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'analyticsToggle';
        toggleButton.className = 'analytics-toggle-btn';
        toggleButton.innerHTML = '<i class="bi bi-graph-up"></i> Analytics';
        toggleButton.title = 'Toggle Analytics Panel';
        calendarHeader.appendChild(toggleButton);
    }
    
    // Setup click handler for analytics toggle
    const analyticsToggle = document.getElementById('analyticsToggle');
    if (analyticsToggle) {
        analyticsToggle.addEventListener('click', () => {
            const panel = document.getElementById('analyticsPanel');
            if (panel) {
                panel.classList.toggle('show');
                analyticsToggle.classList.toggle('active');
            }
        });
    }
}
function setupModalHandlers() {
    // Handle modal close events
    document.addEventListener('click', (e) => {
        const eventModal = document.getElementById('eventModal');
        const quickAddModal = document.getElementById('quickAddModal');
        
        // Close modals when clicking overlay
        if (e.target.classList.contains('modal-overlay')) {
            if (eventModal) eventModal.classList.remove('show');
            if (quickAddModal) quickAddModal.classList.remove('show');
        }
        
        // Close event modal with close button
        if (e.target.id === 'closeEventModal' || e.target.id === 'cancelEvent') {
            if (eventModal) eventModal.classList.remove('show');
        }
    });
    
    // Handle escape key for modal closing
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const eventModal = document.getElementById('eventModal');
            const quickAddModal = document.getElementById('quickAddModal');
            if (eventModal) eventModal.classList.remove('show');
            if (quickAddModal) quickAddModal.classList.remove('show');
        }
    });
    
    // Handle all-day checkbox toggle
    document.addEventListener('change', (e) => {
        if (e.target.id === 'isAllDay') {
            const startTime = document.getElementById('eventStartTime');
            const endTime = document.getElementById('eventEndTime');
            if (startTime && endTime) {
                startTime.disabled = e.target.checked;
                endTime.disabled = e.target.checked;
                if (e.target.checked) {
                    startTime.value = '00:00';
                    endTime.value = '23:59';
                } else {
                    startTime.value = '09:00';
                    endTime.value = '10:00';
                }
            }
        }
    });
}

function setupCalendarKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    // Quick add functionality
                    const quickModal = document.getElementById('quickAddModal');
                    if (quickModal) {
                        quickModal.classList.add('show');
                        const input = document.getElementById('quickEventText');
                        if (input) input.focus();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    // Show event modal
                    const eventModal = document.getElementById('eventModal');
                    if (eventModal) {
                        eventModal.classList.add('show');
                        const titleInput = document.getElementById('eventTitle');
                        if (titleInput) titleInput.focus();
                    }
                    break;
                case 'a':
                    e.preventDefault();
                    // Toggle analytics
                    const analyticsToggle = document.getElementById('analyticsToggle');
                    if (analyticsToggle) analyticsToggle.click();
                    break;
            }
        }
        
        // Arrow key navigation
        switch(e.key) {
            case 'ArrowLeft':
                if (!e.shiftKey) {
                    e.preventDefault();
                    const prevBtn = document.getElementById('prevBtn');
                    if (prevBtn) prevBtn.click();
                }
                break;
            case 'ArrowRight':
                if (!e.shiftKey) {
                    e.preventDefault();
                    const nextBtn = document.getElementById('nextBtn');
                    if (nextBtn) nextBtn.click();
                }
                break;
            case 't':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    const todayBtn = document.getElementById('todayBtn');
                    if (todayBtn) todayBtn.click();
                }
                break;
        }
    });
}

function addEventValidation() {
    // Add real-time validation to form inputs
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        const inputs = eventForm.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
        
        // Validate time inputs
        const startTime = document.getElementById('eventStartTime');
        const endTime = document.getElementById('eventEndTime');
        if (startTime && endTime) {
            [startTime, endTime].forEach(input => {
                input.addEventListener('change', validateTimeRange);
            });
        }
        
        // Validate date input
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            dateInput.addEventListener('change', validateEventDate);
        }
    }
}

function validateInput(e) {
    const input = e.target;
    const errorContainer = document.getElementById('validationErrors');
    
    if (!input.value.trim() && input.required) {
        input.classList.add('error');
        showValidationError(`${input.labels[0]?.textContent || 'Field'} is required`);
    } else {
        input.classList.remove('error');
    }
}

function validateEventDate(e) {
    const dateInput = e.target;
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        dateInput.classList.add('error');
        showValidationError('Cannot create events in the past');
    } else {
        dateInput.classList.remove('error');
    }
}

function validateTimeRange() {
    const startTime = document.getElementById('eventStartTime');
    const endTime = document.getElementById('eventEndTime');
    
    if (startTime && endTime && startTime.value && endTime.value) {
        const startMinutes = timeToMinutes(startTime.value);
        const endMinutes = timeToMinutes(endTime.value);
        
        if (startMinutes >= endMinutes) {
            endTime.classList.add('error');
            showValidationError('End time must be after start time');
        } else {
            endTime.classList.remove('error');
            startTime.classList.remove('error');
        }
    }
}

function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function showValidationError(message) {
    const errorContainer = document.getElementById('validationErrors');
    if (errorContainer) {
        errorContainer.innerHTML = `<div class="error-message"><i class="bi bi-exclamation-triangle"></i> ${message}</div>`;
        errorContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorContainer.style.display === 'block') {
                errorContainer.style.display = 'none';
            }
        }, 5000);
    }
}

function clearValidationError(e) {
    const input = e.target;
    input.classList.remove('error');
    
    // Check if all errors are cleared
    const errorInputs = document.querySelectorAll('.form-input.error, .form-select.error');
    if (errorInputs.length === 0) {
        const errorContainer = document.getElementById('validationErrors');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
}

// Initialize everything when DOM is ready
function initialize() {
    initializeCalendar();
    addEventValidation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

console.log('Calendar page loaded with enhanced functionality');