// calendar-renderer.js
import '@css/main.css';
import '@css/components/calendar.css';
import '@css/components/sidebar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@components/sidebar.js';
import ProductivityCalendar from '@components/calendar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,} from '@components/utils.js';
let productivityCalendar;
function initializeCalendar() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupCalendar();
        });
    } else {
        setupCalendar();
    }
}
function setupCalendar() {
    loadAllImages();
    initTheme();
    setDailyQuote();
    setTimeout(() => {
        createEventModal();
        createQuickAddModal();
        setupModalHandlers();
        setupCalendarKeyboardShortcuts();
        addEventValidation();
        window.productivityCalendar = new ProductivityCalendar();
    }, 100);
}
function createEventModal() {
    const modalHTML = `
        <div id="eventModal" class="cal-modal-overlay">
            <div class="cal-modal-content event-modal">
                <div class="cal-modal-header">
                    <h3 class="cal-modal-h3" id="modalTitle">Create Event</h3>
                    <button id="closeEventModal" class="close-cal-btn" type="button">&times;</button>
                </div>
                <div class="cal-modal-body">
                    <div id="validationErrors" class="validation-errors" style="display: none;"></div>
                    <form id="eventForm" class="event-form">
                        <div class="cal-form-group">
                            <label for="eventTitle">Event Title</label>
                            <input type="text" id="eventTitle" placeholder="Enter event title" class="cal-form-input" required>
                        </div>                        
                        <div class="cal-form-row">
                            <div class="cal-form-group">
                                <label for="eventDate">Date</label>
                                <input type="date" id="eventDate" class="cal-form-input" required>
                            </div>
                            <div class="cal-form-group">
                                <label for="eventStartTime">Start Time</label>
                                <input type="time" id="eventStartTime" class="cal-form-input" value="09:00">
                            </div>
                            <div class="cal-form-group">
                                <label for="eventEndTime">End Time</label>
                                <input type="time" id="eventEndTime" class="cal-form-input" value="10:00">
                            </div>
                        </div>
                        <div class="cal-form-group">
                            <label for="eventCategory">Category</label>
                            <select id="eventCategory" class="cal-form-select">
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="meetings">Meeting</option>
                                <option value="deadlines">Deadline</option>
                                <option value="focus">Focus Time</option>
                            </select>
                        </div>
                        <div class="cal-form-group">
                            <label for="eventDescription">Description</label>
                            <textarea id="eventDescription" placeholder="Event description (optional)" class="cal-form-textarea" rows="3"></textarea>
                        </div>
                        <div class="cal-form-options">
                            <div class="cal-toggle-label" data-toggle="isRecurring">
                                <span class="cal-toggle-text">
                                    <i class="bi bi-arrow-repeat"></i>
                                    Recurring event
                                </span>
                                <div>
                                    <input type="checkbox" id="isRecurring" class="cal-toggle-input">
                                    <div class="cal-toggle-switch"></div>
                                </div>
                            </div>
                            <div class="cal-toggle-label" data-toggle="isAllDay">
                                <span class="cal-toggle-text">
                                    <i class="bi bi-calendar-day"></i>
                                    All day event
                                </span>
                                <div>
                                    <input type="checkbox" id="isAllDay" class="cal-toggle-input">
                                    <div class="cal-toggle-switch"></div>
                                </div>
                            </div>
                            <div class="cal-toggle-label" data-toggle="hasReminder">
                                <span class="cal-toggle-text">
                                    <i class="bi bi-bell"></i>
                                    Set reminder
                                </span>
                                <div>
                                    <input type="checkbox" id="hasReminder" class="cal-toggle-input">
                                    <div class="cal-toggle-switch"></div>
                                </div>
                            </div>
                        </div>
                        <div class="cal-form-actions">
                            <button type="button" id="saveEvent" class="cal-btn btn-primary">
                                Save Event
                            </button>
                            <button type="button" id="deleteEvent" class="cal-btn btn-secondary" style="display: none;">
                                Delete Event
                            </button>
                            <button type="button" id="cancelEvent" class="cal-btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('eventModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    initializeToggleSwitches();
    console.log('Event modal created and added to DOM');
}
function createQuickAddModal() {
    const quickAddHTML = `
        <div id="quickAddModal" class="cal-modal-overlay">
            <div class="cal-modal-content quick-add-modal">
                <div class="cal-modal-header">
                    <h3 class="cal-modal-h3">Quick Add Event</h3>
                    <button id="closeQuickAddModal" class="close-cal-btn" type="button">&times;</button>
                </div>
                <div class="cal-modal-body">
                    <div class="cal-form-group">
                        <label for="quickEventText">Describe your event</label>
                        <input type="text" id="quickEventText" placeholder="Team meeting at 2pm tomorrow" class="cal-form-input">
                        <small style="color: #6b7280; font-size: 0.75rem; margin-top: 4px; display: block;">
                            e.g., "Meeting with team at 2pm tomorrow" or "Focus time 9am-11am"
                        </small>
                    </div>
                    <div class="cal-form-actions">
                        <button type="button" id="parseEvent" class="cal-btn btn-primary">
                            Create Quick Event
                        </button>
                        <button type="button" id="cancelQuickAdd" class="cal-btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const existingQuickModal = document.getElementById('quickAddModal');
    if (existingQuickModal) {
        existingQuickModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', quickAddHTML);
    console.log('Quick add modal created and added to DOM');
}
function initializeToggleSwitches() {
    const toggleLabels = document.querySelectorAll('.cal-toggle-label');    
    toggleLabels.forEach(label => {
        const toggleId = label.getAttribute('data-toggle');
        const checkbox = document.getElementById(toggleId);
        const toggleSwitch = label.querySelector('.cal-toggle-switch');        
        if (checkbox && toggleSwitch) {
            label.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCheckbox(checkbox);
            });
            toggleSwitch.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCheckbox(checkbox);
            });
            if (toggleId === 'isAllDay') {
                checkbox.addEventListener('change', handleAllDayToggle);
            }
        }
    });
}
function toggleCheckbox(checkbox) {
    checkbox.checked = !checkbox.checked;
    const changeEvent = new Event('change', { bubbles: true });
    checkbox.dispatchEvent(changeEvent);
}
function handleAllDayToggle() {
    const startTimeInput = document.getElementById('eventStartTime');
    const endTimeInput = document.getElementById('eventEndTime');
    const isAllDay = document.getElementById('isAllDay').checked;
    if (isAllDay) {
        startTimeInput.style.display = 'none';
        endTimeInput.style.display = 'none';
        const formRow = document.querySelector('.cal-form-row');
        formRow.style.gridTemplateColumns = '1fr';
    } else {
        startTimeInput.style.display = 'block';
        endTimeInput.style.display = 'block';
        const formRow = document.querySelector('.cal-form-row');
        formRow.style.gridTemplateColumns = '1fr 1fr 1fr';
    }
}
function setupModalHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cal-modal-overlay')) {
            closeAllModals();
        }
    });    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'closeEventModal' || e.target.id === 'cancelEvent') {
            closeModal('eventModal');
        }
        if (e.target.id === 'closeQuickAddModal' || e.target.id === 'cancelQuickAdd') {
            closeModal('quickAddModal');
        }
    });    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
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
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}
function closeAllModals() {
    const modals = document.querySelectorAll('.cal-modal-overlay');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
}
function setupCalendarKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    const quickModal = document.getElementById('quickAddModal');
                    if (quickModal) {
                        quickModal.classList.add('show');
                        const input = document.getElementById('quickEventText');
                        if (input) input.focus();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    const eventModal = document.getElementById('eventModal');
                    if (eventModal) {
                        eventModal.classList.add('show');
                        const titleInput = document.getElementById('eventTitle');
                        if (titleInput) titleInput.focus();
                    }
                    break;
                case 'a':
                    e.preventDefault();
                    const analyticsToggle = document.getElementById('analyticsToggle');
                    if (analyticsToggle) analyticsToggle.click();
                    break;
            }
        }
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
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        const inputs = eventForm.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
        const startTime = document.getElementById('eventStartTime');
        const endTime = document.getElementById('eventEndTime');
        if (startTime && endTime) {
            [startTime, endTime].forEach(input => {
                input.addEventListener('change', validateTimeRange);
            });
        }
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            dateInput.addEventListener('change', validateEventDate);
        }
    }
}
function validateInput(e) {
    const input = e.target;
    
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
    const errorInputs = document.querySelectorAll('.cal-form-input.error, .cal-form-select.error');
    if (errorInputs.length === 0) {
        const errorContainer = document.getElementById('validationErrors');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
}
initializeCalendar();
console.log('Calendar page loaded with enhanced functionality');