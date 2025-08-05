    // calendar.js
class ProductivityCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.events = [];
        this.selectedEvent = null;
        this.searchQuery = '';
        this.isSearchActive = false;
        this.searchResults = [];
        this.selectedSearchIndex = -1;
        this.searchDropdownVisible = false;
        this.init();
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }
    init() {
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
    document.getElementById('eventSearch')?.addEventListener('input', (e) => {
        this.searchEvents(e.target.value);
    });
    document.getElementById('eventSearch')?.addEventListener('focus', () => {
        if (this.searchQuery.trim() && this.searchResults.length > 0) {
            this.showSearchDropdown();
        }
    });
    document.getElementById('eventSearch')?.addEventListener('blur', (e) => {
        setTimeout(() => {
            if (!document.querySelector('.search-dropdown:hover')) {
                this.hideSearchDropdown();
            }
        }, 150);
    });        document.querySelectorAll('.category-filter').forEach(btn => {btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));});
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
                    case 'Enter':
                    if (document.activeElement?.id === 'eventSearch') {
                        e.preventDefault();
                        if (this.searchDropdownVisible && this.selectedSearchIndex >= 0) {
                            this.selectSearchResult(this.selectedSearchIndex);
                        } else {
                            const searchValue = document.getElementById('eventSearch').value;
                            if (searchValue.trim()) {
                                this.searchEvents(searchValue);
                            }
                        }
                    }
                    break;
                    case 'ArrowDown':
                        if (document.activeElement?.id === 'eventSearch') {
                            e.preventDefault();
                            if (this.searchDropdownVisible) {
                                this.navigateSearchDropdown(1);
                            } else if (this.isSearchActive) {
                                this.navigateToNextSearchResult(1);
                            }
                        }
                        break;
                    case 'ArrowUp':
                        if (document.activeElement?.id === 'eventSearch') {
                            e.preventDefault();
                            if (this.searchDropdownVisible) {
                                this.navigateSearchDropdown(-1);
                            } else if (this.isSearchActive) {
                                this.navigateToNextSearchResult(-1);
                            }
                        }
                        break;
                }
            }
            if (e.key === 'Escape') {
                if (document.activeElement?.id === 'eventSearch') {
                    this.hideSearchDropdown();
                    this.clearSearch();
                } else {
                    this.hideEventModal();
                    this.hideQuickAdd();
                }
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
            if (!this.selectedEvent) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDateCopy = new Date(eventDate);
                eventDateCopy.setHours(0, 0, 0, 0);
                if (eventDateCopy < today) {
                    errors.push('Cannot create events in the past');
                }
                if (eventDateCopy.getTime() === today.getTime() && eventData.startTime) {
                    const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
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
        const wasSearchActive = this.isSearchActive;
        const currentSearchQuery = this.searchQuery;
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
        if (wasSearchActive && currentSearchQuery) {
            const searchInput = document.getElementById('eventSearch');
            if (searchInput) {
                searchInput.value = currentSearchQuery;
            }
            setTimeout(() => {
                const filteredEvents = this.events.filter(event => 
                    event.title.toLowerCase().includes(currentSearchQuery) ||
                    (event.description && event.description.toLowerCase().includes(currentSearchQuery)) ||
                    (event.category && event.category.toLowerCase().includes(currentSearchQuery))
                );
                this.applySearchFilter(filteredEvents);
                this.showSearchResultsCount(filteredEvents.length);
            }, 50);
        }
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
                <div class="week-grid">
                    <div class="time-header">Time</div>
                    <div class="week-days-header">
                    </div>
                    <div class="time-column">
                    </div>
                    <div class="week-days-grid">
                    </div>
                </div>
            </div>
        `;
        const weekDaysHeader = container.querySelector('.week-days-header');
        const timeColumn = container.querySelector('.time-column');
        const weekDaysGrid = container.querySelector('.week-days-grid');
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = this.formatHour(hour);
            timeSlot.style.height = '60px';
            timeSlot.style.borderBottom = '1px solid var(--white)';
            timeSlot.style.padding = '8px';
            timeSlot.style.fontSize = '12px';
            timeSlot.style.color = '#6b7280';
            timeColumn.appendChild(timeSlot);
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
                <div class="day-name">${dayNames[i]}</div>
                <div class="day-number">${currentDay.getDate()}</div>
            `;
            weekDaysHeader.appendChild(headerCell);
            const dayColumn = document.createElement('div');
            dayColumn.className = 'week-day-column';
            dayColumn.dataset.date = currentDay.toISOString().split('T')[0];
            dayColumn.style.position = 'relative';
            dayColumn.style.height = '1440px';
            dayColumn.style.borderRight = '1px solid var(--border-color)';
            for (let hour = 0; hour < 24; hour++) {
                const hourLine = document.createElement('div');
                hourLine.className = 'hour-line';
                hourLine.style.cssText = `
                    position: absolute;
                    top: ${hour * 60}px;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background-color: var(--medium-purple);
                    z-index: 1;
                `;
                dayColumn.appendChild(hourLine);
            }
            const eventsForDay = this.getEventsForDate(currentDay);
            eventsForDay.forEach(event => {
                const eventElement = this.createTimedEventElement(event);
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventModal(event.date, event);
                });
                dayColumn.appendChild(eventElement);
            });
            dayColumn.addEventListener('click', (e) => {
                if (e.target === dayColumn || e.target.classList.contains('hour-line')) {
                    const rect = dayColumn.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const hour = Math.floor(clickY / 60);
                    const minute = Math.round(((clickY % 60) / 60) * 60);
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    this.showEventModal(currentDay, null, timeStr);
                }
            });
            weekDaysGrid.appendChild(dayColumn);
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
                <div class="day-grid">
                    <div class="day-time-column">
                        <!-- Time slots will be populated -->
                    </div>
                    <div class="day-events-column">
                        <!-- Events will be populated -->
                    </div>
                </div>
            </div>
        `;
        const dayTitle = document.getElementById('dayTitle');
        const dayEventCount = document.getElementById('dayEventCount');
        const dayFocusTime = document.getElementById('dayFocusTime');
        const timeColumn = container.querySelector('.day-time-column');
        const eventsColumn = container.querySelector('.day-events-column');
        if (!timeColumn || !eventsColumn) {
            console.error('Required day view elements not found');
            return;
        }
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        if (dayTitle) {
            if (this.isSameDate(this.currentDate, today)) {
                const dateStr = this.currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                });
                dayTitle.textContent = `Today - ${dateStr}`;
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
            timeSlot.style.cssText = `
                height: 60px;
                padding: 8px;
                border-bottom: 1px solid var(--border-secondary);
                font-size: 12px;
                color: var(--dark-blue);
                cursor: pointer;
                display: flex;
                align-items: flex-start;
            `;
            timeSlot.addEventListener('click', () => {
                const eventDate = new Date(this.currentDate);
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                this.showEventModal(eventDate, null, timeStr);
            });
            timeColumn.appendChild(timeSlot);
        }
        eventsColumn.style.cssText = `
            position: relative;
            height: 1440px;
            border-left: 1px solid var(--border-color);
        `;
        for (let hour = 0; hour < 24; hour++) {
            const hourLine = document.createElement('div');
            hourLine.className = 'hour-line';
            hourLine.style.cssText = `
                position: absolute;
                top: ${hour * 60}px;
                left: 0;
                right: 0;
                height: 1px;
                background-color: var(--white);
                z-index: 1;
            `;
            eventsColumn.appendChild(hourLine);
        }
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
            eventsColumn.appendChild(eventElement);
        });
        eventsColumn.addEventListener('click', (e) => {
            if (e.target === eventsColumn || e.target.classList.contains('hour-line')) {
                const rect = eventsColumn.getBoundingClientRect();
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
        left: 4px;
        right: 4px;
        height: ${height}px;
        z-index: 10;
        cursor: pointer;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    `;
    eventElement.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 2px; line-height: 1.2; color: white; font-size: 11px;">
            ${event.title}
        </div>
        <div style="font-size: 10px; opacity: 0.9; color: rgba(255, 255, 255, 0.8);">
            ${startTime} - ${endTime}
        </div>
    `;
    eventElement.addEventListener('mouseenter', () => {
        eventElement.style.transform = 'translateY(-1px)';
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
        let eventsForDate = this.events.filter(event => {
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            return this.isSameDate(eventDate, date);    });
        if (this.isSearchActive) {
            eventsForDate = eventsForDate.filter(event => 
                event.title.toLowerCase().includes(this.searchQuery) ||
                (event.description && event.description.toLowerCase().includes(this.searchQuery)) ||
                (event.category && event.category.toLowerCase().includes(this.searchQuery))
            );
        }
        return eventsForDate;
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

    // Get the time input fields first
    const startTimeInput = document.getElementById('eventStartTime');
    const endTimeInput = document.getElementById('eventEndTime');
    
    // Make sure the input fields are visible and styled
    if (startTimeInput) {
        startTimeInput.style.display = 'block';
        startTimeInput.placeholder = 'Start time';
        startTimeInput.setAttribute('aria-label', 'Start time');
    }
    if (endTimeInput) {
        endTimeInput.style.display = 'block';
        endTimeInput.placeholder = 'End time';
        endTimeInput.setAttribute('aria-label', 'End time');
    }
    
    // Completely remove labels (not just hide them) to eliminate empty space
    const allLabels = modal.querySelectorAll('label');
    allLabels.forEach(label => {
        const labelText = label.textContent.toLowerCase().trim();
        const labelFor = label.getAttribute('for');
        if (labelText.includes('start time') || labelText.includes('end time') || 
            labelFor === 'eventStartTime' || labelFor === 'eventEndTime') {
            label.remove(); // Remove from DOM instead of hiding
        }
    });
    
    // Collapse containers and remove empty space
    const timeContainers = modal.querySelectorAll('.time-field-container, .form-group, .field-group, .input-group');
    timeContainers.forEach(container => {
        const hasStartTime = container.querySelector('#eventStartTime');
        const hasEndTime = container.querySelector('#eventEndTime');
        
        if (hasStartTime || hasEndTime) {
            // Remove any remaining empty elements
            const emptyDivs = container.querySelectorAll('div:empty, span:empty, p:empty');
            emptyDivs.forEach(el => el.remove());
            
            // Collapse the container spacing completely
            container.style.cssText = `
                margin: 0 !important;
                padding: 0 !important;
                min-height: auto !important;
                height: auto !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 5px !important;
            `;
            
            // Style the input directly within the container
            const timeInput = container.querySelector('input[type="time"]');
            if (timeInput) {
                timeInput.style.cssText = `
                    margin: 0 !important;
                    padding: 8px 12px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                `;
            }
        }
    });
    
    if (event) {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventDate').value = this.formatDateForInput(eventDate);
        document.getElementById('eventStartTime').value = event.startTime || '09:00';
        document.getElementById('eventEndTime').value = event.endTime || '10:00';
        document.getElementById('eventCategory').value = event.category || 'work';
        document.getElementById('eventDescription').value = event.description || '';
        
        const isRecurringEl = document.getElementById('isRecurring');
        const isAllDayEl = document.getElementById('isAllDay');
        const hasReminderEl = document.getElementById('hasReminder');
        
        if (isRecurringEl) {
            isRecurringEl.checked = Boolean(event.isRecurring);
        }
        if (isAllDayEl) {
            isAllDayEl.checked = Boolean(event.isAllDay);
            isAllDayEl.dispatchEvent(new Event('change'));
        }
        if (hasReminderEl) {
            hasReminderEl.checked = Boolean(event.hasReminder);
        }
        
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
        
        const checkboxes = ['isRecurring', 'isAllDay', 'hasReminder'];
        checkboxes.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.checked = false;
            }
        });
        
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
        if (element) {
            element.value = input.value;
        }
    });
    const checkboxes = ['isRecurring', 'isAllDay', 'hasReminder'];
    checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = false;
            element.dispatchEvent(new Event('change'));
        }
    });
    const timeFields = document.querySelectorAll('.time-field-container');
    timeFields.forEach(field => {
        field.style.display = 'block';
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
        this.searchQuery = query.toLowerCase().trim();
        this.isSearchActive = this.searchQuery.length > 0;
        if (!this.isSearchActive) {
            this.clearSearchHighlight();
            this.hideSearchDropdown();
            this.searchResults = [];
            this.render();
            return;
        }
        const filteredEvents = this.events.filter(event => 
            event.title.toLowerCase().includes(this.searchQuery) ||
            (event.description && event.description.toLowerCase().includes(this.searchQuery)) ||
            (event.category && event.category.toLowerCase().includes(this.searchQuery))
        );
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateA.getTime() - dateB.getTime();
        });
        this.searchResults = sortedEvents.slice(0, 5);
        this.selectedSearchIndex = -1;
        if (this.searchResults.length > 0) {
            this.showSearchDropdown();
            this.navigateToSearchResult(this.searchResults[0]);
        } else {
            this.showSearchDropdown(); 
            this.clearSearchHighlight();
        }
    }
    showSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;
        const resultsList = dropdown.querySelector('.search-results-list');
        if (!resultsList) return;
        if (this.searchResults.length === 0) {
            resultsList.innerHTML = '<div class="search-no-results">No events found</div>';
        } else {
            resultsList.innerHTML = this.searchResults.map((event, index) => {
                const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
                const dateStr = eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                const timeStr = event.isAllDay ? 'All Day' : 
                    `${event.startTime || ''} - ${event.endTime || ''}`;
                return `
                    <div class="search-result-item" data-index="${index}">
                        <div class="search-result-title">${event.title}</div>
                        <div class="search-result-details">
                            <span class="search-result-date">${dateStr}</span>
                            <span class="search-result-time">${timeStr}</span>
                            <span class="search-result-category ${event.category || 'work'}">${(event.category || 'work').toUpperCase()}</span>
                        </div>
                    </div>
                `;
            }).join('');
            resultsList.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.selectSearchResult(index);
                });
            });
        }
        dropdown.style.display = 'block';
        this.searchDropdownVisible = true;
    }
    hideSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.searchDropdownVisible = false;
            this.selectedSearchIndex = -1;
        }
    }
    navigateSearchDropdown(direction) {
        if (this.searchResults.length === 0) return;
        const items = document.querySelectorAll('.search-result-item');
        if (items.length === 0) return;
        items.forEach(item => item.classList.remove('highlighted'));
        this.selectedSearchIndex += direction;
        if (this.selectedSearchIndex < 0) {
            this.selectedSearchIndex = this.searchResults.length - 1;
        } else if (this.selectedSearchIndex >= this.searchResults.length) {
            this.selectedSearchIndex = 0;
        }
        items[this.selectedSearchIndex].classList.add('highlighted');
        items[this.selectedSearchIndex].scrollIntoView({ block: 'nearest' });
    }
    selectSearchResult(index) {
        if (index < 0 || index >= this.searchResults.length) return;
        const selectedEvent = this.searchResults[index];
        this.hideSearchDropdown();
        this.navigateToSearchResult(selectedEvent);
    }
    navigateToSearchResult(event) {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        this.targetSearchEvent = event;
        this.navigateToDate(eventDate);
    }
    clearSearch() {
        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchQuery = '';
        this.isSearchActive = false;
        this.searchResults = [];
        this.hideSearchDropdown();
        this.clearSearchHighlight();
        this.render();
    }
    navigateToFirstSearchResult(filteredEvents) {
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateA.getTime() - dateB.getTime();
        });
        const firstEvent = sortedEvents[0];
        const eventDate = typeof firstEvent.date === 'string' ? new Date(firstEvent.date) : firstEvent.date;
        this.targetSearchEvent = firstEvent;
        this.currentSearchIndex = 0; 
        this.searchResults = sortedEvents; 
        const needsNavigation = this.checkIfNavigationNeeded(eventDate);
        if (needsNavigation) {
            this.navigateToDate(eventDate);
        } else {
            this.applySearchFilter(filteredEvents);
            this.highlightTargetEvent(firstEvent);
        }
        this.showSearchResultsCount(filteredEvents.length);
    }
    checkIfNavigationNeeded(targetDate) {
        const currentViewDate = new Date(this.currentDate);
        const target = new Date(targetDate);
        switch(this.currentView) {
            case 'month':
                return currentViewDate.getFullYear() !== target.getFullYear() || currentViewDate.getMonth() !== target.getMonth();
            case 'week':
                const currentWeekStart = new Date(currentViewDate);
                currentWeekStart.setDate(currentViewDate.getDate() - currentViewDate.getDay());
                const currentWeekEnd = new Date(currentWeekStart);
                currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
                return target < currentWeekStart || target > currentWeekEnd;
            case 'day':
                return !this.isSameDate(currentViewDate, target);
            default:
                return false;
        }
    }
    navigateToDate(targetDate) {
        const previousDate = new Date(this.currentDate);
        this.currentDate = new Date(targetDate);
        if (this.currentView === 'month') {
            this.currentDate.setDate(1);
        }
        this.render();
        setTimeout(() => {
            this.applySearchFilterAfterNavigation();
            if (this.targetSearchEvent) {
                this.highlightTargetEvent(this.targetSearchEvent);
                this.targetSearchEvent = null;
            }
        }, 100);
    }
    applySearchFilterAfterNavigation() {
        const filteredEvents = this.events.filter(event => 
            event.title.toLowerCase().includes(this.searchQuery) ||
            (event.description && event.description.toLowerCase().includes(this.searchQuery)) ||
            (event.category && event.category.toLowerCase().includes(this.searchQuery))
        );
        this.applySearchFilter(filteredEvents);
        setTimeout(() => {
            if (this.targetSearchEvent) {
                this.highlightTargetEvent(this.targetSearchEvent);
                    this.targetSearchEvent = null;
                }
            }, 200); 
        }
    highlightTargetEvent(targetEvent) {
        document.querySelectorAll('.search-primary-highlight').forEach(el => {
            el.classList.remove('search-primary-highlight');
            el.style.animation = '';
        });
        const eventElements = document.querySelectorAll('.event-item, .timed-event');
        let highlighted = false;
        eventElements.forEach(el => {
            const eventId = el.dataset.eventId;
            const eventTitle = el.textContent.split('\n')[0].trim();
            if ((eventId && parseInt(eventId) === targetEvent.id) || 
                (eventTitle === targetEvent.title && !highlighted)) {
                el.classList.add('search-primary-highlight');
                highlighted = true;
                setTimeout(() => {
                    el.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                }, 100);
                el.style.animation = 'searchPulse 2s ease-in-out';
                setTimeout(() => {
                    el.style.animation = '';
                }, 2000);
            }
        });
        if (!highlighted) {
            console.warn('Target event not found in current view:', targetEvent.title);
        }
    }
    clearSearchAndReturnToToday() {
        this.resetSearch();
        this.clearSearchHighlight();
        this.goToToday();
    }
    applySearchFilter(filteredEvents) {
        const filteredEventIds = new Set(filteredEvents.map(event => event.id));
        switch(this.currentView) {
            case 'month':
                this.applyMonthSearchFilter(filteredEventIds);
                break;
            case 'week':
                this.applyWeekSearchFilter(filteredEventIds);
                break;
            case 'day':
                this.applyDaySearchFilter(filteredEventIds);
                break;
        }
    }
    applyMonthSearchFilter(filteredEventIds) {
        const eventElements = document.querySelectorAll('.event-item');
        eventElements.forEach(eventEl => {
            const eventTitle = eventEl.textContent.replace(/^\+\d+\s+more$/, ''); 
            const matchingEvent = this.events.find(event => 
                event.title === eventTitle || eventTitle.includes(event.title)
            );
            if (matchingEvent && filteredEventIds.has(matchingEvent.id)) {
                eventEl.style.display = 'block';
                eventEl.classList.add('search-highlight');
            } else if (!eventEl.classList.contains('more-events')) {
                eventEl.style.display = 'none';
                eventEl.classList.remove('search-highlight');
            }
        });
    }
    applyWeekSearchFilter(filteredEventIds) {
        const eventElements = document.querySelectorAll('.timed-event');
        eventElements.forEach(eventEl => {
            const eventId = parseInt(eventEl.dataset.eventId);
            if (filteredEventIds.has(eventId)) {
                eventEl.style.display = 'flex';
                eventEl.classList.add('search-highlight');
            } else {
                eventEl.style.display = 'none';
                eventEl.classList.remove('search-highlight');
            }
        });
    }
    applyDaySearchFilter(filteredEventIds) {
        const eventElements = document.querySelectorAll('.timed-event');
        eventElements.forEach(eventEl => {
            const eventId = parseInt(eventEl.dataset.eventId);
            if (filteredEventIds.has(eventId)) {
                eventEl.style.display = 'flex';
                eventEl.classList.add('search-highlight');
            } else {
                eventEl.style.display = 'none';
                eventEl.classList.remove('search-highlight');
            }
        });
    }
    clearSearchHighlight() {
        const eventElements = document.querySelectorAll('.event-item, .timed-event');
        eventElements.forEach(el => {
            el.style.display = '';
            el.classList.remove('search-highlight');
        });
        this.hideSearchResultsCount();
    }
    showSearchResultsCount(count) {
        let resultsDisplay = document.getElementById('searchResults');
        if (!resultsDisplay) {
            resultsDisplay = document.createElement('div');
            resultsDisplay.id = 'searchResults';
            resultsDisplay.className = 'search-results-count';
            const searchContainer = document.getElementById('eventSearch')?.parentElement;
            if (searchContainer) {
                searchContainer.appendChild(resultsDisplay);
            }
        }
        if (count === 0) {
            resultsDisplay.textContent = 'No events found';
            resultsDisplay.className = 'search-results-count no-results';
        } else {
            const eventText = count === 1 ? 'event' : 'events';
            resultsDisplay.textContent = `${count} ${eventText} found`;
            resultsDisplay.className = 'search-results-count has-results';
            if (count > 1) {
                resultsDisplay.textContent += ' (navigated to earliest)';
            }
        }
        resultsDisplay.style.display = 'block';
    }
    hideSearchResultsCount() {
        const resultsDisplay = document.getElementById('searchResults');
        if (resultsDisplay) {
            resultsDisplay.style.display = 'none';
        }
    }
    navigateToNextSearchResult(direction = 1) {
        if (!this.isSearchActive) return;
        const filteredEvents = this.events.filter(event => 
            event.title.toLowerCase().includes(this.searchQuery) ||
            (event.description && event.description.toLowerCase().includes(this.searchQuery)) ||
            (event.category && event.category.toLowerCase().includes(this.searchQuery))
        );
        if (filteredEvents.length === 0) return;
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateA.getTime() - dateB.getTime();
        });
        let currentIndex = this.currentSearchIndex || 0;
        currentIndex = (currentIndex + direction) % sortedEvents.length;
        if (currentIndex < 0) currentIndex = sortedEvents.length - 1;
        this.currentSearchIndex = currentIndex;
        const targetEvent = sortedEvents[currentIndex];
        this.targetSearchEvent = targetEvent;
        const eventDate = typeof targetEvent.date === 'string' ? new Date(targetEvent.date) : targetEvent.date;
        this.navigateToDate(eventDate);
        this.showSearchResultsCount(filteredEvents.length);
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
    showDayEvents(date, events) {
        const modal = document.createElement('div');
        modal.className = 'day-events-modal modal-overlay';
        modal.innerHTML = `
            <div class="cal-modal-content">
                <div class="cal-modal-header">
                    <h3>Events for ${date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</h3>
                    <button class="close-cal-btn" onclick="this.closest('.day-events-modal').remove()">×</button>
                </div>
                <div class="cal-modal-body">
                    <div class="day-events-list">
                        ${events.map(event => `
                            <div class="event-item-detailed ${event.category || 'work'}" data-event-id="${event.id}">
                                <div class="event-title">${event.title}</div>
                                <div class="event-time">
                                    ${event.isAllDay ? 'All Day' : 
                                    `${event.startTime || ''} - ${event.endTime || ''}`}                                    
                                    </div>
                                    <div class="event-category">${(event.category || 'work').toUpperCase()}</div>
                                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                modal.remove();
            }
            const eventItem = e.target.closest('.event-item-detailed');
            if (eventItem) {
                const eventId = parseInt(eventItem.dataset.eventId);
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    modal.remove();
                    this.showEventModal(event.date, event);
                }
            }
        });
        document.body.appendChild(modal);
    }
}
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const calendar = new ProductivityCalendar();
    });
}
export default ProductivityCalendar;