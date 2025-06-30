import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';
// calendar.js
class ProductivityCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.events = [];
        this.selectedEvent = null;
        this.draggedEvent = null;
        
        this.init();
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

    init() {
        // Initialize date to start of month for consistent rendering
        this.currentDate.setDate(1);
        
        // Sample events for demonstration
        this.events = [
            {
                id: 1,
                title: 'Team Meeting',
                date: new Date(2025, 0, 15),
                startTime: '09:00',
                endTime: '10:00',
                category: 'meetings',
                description: 'Weekly team sync',
                isRecurring: true,
                hasReminder: true
            },
            {
                id: 2,
                title: 'Project Deadline',
                date: new Date(2025, 0, 20),
                startTime: '17:00',
                endTime: '17:30',
                category: 'deadlines',
                description: 'Final submission due',
                isRecurring: false,
                hasReminder: true
            },
            {
                id: 3,
                title: 'Focus Time: Development',
                date: new Date(2025, 0, 16),
                startTime: '14:00',
                endTime: '16:00',
                category: 'focus',
                description: 'Deep work session',
                isRecurring: false,
                hasReminder: false
            }
        ];
    }

    setupEventListeners() {
        // Navigation controls
        document.getElementById('prevBtn').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.navigateMonth(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // View controls
        document.getElementById('monthView').addEventListener('click', () => this.changeView('month'));
        document.getElementById('weekView').addEventListener('click', () => this.changeView('week'));
        document.getElementById('dayView').addEventListener('click', () => this.changeView('day'));

        // Event management
        document.getElementById('addEventBtn').addEventListener('click', () => this.showQuickAdd());
        document.getElementById('closeSidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('saveEvent').addEventListener('click', () => this.saveEvent());
        document.getElementById('deleteEvent').addEventListener('click', () => this.deleteEvent());

        // Quick add modal
        document.getElementById('parseEvent').addEventListener('click', () => this.parseQuickEvent());
        document.getElementById('cancelQuickAdd').addEventListener('click', () => this.hideQuickAdd());

        // Search and filters
        document.getElementById('eventSearch').addEventListener('input', (e) => this.searchEvents(e.target.value));
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showQuickAdd();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('eventSearch').focus();
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
                this.closeSidebar();
                this.hideQuickAdd();
            }
        });

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideQuickAdd();
            }
        });
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.currentDate.setDate(1);
        this.render();
    }

    changeView(view) {
        this.currentView = view;
        
        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');
        
        // Show/hide view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`${view}ViewContainer`).classList.add('active');
        
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
    }

    updateHeader() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const currentMonth = document.getElementById('currentMonth');
        currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderMonthView() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add classes for styling
            if (currentDay.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isSameDate(currentDay, today)) {
                dayElement.classList.add('today');
            }
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDay.getDate();
            dayElement.appendChild(dayNumber);
            
            // Events for this day
            const dayEvents = document.createElement('div');
            dayEvents.className = 'day-events';
            
            const eventsForDay = this.getEventsForDate(currentDay);
            eventsForDay.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${event.category}`;
                eventElement.textContent = event.title;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectEvent(event);
                });
                dayEvents.appendChild(eventElement);
            });
            
            dayElement.appendChild(dayEvents);
            
            // Click to add event
            dayElement.addEventListener('click', () => {
                this.openEventForm(currentDay);
            });
            
            grid.appendChild(dayElement);
        }
    }

    renderWeekView() {
        const weekContainer = document.getElementById('weekViewContainer');
        const weekHeader = weekContainer.querySelector('.week-header');
        const weekBody = weekContainer.querySelector('.week-body');
        const timeSlots = weekContainer.querySelector('.time-slots');
        
        // Clear existing content
        weekHeader.innerHTML = '';
        weekBody.innerHTML = '';
        timeSlots.innerHTML = '';
        
        // Generate time slots
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = this.formatHour(hour);
            timeSlots.appendChild(timeSlot);
        }
        
        // Get week start (Sunday)
        const weekStart = new Date(this.currentDate);
        const dayOfWeek = weekStart.getDay();
        weekStart.setDate(weekStart.getDate() - dayOfWeek);
        
        const today = new Date();
        
        // Generate week header and body
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);
            
            // Header
            const headerCell = document.createElement('div');
            headerCell.className = 'week-day-header';
            if (this.isSameDate(currentDay, today)) {
                headerCell.classList.add('today');
            }
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            headerCell.innerHTML = `
                <div>${dayNames[i]}</div>
                <div style="font-size: 18px; margin-top: 4px;">${currentDay.getDate()}</div>
            `;
            weekHeader.appendChild(headerCell);
            
            // Body column
            const columnElement = document.createElement('div');
            columnElement.className = 'week-day-column';
            
            // Add horizontal grid lines
            for (let hour = 0; hour < 24; hour++) {
                const hourLine = document.createElement('div');
                hourLine.style.cssText = `
                    position: absolute;
                    top: ${hour * 60}px;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #f1f5f9;
                `;
                columnElement.appendChild(hourLine);
            }
            
            // Add events for this day
            const eventsForDay = this.getEventsForDate(currentDay);
            eventsForDay.forEach(event => {
                const eventElement = this.createTimedEventElement(event);
                columnElement.appendChild(eventElement);
            });
            
            weekBody.appendChild(columnElement);
        }
    }

    renderDayView() {
        const dayContainer = document.getElementById('dayViewContainer');
        const dayTitle = document.getElementById('dayTitle');
        const dayEventCount = document.getElementById('dayEventCount');
        const dayFocusTime = document.getElementById('dayFocusTime');
        const timeSlots = dayContainer.querySelector('.time-slots');
        const eventSlots = dayContainer.querySelector('.event-slots');
        
        // Clear existing content
        timeSlots.innerHTML = '';
        eventSlots.innerHTML = '';
        
        // Update day title
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        if (this.isSameDate(this.currentDate, today)) {
            dayTitle.textContent = 'Today';
        } else {
            dayTitle.textContent = `${dayNames[this.currentDate.getDay()]}, ${this.currentDate.toLocaleDateString()}`;
        }
        
        // Generate time slots
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = this.formatHour(hour);
            timeSlots.appendChild(timeSlot);
        }
        
        // Get events for current day
        const eventsForDay = this.getEventsForDate(this.currentDate);
        
        // Update stats
        dayEventCount.textContent = `${eventsForDay.length} events`;
        const focusEvents = eventsForDay.filter(e => e.category === 'focus');
        const totalFocusTime = focusEvents.reduce((total, event) => {
            return total + this.getEventDuration(event);
        }, 0);
        dayFocusTime.textContent = `${Math.round(totalFocusTime)}h focus time`;
        
        // Add events
        eventsForDay.forEach(event => {
            const eventElement = this.createTimedEventElement(event);
            eventSlots.appendChild(eventElement);
        });
    }

    createTimedEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = `timed-event ${event.category}`;
        
        const startMinutes = this.timeToMinutes(event.startTime);
        const endMinutes = this.timeToMinutes(event.endTime);
        const duration = endMinutes - startMinutes;
        
        eventElement.style.cssText = `
            top: ${startMinutes}px;
            height: ${duration}px;
            z-index: 10;
        `;
        
        eventElement.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 2px;">${event.title}</div>
            <div style="font-size: 11px; opacity: 0.9;">${event.startTime} - ${event.endTime}</div>
        `;
        
        eventElement.addEventListener('click', () => this.selectEvent(event));
        
        return eventElement;
    }

    getEventsForDate(date) {
        return this.events.filter(event => this.isSameDate(event.date, date));
    }

    isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
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
        return (endMinutes - startMinutes) / 60; // Return hours
    }

    showQuickAdd() {
        document.getElementById('quickAddModal').classList.add('show');
        document.getElementById('quickEventText').focus();
    }

    hideQuickAdd() {
        document.getElementById('quickAddModal').classList.remove('show');
        document.getElementById('quickEventText').value = '';
    }

    parseQuickEvent() {
        const text = document.getElementById('quickEventText').value;
        if (!text.trim()) return;
        
        // Simple natural language parsing
        const event = this.parseNaturalLanguage(text);
        if (event) {
            this.events.push(event);
            this.render();
            this.hideQuickAdd();
        }
    }

    parseNaturalLanguage(text) {
        // Basic parsing - can be enhanced with more sophisticated NLP
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
        
        // Extract time patterns
        const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi;
        const timeMatches = text.match(timePattern);
        if (timeMatches && timeMatches.length > 0) {
            event.startTime = this.normalizeTime(timeMatches[0]);
            if (timeMatches.length > 1) {
                event.endTime = this.normalizeTime(timeMatches[1]);
            } else {
                // Default 1 hour duration
                const startMinutes = this.timeToMinutes(event.startTime);
                const endMinutes = startMinutes + 60;
                event.endTime = this.minutesToTime(endMinutes);
            }
        }
        
        // Extract date patterns
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
        
        // Extract category hints
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
        // Convert various time formats to HH:MM
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

    selectEvent(event) {
        this.selectedEvent = event;
        this.openEventForm(event.date, event);
    }

    openEventForm(date, event = null) {
        const sidebar = document.getElementById('eventSidebar');
        sidebar.classList.add('open');
        
        if (event) {
            // Edit existing event
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDate').value = this.formatDateForInput(event.date);
            document.getElementById('eventStartTime').value = event.startTime;
            document.getElementById('eventEndTime').value = event.endTime;
            document.getElementById('eventCategory').value = event.category;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('isRecurring').checked = event.isRecurring;
            document.getElementById('isAllDay').checked = event.isAllDay || false;
            document.getElementById('hasReminder').checked = event.hasReminder;
            
            document.getElementById('deleteEvent').style.display = 'block';
        } else {
            // New event
            this.clearEventForm();
            document.getElementById('eventDate').value = this.formatDateForInput(date);
            document.getElementById('deleteEvent').style.display = 'none';
        }
    }

    clearEventForm() {
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventStartTime').value = '09:00';
        document.getElementById('eventEndTime').value = '10:00';
        document.getElementById('eventCategory').value = 'work';
        document.getElementById('eventDescription').value = '';
        document.getElementById('isRecurring').checked = false;
        document.getElementById('isAllDay').checked = false;
        document.getElementById('hasReminder').checked = false;
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    closeSidebar() {
        document.getElementById('eventSidebar').classList.remove('open');
        this.selectedEvent = null;
    }

    saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        if (!title) {
            alert('Please enter an event title');
            return;
        }
        
        const eventData = {
            title,
            date: new Date(document.getElementById('eventDate').value),
            startTime: document.getElementById('eventStartTime').value,
            endTime: document.getElementById('eventEndTime').value,
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value,
            isRecurring: document.getElementById('isRecurring').checked,
            isAllDay: document.getElementById('isAllDay').checked,
            hasReminder: document.getElementById('hasReminder').checked
        };
        
        if (this.selectedEvent) {
            // Update existing event
            Object.assign(this.selectedEvent, eventData);
        } else {
            // Create new event
            eventData.id = Date.now();
            this.events.push(eventData);
        }
        
        this.saveEvents();
        this.render();
        this.closeSidebar();
    }

    deleteEvent() {
        if (this.selectedEvent && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== this.selectedEvent.id);
            this.saveEvents();
            this.render();
            this.closeSidebar();
        }
    }

    searchEvents(query) {
        // Filter events based on search query
        const filtered = this.events.filter(event => 
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Highlight matching events in the UI
        this.highlightSearchResults(filtered);
    }

    highlightSearchResults(filteredEvents) {
        // Remove existing highlights
        document.querySelectorAll('.event-item').forEach(el => {
            el.classList.remove('search-highlight');
        });
        
        if (filteredEvents.length === 0) return;
        
        // Add highlights to matching events
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
        // Update active filter button
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Filter events
        const eventElements = document.querySelectorAll('.event-item');
        eventElements.forEach(el => {
            if (category === 'all') {
                el.style.display = 'block';
            } else {
                el.style.display = el.classList.contains(category) ? 'block' : 'none';
            }
        });
    }

    loadEvents() {
        // In a real app, this would load from Electron's storage or database
        const savedEvents = localStorage.getItem('calendar-events');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents).map(event => ({
                ...event,
                date: new Date(event.date)
            }));
        }
    }

    saveEvents() {
        // In a real app, this would save to Electron's storage or database
        localStorage.setItem('calendar-events', JSON.stringify(this.events));
    }

    // Analytics and productivity tracking
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
        
        // Show analytics panel periodically
        setTimeout(() => {
            document.getElementById('analyticsPanel').classList.add('show');
        }, 2000);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new ProductivityCalendar();
    
    // Update analytics every 5 seconds for demo
    setInterval(() => {
        calendar.updateAnalytics();
    }, 5000);
});