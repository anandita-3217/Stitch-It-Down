// calendar.js
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';
class ProductivityCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.events = [];
        this.selectedEvent = null;
        this.draggedEvent = null;
        this.analyticsVisible = false;
        this.init();
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }
    init() {
    this.currentDate = new Date();
    if (this.currentView === 'month') {
        // Don't set to day 1 in constructor, do it in render
        // this.currentDate.setDate(1);
    }
    this.selectedDate = null;
    this.filteredEvents = [];
    this.searchQuery = '';
    this.activeCategory = 'all';
}
    setupEventListeners() {
        document.getElementById('prevBtn')?.addEventListener('click', () => {
            if (this.currentView === 'day') {
                this.navigateDay(-1);
            } else {
                this.navigateMonth(-1);
            }
        });
        document.getElementById('nextBtn')?.addEventListener('click', () => {
            if (this.currentView === 'day') {
                this.navigateDay(1);
            } else {
                this.navigateMonth(1);
            }
        });
        document.getElementById('todayBtn')?.addEventListener('click', () => this.goToToday());
        document.getElementById('monthView')?.addEventListener('click', () => this.changeView('month'));
        document.getElementById('weekView')?.addEventListener('click', () => this.changeView('week'));
        document.getElementById('dayView')?.addEventListener('click', () => this.changeView('day'));
        document.getElementById('addEventBtn')?.addEventListener('click', () => this.showEventModal());
        document.getElementById('saveEvent')?.addEventListener('click', () => this.saveEvent());
        document.getElementById('deleteEvent')?.addEventListener('click', () => this.deleteEvent());
        document.getElementById('parseEvent')?.addEventListener('click', () => this.parseQuickEvent());
        document.getElementById('cancelQuickAdd')?.addEventListener('click', () => this.hideQuickAdd());
        document.getElementById('cancelEvent')?.addEventListener('click', () => this.hideEventModal());
        document.getElementById('eventSearch')?.addEventListener('input', (e) => this.searchEvents(e.target.value));
        document.querySelectorAll('.category-filter').forEach(btn => {btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));});
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showQuickAdd();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('eventSearch')?.focus();
                        break;
                    case '1':
                        e.preventDefault();
                        this.changeView('day');
                        break;
                    case '2':
                        e.preventDefault();
                        this.changeView('week');
                        break;
                    case '3':
                        e.preventDefault();
                        this.changeView('month');
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.hideEventModal();
                this.hideQuickAdd();
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideQuickAdd();
                this.hideEventModal();
            }
        });
    }
    validateEventData(eventData) {
        const errors = [];
        if (!eventData.title?.trim()) {
            errors.push('Event title is required');
        }
        if (!eventData.date) {
    errors.push('Event date is required');
} else {
    const eventDate = new Date(eventData.date);
    const now = new Date();
    if (!this.selectedEvent) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDateCopy = new Date(eventDate);
        eventDateCopy.setHours(0, 0, 0, 0);
        if (eventDateCopy < today) {
            errors.push('Cannot create events in the past');
        }
        if (eventDateCopy.getTime() === today.getTime() && eventData.startTime) {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const eventStartTime = this.timeToMinutes(eventData.startTime);
            
            if (eventStartTime < currentTime) {
                errors.push('Cannot create events with past start time for today');
            }
        }
    }
}
        if (eventData.startTime && eventData.endTime) {
            const startMinutes = this.timeToMinutes(eventData.startTime);
            const endMinutes = this.timeToMinutes(eventData.endTime);
            
            if (startMinutes >= endMinutes) {
                errors.push('End time must be after start time');
            }
        }
        if (!this.selectedEvent) {
            const overlapping = this.checkForOverlappingEvents(eventData);
            if (overlapping.length > 0) {
                errors.push(`Overlaps with: ${overlapping.map(e => e.title).join(', ')}`);
            }
        }
        return errors;
    }
    checkForOverlappingEvents(newEvent) {
        const newDate = new Date(newEvent.date);
        const newStartMinutes = this.timeToMinutes(newEvent.startTime);
        const newEndMinutes = this.timeToMinutes(newEvent.endTime);
        return this.events.filter(event => {
            if (this.selectedEvent && event.id === this.selectedEvent.id) return false;
            if (!this.isSameDate(event.date, newDate)) return false;
            const eventStartMinutes = this.timeToMinutes(event.startTime);
            const eventEndMinutes = this.timeToMinutes(event.endTime);
            return (newStartMinutes < eventEndMinutes && newEndMinutes > eventStartMinutes);
        });
    }
    showValidationErrors(errors) {
        const errorContainer = document.getElementById('validationErrors');
        if (errorContainer) {
            errorContainer.innerHTML = errors.map(error => 
                `<div class="error-message">${error}</div>`
            ).join('');
            errorContainer.style.display = 'block';
        } else {
            alert('Validation errors:\n' + errors.join('\n'));
        }
    }
    hideValidationErrors() {
        const errorContainer = document.getElementById('validationErrors');
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.innerHTML = '';
        }
    }
    navigateMonth(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        if (newDate.getFullYear() < 1900 || newDate.getFullYear() > 2100) {
            return;
        }
        this.currentDate = newDate;
        this.render();
    }
    goToToday() {
        this.currentDate = new Date();
        this.render();
    }
    changeView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${view}View`)?.classList.add('active');
    const container = document.getElementById('calendarContainer');
    if (container) {
        container.innerHTML = '';
        container.className = `calendar-container-view ${view}-view`;
    }
    this.render();
    } 
    navigateDay(direction) {
    const newDate = new Date(this.currentDate);
    if (this.currentView === 'day') {
        newDate.setDate(newDate.getDate() + direction);
    } else if (this.currentView === 'week') {
        newDate.setDate(newDate.getDate() + (direction * 7));
    }
    
    this.currentDate = newDate;
    this.render();
    }
    render() {
        this.updateHeader();
        switch(this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
        }
        this.updateAnalytics();
    }
    updateHeader() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const currentMonth = document.getElementById('currentMonth');
        if (currentMonth) {
            currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }
    renderMonthView() {
    const container = document.getElementById('calendarContainer');
    if (!container) {
        console.error('Calendar container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="weekdays">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
        </div>
        <div id="calendarGrid" class="calendar-grid"></div>
    `;
    const grid = document.getElementById('calendarGrid');
    if (!grid) {
        console.error('Calendar grid not found');
        return;
    }
    grid.innerHTML = '';
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const today = new Date();
    for (let i = 0; i < 42; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = currentDay.toISOString().split('T')[0];
        if (currentDay.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        if (this.isSameDate(currentDay, today)) {
            dayElement.classList.add('today');
        }
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDay.getDate();
        dayElement.appendChild(dayNumber);
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        const eventsForDay = this.getEventsForDate(currentDay);
        const maxVisibleEvents = 3;
        const visibleEvents = eventsForDay.slice(0, maxVisibleEvents);
        visibleEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.category || 'work'}`;
            eventElement.textContent = event.title;
            eventElement.title = `${event.title} (${event.startTime || ''} - ${event.endTime || ''})`;
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEventModal(event.date, event);
            });
            dayEvents.appendChild(eventElement);
        });
        if (eventsForDay.length > maxVisibleEvents) {
            const moreElement = document.createElement('div');
            moreElement.className = 'event-item more-events';
            moreElement.textContent = `+${eventsForDay.length - maxVisibleEvents} more`;
            moreElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDayEvents(currentDay, eventsForDay);
            });
            dayEvents.appendChild(moreElement);
        }        
        dayElement.appendChild(dayEvents);
        dayElement.addEventListener('click', (e) => {
            if (e.target === dayElement || e.target === dayNumber) {
                this.showEventModal(currentDay);
            }
        });        
        grid.appendChild(dayElement);
    }    
    console.log('Month view rendered successfully');
}
    renderWeekView() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="week-view-container">
            <div class="week-header">
                <div class="week-time-header">Time</div>
                <div class="week-days-header"></div>
            </div>
            <div class="week-body">
                <div class="time-column">
                    <div class="time-slots"></div>
                </div>
                <div class="week-days-container"></div>
            </div>
        </div>
    `;
    const weekDaysHeader = container.querySelector('.week-days-header');
    const timeSlots = container.querySelector('.time-slots');
    const weekDaysContainer = container.querySelector('.week-days-container');
    for (let hour = 0; hour < 24; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = this.formatHour(hour);
        timeSlots.appendChild(timeSlot);
    }
    const weekStart = new Date(this.currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        const headerCell = document.createElement('div');
        headerCell.className = 'week-day-header';
        if (this.isSameDate(currentDay, today)) {
            headerCell.classList.add('today');
        }
        headerCell.innerHTML = `
            <div>${dayNames[i]}</div>
            <div style="font-size: 16px; margin-top: 2px; font-weight: 700;">${currentDay.getDate()}</div>
        `;
        weekDaysHeader.appendChild(headerCell);
        const columnElement = document.createElement('div');
        columnElement.className = 'week-day-column';
        columnElement.dataset.date = currentDay.toISOString().split('T')[0];
        const eventsForDay = this.getEventsForDate(currentDay);
        eventsForDay.forEach(event => {
            const eventElement = this.createTimedEventElement(event);
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEventModal(event.date, event);
            });
            columnElement.appendChild(eventElement);
        });
        columnElement.addEventListener('click', (e) => {
            if (e.target === columnElement) {
                this.showEventModal(currentDay);
            }
        });
        weekDaysContainer.appendChild(columnElement);
    }
}
    renderDayView() {
    const container = document.getElementById('calendarContainer');
    if (!container) {
        console.error('Calendar container not found');
        return;
    }
    container.innerHTML = `
        <div class="day-view-container">
            <div class="day-header">
                <h3 id="dayTitle">Today</h3>
                <div class="day-stats">
                    <span id="dayEventCount">0 events</span>
                    <span id="dayFocusTime">0h focus time</span>
                </div>
            </div>
            <div class="day-content">
                <div class="day-schedule">
                    <div class="time-column">
                        <div class="time-slots"></div>
                    </div>
                    <div class="events-column">
                        <div class="event-slots"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    const dayTitle = document.getElementById('dayTitle');
    const dayEventCount = document.getElementById('dayEventCount');
    const dayFocusTime = document.getElementById('dayFocusTime');
    const timeSlots = container.querySelector('.time-slots');
    const eventSlots = container.querySelector('.event-slots');
    if (!timeSlots || !eventSlots) {
        console.error('Required day view elements not found');
        return;
    }
    timeSlots.innerHTML = '';
    eventSlots.innerHTML = '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    if (dayTitle) {
        if (this.isSameDate(this.currentDate, today)) {
            dayTitle.textContent = 'Today';
        } else {
            const dayName = dayNames[this.currentDate.getDay()];
            const dateStr = this.currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
            });
            dayTitle.textContent = `${dayName}, ${dateStr}`;
        }
    }
    for (let hour = 0; hour < 24; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = this.formatHour(hour);
        timeSlot.dataset.hour = hour;
        timeSlot.addEventListener('click', () => {
            const eventDate = new Date(this.currentDate);
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            this.showEventModal(eventDate, null, timeStr);
        });
        timeSlots.appendChild(timeSlot);
    }
    eventSlots.style.position = 'relative';
    eventSlots.style.height = '1440px';
    const eventsForDay = this.getEventsForDate(this.currentDate);
    if (dayEventCount) {
        dayEventCount.textContent = `${eventsForDay.length} event${eventsForDay.length !== 1 ? 's' : ''}`;
    }
    const focusEvents = eventsForDay.filter(e => e.category === 'focus');
    const totalFocusTime = focusEvents.reduce((total, event) => {
        return total + this.getEventDuration(event);
    }, 0);
    if (dayFocusTime) {
        dayFocusTime.textContent = `${Math.round(totalFocusTime * 10) / 10}h focus time`;
    }
    eventsForDay.sort((a, b) => {
        const timeA = this.timeToMinutes(a.startTime || '09:00');
        const timeB = this.timeToMinutes(b.startTime || '09:00');
        return timeA - timeB;
    });
    eventsForDay.forEach(event => {
        const eventElement = this.createTimedEventElement(event);
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEventModal(event.date, event);
        });
        eventSlots.appendChild(eventElement);
    });
    eventSlots.addEventListener('click', (e) => {
        if (e.target === eventSlots) {
            const rect = eventSlots.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const hour = Math.floor(clickY / 60);
            const minute = Math.round(((clickY % 60) / 60) * 60);            
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            this.showEventModal(this.currentDate, null, timeStr);
        }
    });    
        console.log('Day view rendered successfully');
    }
    createTimedEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = `timed-event ${event.category || 'work'}`;
        eventElement.dataset.eventId = event.id;        
        const startTime = event.startTime || '09:00';
        const endTime = event.endTime || '10:00';        
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;        
        const topPosition = (startMinutes / 60) * 60;
        const height = Math.max((duration / 60) * 60, 30);         
        eventElement.style.cssText = `
            position: absolute;
            top: ${topPosition}px;
            left: 8px;
            right: 8px;
            height: ${height}px;
            z-index: 10;
            cursor: pointer;
            border-radius: 6px;
            padding: 6px;
            font-size: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
        `;        
        eventElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 2px; line-height: 1.2; color: white;">
                ${event.title}
            </div>
            <div style="font-size: 10px; opacity: 0.9; color: rgba(255, 255, 255, 0.8);">
                ${startTime} - ${endTime}
            </div>
        `;
        eventElement.addEventListener('mouseenter', () => {
            eventElement.style.transform = 'translateY(-2px)';
            eventElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        eventElement.addEventListener('mouseleave', () => {
            eventElement.style.transform = 'translateY(0)';
            eventElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });        
        return eventElement;
    }
    getEventsForDate(date) {
        if (!date) return [];
        
        return this.events.filter(event => {
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            return this.isSameDate(eventDate, date);
        });
    }
    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
        
        const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
        const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
        
        return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
    }
    formatHour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    }
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    getEventDuration(event) {
        const startMinutes = this.timeToMinutes(event.startTime);
        const endMinutes = this.timeToMinutes(event.endTime);
        return (endMinutes - startMinutes) / 60;
    }
    showQuickAdd() {
        const modal = document.getElementById('quickAddModal');
        if (modal) {
            modal.classList.add('show');
            const input = document.getElementById('quickEventText');
            if (input) input.focus();
        }
    }
    hideQuickAdd() {
        const modal = document.getElementById('quickAddModal');
        if (modal) {
            modal.classList.remove('show');
            const input = document.getElementById('quickEventText');
            if (input) input.value = '';
        }
    }
    showEventModal(date = null, event = null, defaultTime = null) {
        const modal = document.getElementById('eventModal');
        if (!modal) {
            console.error('Event modal not found');
            return;
        }        
        this.selectedEvent = event;
        modal.classList.add('show');
        this.hideValidationErrors();        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = event ? 'Edit Event' : 'Create Event';
        }        
        if (event) {
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            document.getElementById('eventTitle').value = event.title || '';
            document.getElementById('eventDate').value = this.formatDateForInput(eventDate);
            document.getElementById('eventStartTime').value = event.startTime || '09:00';
            document.getElementById('eventEndTime').value = event.endTime || '10:00';
            document.getElementById('eventCategory').value = event.category || 'work';
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('isRecurring').checked = event.isRecurring || false;
            document.getElementById('isAllDay').checked = event.isAllDay || false;
            document.getElementById('hasReminder').checked = event.hasReminder || false;
            
            const deleteBtn = document.getElementById('deleteEvent');
            if (deleteBtn) deleteBtn.style.display = 'inline-block';
        } else {
            this.clearEventForm();            
            if (date) {
                const eventDate = typeof date === 'string' ? new Date(date) : date;
                document.getElementById('eventDate').value = this.formatDateForInput(eventDate);
            }
            if (defaultTime) {
                document.getElementById('eventStartTime').value = defaultTime;
                const [hours, minutes] = defaultTime.split(':').map(Number);
                const endHour = hours + 1;
                const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                document.getElementById('eventEndTime').value = endTime;
            }
            const deleteBtn = document.getElementById('deleteEvent');
            if (deleteBtn) deleteBtn.style.display = 'none';
        }
        setTimeout(() => {
            const titleInput = document.getElementById('eventTitle');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
    }
    hideEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.remove('show');
            this.selectedEvent = null;
            this.hideValidationErrors();
        }
    }
    clearEventForm() {
        const inputs = [
            { id: 'eventTitle', value: '' },
            { id: 'eventDate', value: '' },
            { id: 'eventStartTime', value: '09:00' },
            { id: 'eventEndTime', value: '10:00' },
            { id: 'eventCategory', value: 'work' },
            { id: 'eventDescription', value: '' }
        ];
        inputs.forEach(input => {
            const element = document.getElementById(input.id);
            if (element) element.value = input.value;
        });
        const checkboxes = ['isRecurring', 'isAllDay', 'hasReminder'];
        checkboxes.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.checked = false;
        });
    }
    formatDateForInput(date) {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    selectEvent(event) {
        this.selectedEvent = event;
        this.showEventModal(event.date, event);
    }
    saveEvent() {
        const eventData = {
            title: document.getElementById('eventTitle')?.value?.trim() || '',
            date: document.getElementById('eventDate')?.value ? new Date(document.getElementById('eventDate').value) : null,
            startTime: document.getElementById('eventStartTime')?.value || '09:00',
            endTime: document.getElementById('eventEndTime')?.value || '10:00',
            category: document.getElementById('eventCategory')?.value || 'work',
            description: document.getElementById('eventDescription')?.value || '',
            isRecurring: document.getElementById('isRecurring')?.checked || false,
            isAllDay: document.getElementById('isAllDay')?.checked || false,
            hasReminder: document.getElementById('hasReminder')?.checked || false
        };
        const validationErrors = this.validateEventData(eventData);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }
        if (this.selectedEvent) {
            Object.assign(this.selectedEvent, eventData);
        } else {
            eventData.id = Date.now();
            this.events.push(eventData);
        }
        this.saveEvents();
        this.render();
        this.hideEventModal();
    }
    deleteEvent() {
        if (this.selectedEvent && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== this.selectedEvent.id);
            this.saveEvents();
            this.render();
            this.hideEventModal();
        }
    }
    parseQuickEvent() {
        const text = document.getElementById('quickEventText')?.value;
        if (!text?.trim()) return;
        const event = this.parseNaturalLanguage(text);
        if (event) {
            const validationErrors = this.validateEventData(event);
            if (validationErrors.length > 0) {
                alert('Cannot create event:\n' + validationErrors.join('\n'));
                return;
            }
            this.events.push(event);
            this.saveEvents();
            this.render();
            this.hideQuickAdd();
        }
    }
    parseNaturalLanguage(text) {
        const event = {
            id: Date.now(),
            title: text,
            date: new Date(),
            startTime: '09:00',
            endTime: '10:00',
            category: 'work',
            description: '',
            isRecurring: false,
            hasReminder: false
        };
        const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi;
        const timeMatches = text.match(timePattern);
        if (timeMatches && timeMatches.length > 0) {
            event.startTime = this.normalizeTime(timeMatches[0]);
            if (timeMatches.length > 1) {
                event.endTime = this.normalizeTime(timeMatches[1]);
            } else {
                const startMinutes = this.timeToMinutes(event.startTime);
                const endMinutes = startMinutes + 60;
                event.endTime = this.minutesToTime(endMinutes);
            }
        }
        const datePatterns = [
            /tomorrow/i,
            /today/i,
            /(\d{1,2})\/(\d{1,2})/,
            /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
        ];
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                event.date = this.parseRelativeDate(match[0]);
                break;
            }
        }
        if (/meeting|call|sync/i.test(text)) {
            event.category = 'meetings';
        } else if (/deadline|due|submit/i.test(text)) {
            event.category = 'deadlines';
        } else if (/focus|deep work|code|develop/i.test(text)) {
            event.category = 'focus';
        } else if (/personal|home|family/i.test(text)) {
            event.category = 'personal';
        }
        return event;
    }
    normalizeTime(timeStr) {
        const cleaned = timeStr.replace(/\s+/g, '').toLowerCase();
        let hours, minutes = 0;        
        if (cleaned.includes('pm') || cleaned.includes('am')) {
            const isPM = cleaned.includes('pm');
            const timeOnly = cleaned.replace(/(am|pm)/, '');
            if (timeOnly.includes(':')) {
                [hours, minutes] = timeOnly.split(':').map(Number);
            } else {
                hours = parseInt(timeOnly);
            }
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        } else {
            if (cleaned.includes(':')) {
                [hours, minutes] = cleaned.split(':').map(Number);
            } else {
                hours = parseInt(cleaned);
            }
        }        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    parseRelativeDate(dateStr) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);        
        switch (dateStr.toLowerCase()) {
            case 'today':
                return today;
            case 'tomorrow':
                return tomorrow;
            default:
                if (dateStr.includes('/')) {
                    const [month, day] = dateStr.split('/').map(Number);
                    const date = new Date(today.getFullYear(), month - 1, day);
                    if (date < today) {
                        date.setFullYear(today.getFullYear() + 1);
                    }
                    return date;
                }
                return today;
        }
    }
    searchEvents(query) {
        const filtered = this.events.filter(event => 
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(query.toLowerCase()))
        );
        this.highlightSearchResults(filtered);
    }
    highlightSearchResults(filteredEvents) {
        document.querySelectorAll('.event-item').forEach(el => {
            el.classList.remove('search-highlight');
        });
        if (filteredEvents.length === 0) return;
        filteredEvents.forEach(event => {
            const eventElements = document.querySelectorAll('.event-item');
            eventElements.forEach(el => {
                if (el.textContent === event.title) {
                    el.classList.add('search-highlight');
                }
            });
        });
    }
    filterByCategory(category) {
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');});
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        const eventElements = document.querySelectorAll('.event-item');
        eventElements.forEach(el => {
            if (category === 'all') {
                el.style.display = 'block';
            } else {
                el.style.display = el.classList.contains(category) ? 'block' : 'none';
            }
        });
    }
    toggleAnalytics() {
    const panel = document.getElementById('analyticsPanel');
    const toggleBtn = document.getElementById('analyticsToggle');
    if (panel) {
        this.analyticsVisible = !this.analyticsVisible;
        if (this.analyticsVisible) {
            panel.classList.add('show');
            if (toggleBtn) toggleBtn.classList.add('active');
            this.updateAnalytics();
        } else {
            panel.classList.remove('show');
            if (toggleBtn) toggleBtn.classList.remove('active');
        }
        }
    }
    loadEvents() {
        try {
            const savedEvents = localStorage.getItem('calendar-events');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents).map(event => ({
                    ...event,
                    date: new Date(event.date)
                }));
            }
        } catch (error) {
            console.error('Error loading events from localStorage:', error);
        }
    }
    saveEvents() {
        try {
            localStorage.setItem('calendar-events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events to localStorage:', error);
        }
    }
    getProductivityStats() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());        
        const weekEvents = this.events.filter(event => 
            event.date >= weekStart && event.date <= now
        );
        const stats = {
            weeklyHours: 0,
            focusTime: 0,
            meetingTime: 0,
            completedEvents: 0
        };
        weekEvents.forEach(event => {
            const duration = this.getEventDuration(event);
            stats.weeklyHours += duration;
            
            if (event.category === 'focus') {
                stats.focusTime += duration;
            } else if (event.category === 'meetings') {
                stats.meetingTime += duration;
            }
            
            if (event.completed) {
                stats.completedEvents++;
            }
        });        
        stats.completionRate = weekEvents.length > 0 ? 
            Math.round((stats.completedEvents / weekEvents.length) * 100) : 0;
        return stats;
    }
    updateAnalytics() {
        const stats = this.getProductivityStats();
        document.getElementById('weeklyHours').textContent = `${Math.round(stats.weeklyHours)}h`;
        document.getElementById('focusTime').textContent = `${Math.round(stats.focusTime)}h`;
        document.getElementById('meetingTime').textContent = `${Math.round(stats.meetingTime)}h`;
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
    }
}
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const calendar = new ProductivityCalendar();
    });
}
export default ProductivityCalendar;