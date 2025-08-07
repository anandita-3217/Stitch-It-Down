// tasks.js - Enhanced Task Manager with focus restoration and input validation
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';

class TaskManager {
    constructor() {
        this.STORAGE_KEY = 'stitchTasks';
        this.editingTask = null;
        this.tempTaskData = null;
        this.lastFocusedElement = null;
        this.searchTerm = ''; 
        this.activeFilters = {
            priority: null,
            frequency: null,
            status: null 
        };
        this.init();
    }
    init() {
        try {
            const testData = this.getTasks();
            if (!Array.isArray(testData)) {
                localStorage.removeItem(this.STORAGE_KEY);
            }
        } catch (error) {
            localStorage.removeItem(this.STORAGE_KEY);
        }        
        this.setupEventListeners();
        this.loadTasks();
        this.setupProgressTracking();
        this.setupDeadlineAlerts();
        this.setupISTReset();
        this.setupFocusTracking();
        this.setupSearchFunctionality(); 
    }
    setupFocusTracking() {
        const trackableFocusElements = ['taskInput', 'task-search'];        
        trackableFocusElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('focus', () => {
                    this.lastFocusedElement = element;
                });
            }
        });
        this.setupKeyboardShortcuts();
    }
    setupSearchFunctionality() {
    const searchInput = document.getElementById('task-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
            if (searchInput) {
            let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    const inputValue = e.target.value;
                    if (inputValue.trim() === '') {
                        if (this.searchQuery !== '') {
                            this.searchQuery = '';
                        }
                        return;
                    }
                    this.searchQuery = inputValue.toLowerCase();
                    searchTimeout = setTimeout(() => {
                        
                    }, 300);
                });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputValue = e.target.value;
            if (inputValue.trim() === '') {
                this.shakeInput(searchInput);
                return;
            }
            clearTimeout(searchTimeout);
            this.searchQuery = inputValue.toLowerCase();
                }
            });
            searchInput.addEventListener('blur', (e) => {
        const inputValue = e.target.value;
        if (inputValue !== '' && inputValue.trim() === '') {
            this.shakeInput(searchInput);
            searchInput.value = '';
            this.searchQuery = '';
        }
    });
        }

    if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const filterType = e.target.dataset.filter;
            const filterValue = e.target.dataset.value;
            // console.log('Filter clicked:', filterType, filterValue);
            this.toggleFilter(filterType, filterValue, e.target);
        });
    });
}
    clearSearch() {
    console.log('Clearing search...');
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
    this.searchTerm = '';
    this.applyFiltersAndSearch();
    this.updateSearchResultsCount();
    if (searchInput) {
        searchInput.focus();
    }
    console.log('Search cleared');
}
    toggleFilter(filterType, filterValue, buttonElement) {
        if (this.activeFilters[filterType] === filterValue) {
            this.activeFilters[filterType] = null;
            buttonElement.classList.remove('active');
        } else {
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            this.activeFilters[filterType] = filterValue;
            buttonElement.classList.add('active');
        }
        this.applyFiltersAndSearch();
    }
    applyFiltersAndSearch() {
    try {
        const tasks = this.getTasks();
        let filteredTasks = tasks;
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchTerm) ||
                task.priority.toLowerCase().includes(this.searchTerm) ||
                task.frequency.toLowerCase().includes(this.searchTerm)
            );
        }
        if (this.activeFilters.priority) {
            filteredTasks = filteredTasks.filter(task => 
                task.priority === this.activeFilters.priority
            );
        }
        if (this.activeFilters.frequency) {
            filteredTasks = filteredTasks.filter(task => 
                task.frequency === this.activeFilters.frequency
            );
        }
        if (this.activeFilters.status) {
            filteredTasks = filteredTasks.filter(task => {
                switch(this.activeFilters.status) {
                    case 'completed':
                        return task.completed;
                    case 'pending':
                        return !task.completed && (!task.deadline || !this.isOverdue(task.deadline));
                    case 'overdue':
                        return !task.completed && task.deadline && this.isOverdue(task.deadline);
                    default:
                        return true;
                }
            });
        }
        this.displayFilteredTasks(filteredTasks);
        this.updateSearchResultsCount(filteredTasks.length, tasks.length);        
        // console.log(`Applied filters: ${filteredTasks.length}/${tasks.length} tasks shown`);
    } catch (error) {
        console.error('Error in applyFiltersAndSearch:', error);
    }
    }
    displayFilteredTasks(filteredTasks) {
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        container.innerHTML = '';
        filteredTasks.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            if (aPriority !== bPriority) return bPriority - aPriority;
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return 0;
        });
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task, this.searchTerm);
            container.appendChild(taskElement);
        });
        if (filteredTasks.length === 0) {
            this.showEmptySearchState(container);
        }
    }
    updateSearchResultsCount(filteredCount = null, totalCount = null) {
        const countElement = document.getElementById('search-results-count');
        if (!countElement) return;
    
        if (filteredCount !== null && totalCount !== null) {
            const hasActiveFilters = this.searchTerm || Object.values(this.activeFilters).some(f => f !== null);
            
            if (hasActiveFilters) {
                countElement.textContent = `Showing ${filteredCount} of ${totalCount} tasks`;
                countElement.style.display = 'block';
            } else {
                countElement.style.display = 'none';
            }
        } else {
            countElement.style.display = 'none';
        }
    }
    
    showEmptySearchState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state search-empty';
        if (this.searchTerm || Object.values(this.activeFilters).some(f => f !== null)) {
            emptyState.innerHTML = `
                <div class="empty-icon"><i class="bi bi-search"></i></div>
                <p>No tasks match your search criteria</p>
                <button class="btn-clear-filters" onclick="taskManager.clearAllFilters()">
                    Clear filters
                </button>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-icon"><i class="bi bi-pin-angle"></i></div>
                <p>No tasks yet. Create your first task!</p>
            `;
        }        
        container.appendChild(emptyState);
    }
    clearAllFilters() {
    console.log('Clearing all filters...');
    this.searchTerm = '';
    this.activeFilters = {
        priority: null,
        frequency: null,
        status: null
    };
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.value = '';
    }
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    this.displayTasks();
    this.updateSearchResultsCount();
    if (searchInput) {
        searchInput.focus();
    }
    // console.log('All filters cleared');
    }     
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('task-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            if (e.key === 'Escape' && document.activeElement?.id === 'task-search') {
                this.clearSearch();
            }
        });
    }
    restoreFocus() {
        setTimeout(() => {
            if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            } else {
                const taskInput = document.getElementById('taskInput');
                if (taskInput) {
                    taskInput.focus();
                }
            }
        }, 100); 
    }
    validateInput(inputElement, errorMessage = 'Please enter a valid value') {
        const value = inputElement.value.trim();
        if (!value || value === '') {
            this.shakeInput(inputElement);
            this.emitToastNotification(errorMessage, 'error', 2000);
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
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const tasksContainer = document.getElementById('tasksContainer');
        
        console.log('Setting up event listeners...');
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.handleAddTask());
        }
        
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleAddTask();
            });
        }
        if (tasksContainer) {
            tasksContainer.addEventListener('click', (e) => {
                const target = e.target;
                const progressCircle = target.closest('.progress-circle');
                if (progressCircle) {
                    e.preventDefault();
                    e.stopPropagation();
                    const taskId = parseInt(progressCircle.getAttribute('data-task-id'));
                    console.log('Progress circle clicked for task:', taskId);
                    if (taskId && !isNaN(taskId)) {
                        this.toggleTask(taskId);
                    }
                    return;
                }
                const button = target.closest('button');
                if (button) {
                    e.preventDefault();
                    e.stopPropagation();                    
                    const taskId = parseInt(button.getAttribute('data-task-id'));                    
                    if (button.classList.contains('edit-task') || target.classList.contains('bi-pencil')) {
                        console.log('Edit button clicked for task:', taskId);
                        this.editTask(taskId);
                    } else if (button.classList.contains('delete-task') || target.classList.contains('bi-trash')) {
                        console.log('Delete button clicked for task:', taskId);
                        this.deleteTask(taskId);
                    }
                }
            });
            console.log('✓ Task container listeners attached');
        }
    }
    handleAddTask() {
        const taskInput = document.getElementById('taskInput');
        if (!this.validateInput(taskInput, 'Please enter a task description')) {
            return;
        }
        const taskText = taskInput.value.trim();
        this.showFrequencyModal(taskText);
        taskInput.value = '';
    }
    showFrequencyModal(taskText) {
        const modal = document.createElement('div');
        modal.className = 'task-frequency-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Task Settings</h3>
                <div class="task-text-preview">
                    <strong>Task:</strong> ${taskText}
                </div>                
                <div class="frequency-section">
                    <label>Frequency:</label>
                    <select id="task-frequency">
                        <option value="once">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>                
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
                <div class="priority-section">
                    <label for="task-priority">Priority:</label>
                    <select id="task-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>                
                <div class="modal-actions">
                    <button data-action="create">Create Task</button>
                    <button data-action="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.tempTaskData = { text: taskText };
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'create') {
                    this.createTaskFromModal();
                } else if (action === 'cancel') {
                    this.cancelTaskCreation(taskText);
                }
            });
        });
    }
    createTaskFromModal() {
        if (!this.tempTaskData) return;
        const frequency = document.getElementById('task-frequency').value;
        const deadlineInput = document.getElementById('task-deadline');
        const alertSelect = document.getElementById('alert-time');
        const prioritySelect = document.getElementById('task-priority');
        const taskData = {
            id: Date.now(),
            text: this.tempTaskData.text,
            type: 'task',
            timestamp: new Date().toISOString(),
            completed: false,
            frequency: frequency,
            priority: prioritySelect.value,
            dueDate: new Date().toISOString().split('T')[0]
        };
        if (frequency !== 'once') {
            taskData.nextReset = this.calculateNextReset(frequency);
        }
        if (deadlineInput.value) {
            taskData.deadline = new Date(deadlineInput.value).toISOString();
            const alertMinutes = parseInt(alertSelect.value) || 0;
            if (alertMinutes > 0) {
                const alertTime = new Date(deadlineInput.value);
                alertTime.setMinutes(alertTime.getMinutes() - alertMinutes);
                taskData.alertTime = alertTime.toISOString();
                taskData.alertMinutes = alertMinutes;
            }
        }
        this.saveTask(taskData);
        closeModal();
        this.tempTaskData = null;
        this.restoreFocus(); 
    }
    cancelTaskCreation(taskText) {
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.value = taskText;
        }
        closeModal();
        this.tempTaskData = null;
        this.restoreFocus(); 
    }
        calculateNextReset(frequency) {
        const now = new Date(); 
        switch(frequency) {
            case 'daily': 
                const nextDay = new Date(now);
                nextDay.setDate(nextDay.getDate() + 1);
                nextDay.setHours(0, 0, 0, 0);
                return nextDay;
            case 'weekly': 
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);
                nextWeek.setHours(0, 0, 0, 0);
                return nextWeek;                
            case 'biweekly': 
                const nextBiweek = new Date(now);
                nextBiweek.setDate(nextBiweek.getDate() + 14);
                nextBiweek.setHours(0, 0, 0, 0);
                return nextBiweek;                
            case 'monthly': 
                const nextMonth = new Date(now);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                nextMonth.setHours(0, 0, 0, 0);
                return nextMonth;
                
            default: 
                return null;
        }
    }
    saveTask(taskData) {
        try {
            if (taskData.frequency !== 'once' && !taskData.nextReset) {
                taskData.nextReset = this.calculateNextReset(taskData.frequency);
            }
            
            const tasks = this.getTasks();
            tasks.push(taskData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            
            console.log('Task saved with reset time:', taskData.nextReset);
            
            this.displayTasks();
            this.updateProgress();
            this.emitTaskUpdate('task-added', taskData);
            this.emitToastNotification(`Task "${taskData.text}" created successfully!`, 'success');
        } catch (error) {
            console.error('Could not save task to localStorage:', error);
            this.emitToastNotification('Failed to save task', 'error');
        }
    }
    getTasks() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return [];
            }
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Could not load tasks from localStorage:', error);
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
        }
    }
    loadTasks() {
        const tasks = this.getTasks();
        this.displayTasks();
        this.updateProgress();
    }
    displayTasks(filter = null) {
        if (this.searchTerm || Object.values(this.activeFilters).some(f => f !== null)) {
            this.applyFiltersAndSearch();
            return;
        }
        const tasks = this.getTasks();
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        container.innerHTML = '';
        if (!Array.isArray(tasks)) {
            console.error('Tasks is not an array:', tasks);
            this.showEmptyState(container);
            return;
        }
        let filteredTasks = filter ? tasks.filter(filter) : tasks;
        if (!Array.isArray(filteredTasks)) {
            console.error('Filtered tasks is not an array:', filteredTasks);
            filteredTasks = [];
        }
        filteredTasks.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            if (aPriority !== bPriority) return bPriority - aPriority;
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return 0;
        });
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
        if (filteredTasks.length === 0) {
            this.showEmptyState(container);
        }
    }
    createTaskElement(task, searchTerm = '') {
        const div = document.createElement('div');
        div.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        const isOverdue = task.deadline && this.isOverdue(task.deadline);
        if (isOverdue) div.classList.add('overdue');

        let displayText = task.text;
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayText = displayText.replace(regex, '<span class="search-highlight">$1</span>');
        }

        div.innerHTML = `
            <div class="task-content">
                <!-- Hidden checkbox for form compatibility -->
                <input type="checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    data-task-id="${task.id}" 
                    class="task-checkbox"
                    id="checkbox-${task.id}">

                <!-- Progress Circle replacing the checkbox -->
                <div class="progress-circle ${task.completed ? 'completed' : ''}" 
                     data-task-id="${task.id}">
                    <svg class="progress-svg" width="30" height="30">
                        <circle class="progress-bg" cx="15" cy="15" r="12"></circle>
                        <circle class="progress-fill" cx="15" cy="15" r="12"></circle>
                    </svg>
                    <div class="checkmark">✓</div>
                </div>

                <div class="task-text ${task.completed ? 'completed-text' : ''}">
                    ${task.completed ? 
                        `<del>${detectAndCreateLinks(displayText)}</del>` : 
                        detectAndCreateLinks(displayText)
                    }
                </div>
                <div class="task-meta">
                    <span class="task-frequency">${task.frequency}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.deadline ? `
                        <div class="deadline-info ${isOverdue ? 'overdue' : ''}">
                            📅 ${this.formatDeadline(task.deadline)}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="task-timestamp">${formatTimestamp(task.timestamp)}</div>
            <div class="task-actions">
                <button class="edit-task" data-task-id="${task.id}" title="Edit" type="button">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-task" data-task-id="${task.id}" title="Delete" type="button">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
                    
        // Add click event to progress circle
        const progressCircle = div.querySelector('.progress-circle');
        if (progressCircle) {
            progressCircle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.toggleTask(task.id);
            });
        }

        return div;
    }
    toggleTask(taskId) {    
    if (!taskId || isNaN(taskId)) {
        console.error('Invalid task ID provided to toggleTask:', taskId);
        return;
    }try {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);        
        if (taskIndex !== -1) {
            const oldStatus = tasks[taskIndex].completed;
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            const newStatus = tasks[taskIndex].completed;            
            console.log(`✓ Task ${taskId} toggled: ${oldStatus} → ${newStatus}`);
            const statusText = newStatus ? 'completed' : 'uncompleted';
            this.emitToastNotification(`Task ${statusText}!`, newStatus ? 'success' : 'info', 2000);
            if (!tasks[taskIndex].completed) {
                delete tasks[taskIndex].alerted;
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            const progressCircle = document.querySelector(`[data-task-id="${taskId}"].progress-circle`);
            const taskItem = document.querySelector(`[data-task-id="${taskId}"]`).closest('.task-item');
            const checkbox = document.querySelector(`input[data-task-id="${taskId}"]`);
            
            if (progressCircle) {
                if (newStatus) {
                    progressCircle.classList.add('completed');
                    if (taskItem) taskItem.classList.add('completed');
                } else {
                    progressCircle.classList.remove('completed');
                    if (taskItem) taskItem.classList.remove('completed');
                }
            }
            if (checkbox) checkbox.checked = newStatus;
            
            setTimeout(() => {
                this.displayTasks();
                this.updateProgress();
            }, 100);
            
            this.emitTaskUpdate('task-toggled', tasks[taskIndex]);
            
        } else {
            console.error('Task not found with ID:', taskId);
        }
        
        document.dispatchEvent(new CustomEvent('taskUpdate', {
            detail: { type: 'task-completed', task: tasks[taskIndex] }
        }));
    } catch (error) {
        console.error('Error in toggleTask:', error);
    }
}
    deleteTask(taskId) {
        console.log('deleteTask called with ID:', taskId);
        if (!taskId || isNaN(taskId)) {
            console.error('Invalid task ID:', taskId);
            return;
        }
        if (!confirm('Are you sure you want to delete this task?')) {
            this.restoreFocus(); 
            return;
        }
        try {
            let tasks = this.getTasks();
            console.log('Tasks before delete:', tasks.length);
            const taskToDelete = tasks.find(task => task.id === taskId);
            console.log('Task to delete:', taskToDelete);
            if (!taskToDelete) {
                console.error('Task not found with ID:', taskId);
                this.restoreFocus();
                return;
            }
            tasks = tasks.filter(task => task.id !== taskId);
            console.log('Tasks after delete:', tasks.length);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            this.displayTasks();
            this.updateProgress();
            this.emitTaskUpdate('task-deleted', taskToDelete);
            this.emitToastNotification(`Task "${taskToDelete.text}" deleted`, 'info');
            console.log('Task deleted successfully');
            document.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { type: 'task-deleted', task: deletedTask }
            }));
            console.log('Task deleted successfully');
            this.restoreFocus(); 
        } catch (error) {
            console.error('Could not delete task:', error);
            this.restoreFocus();
        }
    }
    editTask(taskId) {
        console.log('editTask called with ID:', taskId);
        if (!taskId || isNaN(taskId)) {
            console.error('Invalid task ID:', taskId);
            return;
        }
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found with ID:', taskId);
            this.restoreFocus();
            return;
        }
        console.log('Editing task:', task);
        this.editingTask = task;
        this.showEditModal(task);
    }
    showEditModal(task) {
        closeModal();
        const modal = document.createElement('div');
        modal.className = 'task-edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Task</h3>
                <textarea id="editTaskText" rows="3">${task.text}</textarea>
                <div class="edit-sections">
                    <div class="frequency-section">
                        <label>Frequency:</label>
                        <select id="editFrequency">
                            <option value="once" ${task.frequency === 'once' ? 'selected' : ''}>One-time</option>
                            <option value="daily" ${task.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${task.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="biweekly" ${task.frequency === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
                            <option value="monthly" ${task.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>                    
                    <div class="priority-section">
                        <label>Priority:</label>
                        <select id="editPriority">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                        </select>
                    </div>                    
                    <div class="deadline-section">
                        <label for="edit-deadline">Deadline:</label>
                        <input type="datetime-local" id="edit-deadline" 
                            value="${task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''}">
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
                    this.saveEditedTask();
                } else if (action === 'cancel') {
                    closeModal();
                    this.editingTask = null;
                    this.restoreFocus();
                }
            });
        });
    }
    // Improved Task Modal Structure (JavaScript)
// showEditModal(task) {
//     closeModal();
//     const modal = document.createElement('div');
//     modal.className = 'task-modal-overlay';
//     modal.innerHTML = `
//         <div class="task-modal-content">
//             <div class="task-modal-header">
//                 <h3 class="task-modal-h3">Edit Task</h3>
//                 <button id="closeTaskModal" class="close-task-btn" type="button">&times;</button>
//             </div>
//             <div class="task-modal-body">
//                 <div id="taskValidationErrors" class="validation-errors" style="display: none;"></div>
//                 <form id="taskForm" class="task-form">
//                     <div class="task-form-group">
//                         <label for="editTaskText">Task Description</label>
//                         <textarea id="editTaskText" placeholder="Enter task description..." class="task-form-textarea" rows="3" required>${task.text}</textarea>
//                     </div>
                    
//                     <div class="task-form-row">
//                         <div class="task-form-group">
//                             <label for="editFrequency">Frequency</label>
//                             <select id="editFrequency" class="task-form-select">
//                                 <option value="once" ${task.frequency === 'once' ? 'selected' : ''}>One-time</option>
//                                 <option value="daily" ${task.frequency === 'daily' ? 'selected' : ''}>Daily</option>
//                                 <option value="weekly" ${task.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
//                                 <option value="biweekly" ${task.frequency === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
//                                 <option value="monthly" ${task.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
//                             </select>
//                         </div>
//                         <div class="task-form-group">
//                             <label for="editPriority">Priority</label>
//                             <select id="editPriority" class="task-form-select">
//                                 <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
//                                 <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
//                                 <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
//                                 <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
//                             </select>
//                         </div>
//                     </div>
                    
//                     <div class="task-form-group">
//                         <label for="editDeadline">Deadline</label>
//                         <input type="datetime-local" id="editDeadline" class="task-form-input" 
//                             value="${task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''}">
//                     </div>
                    
//                     <div class="task-form-options">
//                         <div class="task-toggle-label" data-toggle="isHighPriority">
//                             <span class="task-toggle-text">
//                                 <i class="bi bi-exclamation-triangle"></i>
//                                 Mark as high priority
//                             </span>
//                             <div>
//                                 <input type="checkbox" id="isHighPriority" class="task-toggle-input" ${task.priority === 'high' || task.priority === 'urgent' ? 'checked' : ''}>
//                                 <div class="task-toggle-switch"></div>
//                             </div>
//                         </div>
//                         <div class="task-toggle-label" data-toggle="hasReminder">
//                             <span class="task-toggle-text">
//                                 <i class="bi bi-bell"></i>
//                                 Set reminder
//                             </span>
//                             <div>
//                                 <input type="checkbox" id="hasTaskReminder" class="task-toggle-input" ${task.hasReminder ? 'checked' : ''}>
//                                 <div class="task-toggle-switch"></div>
//                             </div>
//                         </div>
//                         <div class="task-toggle-label" data-toggle="isRecurring">
//                             <span class="task-toggle-text">
//                                 <i class="bi bi-arrow-repeat"></i>
//                                 Recurring task
//                             </span>
//                             <div>
//                                 <input type="checkbox" id="isTaskRecurring" class="task-toggle-input" ${task.frequency !== 'once' ? 'checked' : ''}>
//                                 <div class="task-toggle-switch"></div>
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div class="task-form-actions">
//                         <button type="button" id="saveTask" class="task-btn btn-primary">
//                             <i class="bi bi-check-lg"></i>
//                             Save Changes
//                         </button>
//                         <button type="button" id="deleteTask" class="task-btn btn-danger" ${!task.id ? 'style="display: none;"' : ''}>
//                             <i class="bi bi-trash"></i>
//                             Delete Task
//                         </button>
//                         <button type="button" id="cancelTask" class="task-btn btn-secondary">
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     `;
    
//     document.body.appendChild(modal);
    
//     // Add show class for animation
//     setTimeout(() => modal.classList.add('show'), 10);
    
//     // Event listeners
//     const closeBtn = modal.querySelector('#closeTaskModal');
//     const saveBtn = modal.querySelector('#saveTask');
//     const deleteBtn = modal.querySelector('#deleteTask');
//     const cancelBtn = modal.querySelector('#cancelTask');
    
//     closeBtn.addEventListener('click', () => this.closeTaskModal(modal));
//     saveBtn.addEventListener('click', () => this.saveEditedTask(modal));
//     cancelBtn.addEventListener('click', () => this.closeTaskModal(modal));
    
//     if (deleteBtn.style.display !== 'none') {
//         deleteBtn.addEventListener('click', () => this.deleteTask(task, modal));
//     }
    
//     // Click outside to close
//     modal.addEventListener('click', (e) => {
//         if (e.target === modal) {
//             this.closeTaskModal(modal);
//         }
//     });
    
//     // Focus management
//     modal.querySelector('#editTaskText').focus();
// }

closeTaskModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.editingTask = null;
        this.restoreFocus();
    }, 300);
}

// Helper methods you'll need to implement
saveEditedTask(modal) {
    const taskText = modal.querySelector('#editTaskText').value.trim();
    const frequency = modal.querySelector('#editFrequency').value;
    const priority = modal.querySelector('#editPriority').value;
    const deadline = modal.querySelector('#editDeadline').value;
    const hasReminder = modal.querySelector('#hasTaskReminder').checked;
    const isRecurring = modal.querySelector('#isTaskRecurring').checked;
    
    // Add validation
    if (!taskText) {
        this.showValidationError(modal, 'Task description is required');
        return;
    }
    
    // Your existing save logic here
    console.log('Saving task:', { taskText, frequency, priority, deadline, hasReminder, isRecurring });
    
    this.closeTaskModal(modal);
}

showValidationError(modal, message) {
    const errorDiv = modal.querySelector('#taskValidationErrors');
    errorDiv.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// deleteTask(task, modal) {
//     if (confirm('Are you sure you want to delete this task?')) {
//         // Your delete logic here
//         console.log('Deleting task:', task);
//         this.closeTaskModal(modal);
//     }
// }
// Replace your existing deleteTask method with this fixed version
deleteTask(taskId) {
    console.log('deleteTask called with ID:', taskId);
    if (!taskId || isNaN(taskId)) {
        console.error('Invalid task ID:', taskId);
        return;
    }
    if (!confirm('Are you sure you want to delete this task?')) {
        this.restoreFocus(); 
        return;
    }
    try {
        let tasks = this.getTasks();
        console.log('Tasks before delete:', tasks.length);
        const taskToDelete = tasks.find(task => task.id === taskId);
        console.log('Task to delete:', taskToDelete);
        if (!taskToDelete) {
            console.error('Task not found with ID:', taskId);
            this.restoreFocus();
            return;
        }
        tasks = tasks.filter(task => task.id !== taskId);
        console.log('Tasks after delete:', tasks.length);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
        this.displayTasks();
        this.updateProgress();
        this.emitTaskUpdate('task-deleted', taskToDelete);
        this.emitToastNotification(`Task "${taskToDelete.text}" deleted`, 'info');
        console.log('Task deleted successfully');
        
        // Dispatch the event with the correct variable name
        document.dispatchEvent(new CustomEvent('taskUpdate', {
            detail: { type: 'task-deleted', task: taskToDelete }  // Fixed: was 'deletedTask'
        }));
        
        this.restoreFocus(); 
    } catch (error) {
        console.error('Could not delete task:', error);
        this.restoreFocus();
    }
}

// Remove or comment out the conflicting deleteTask method that expects (task, modal) parameters
// The one around line 950 that looks like this:
/*
deleteTask(task, modal) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Your delete logic here
        console.log('Deleting task:', task);
        this.closeTaskModal(modal);
    }
}
*/
    saveEditedTask() {
        const textArea = document.getElementById('editTaskText');
        const frequencySelect = document.getElementById('editFrequency');
        const prioritySelect = document.getElementById('editPriority');
        const deadlineInput = document.getElementById('edit-deadline');
        if (!this.validateInput(textArea, 'Please enter a task description')) {
            return;
        }
        const newText = textArea.value.trim();
        if (!this.editingTask) return;
        try {
            const tasks = this.getTasks();
            const taskIndex = tasks.findIndex(task => task.id === this.editingTask.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].text = newText;
                tasks[taskIndex].frequency = frequencySelect.value;
                tasks[taskIndex].priority = prioritySelect.value;
                if (frequencySelect.value !== 'once') {
                    tasks[taskIndex].nextReset = this.calculateNextReset(frequencySelect.value);
                } else {
                    delete tasks[taskIndex].nextReset;
                }
                if (deadlineInput.value) {
                    tasks[taskIndex].deadline = new Date(deadlineInput.value).toISOString();
                } else {
                    delete tasks[taskIndex].deadline;
                    delete tasks[taskIndex].alertTime;
                }
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
                this.displayTasks();
                this.updateProgress();
                this.emitTaskUpdate('task-updated', tasks[taskIndex]);
                this.emitToastNotification('Task updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Could not save edited task:', error);
            this.emitToastNotification('Failed to update task', 'error');
        }
        
        this.editingTask = null;
        closeModal();
        this.restoreFocus(); 
    }
    updateProgress() {
        const tasks = this.getTasks();
        const completedTasks = tasks.filter(task => task.completed);
        const overdueTasks = tasks.filter(task => 
            task.deadline && this.isOverdue(task.deadline) && !task.completed
        );
        const progressBar = document.querySelector('.task-progress-bar');
        const progressText = document.querySelector('.task-progress-text');
        if (progressBar && progressText) {
            const percentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completedTasks.length}/${tasks.length} tasks completed`;
        }
        this.updateTaskStats(tasks, completedTasks, overdueTasks);
    }
    updateTaskStats(tasks, completedTasks, overdueTasks) {
        const statElements = {
            total: document.querySelector('.stat-total-tasks'),
            completed: document.querySelector('.stat-completed-tasks'),
            remaining: document.querySelector('.stat-remaining-tasks'),
            overdue: document.querySelector('.stat-overdue-tasks')
        };
        if (statElements.total) statElements.total.textContent = tasks.length;
        if (statElements.completed) statElements.completed.textContent = completedTasks.length;
        if (statElements.remaining) statElements.remaining.textContent = tasks.length - completedTasks.length;
        if (statElements.overdue) statElements.overdue.textContent = overdueTasks.length;
    }
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
            <p>No tasks yet. Create your first task!</p>
        `;
        container.appendChild(emptyState);
    }
    emitTaskUpdate(eventType, taskData) {
        const event = new CustomEvent('taskUpdate', {
            detail: { type: eventType, task: taskData }
        });
        document.dispatchEvent(event);
    }
    emitToastNotification(message, type = 'success', duration = 3000) {
    const event = new CustomEvent('showToast', {
        detail: { message, type, duration }
    });
    document.dispatchEvent(event);
    }
    setupDeadlineAlerts() {
        setInterval(() => this.checkAlerts(), 60000); 
        this.checkAlerts(); 
    }
    checkAlerts() {
        try {
            const tasks = this.getTasks();
            const now = new Date();
            let hasUpdates = false;            
            tasks.forEach(task => {
                if (task.alertTime && !task.alerted && !task.completed) {
                    const alertTime = new Date(task.alertTime);                    
                    if (now >= alertTime) {
                        this.sendNotification(task);
                        task.alerted = true;
                        hasUpdates = true;
                    }
                }
            });            
            if (hasUpdates) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            }
        } catch (error) {
            console.error('Could not check alerts:', error);
        }
    }
    sendNotification(task) {
        this.emitToastNotification(
            `Task "${task.text}" is due soon!`, 
            'warning', 
            5000
        );
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Task Deadline Alert', {
                body: `Task "${task.text}" is due soon!`,
                icon: '/assets/icon.png'
            });
        }
    }
        setupProgressTracking() {
        setInterval(() => this.checkTaskResets(), 5 * 60 * 1000);
        this.checkTaskResets();
    }
        checkTaskResets() {
        try {
            const tasks = this.getTasks();
            const now = new Date();
            let updated = false;            
            console.log('Checking task resets at:', now.toISOString());            
            const updatedTasks = tasks.map(task => {
                if (task.nextReset && task.frequency !== 'once') {
                    const resetTime = new Date(task.nextReset);
                    if (now >= resetTime) {
                        console.log(`Resetting task: ${task.text} (was due: ${resetTime.toISOString()})`);
                        const wasCompleted = task.completed;
                        task.completed = false;
                        task.nextReset = this.calculateNextReset(task.frequency);
                        delete task.alerted;
                        if (wasCompleted) {
                            updated = true;
                        }
                        console.log(`Next reset scheduled for: ${task.nextReset.toISOString()}`);
                    }
                }
                return task;
            });
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTasks));
                this.displayTasks();
                this.updateProgress();
                console.log('Tasks reset and saved');
            }
        } catch (error) {
            console.error('Could not check task resets:', error);
        }
    }
    setupISTReset() {
        const checkMidnight = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
            if (istTime.getHours() === 0 && istTime.getMinutes() === 0) {
                console.log('IST Midnight detected, resetting daily tasks');
                this.resetDailyTasks();
            }
        };
        setInterval(checkMidnight, 60000);
        checkMidnight();
    }
    resetDailyTasks() {
        try {
            const tasks = this.getTasks();
            let updated = false;
            
            const updatedTasks = tasks.map(task => {
                if (task.frequency === 'daily' && task.completed) {
                    console.log(`Resetting daily task: ${task.text}`);
                    task.completed = false;
                    delete task.alerted;
                    task.nextReset = this.calculateNextReset('daily');
                    updated = true;
                }
                return task;
            });
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTasks));
                this.displayTasks();
                this.updateProgress();
                console.log('Daily tasks reset successfully');
            }
        } catch (error) {
            console.error('Could not reset daily tasks:', error);
        }
    }
        debugReset() {
        console.log('Manual reset triggered');
        this.checkTaskResets();
        this.resetDailyTasks();
    }
    getTaskResetStatus() {
        const tasks = this.getTasks();
        const now = new Date();
        return tasks.map(task => ({
            id: task.id,
            text: task.text,
            frequency: task.frequency,
            completed: task.completed,
            nextReset: task.nextReset,
            resetDue: task.nextReset ? new Date(task.nextReset) <= now : false,
            resetTime: task.nextReset ? new Date(task.nextReset).toLocaleString() : 'N/A'
        }));
    }
    getTaskStats() {
        const tasks = this.getTasks();
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            overdue: tasks.filter(t => t.deadline && this.isOverdue(t.deadline) && !t.completed).length
        };
    }
    searchTasks(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.applyFiltersAndSearch();
    }
    getFilteredTasks() {
        const tasks = this.getTasks();
        let filteredTasks = tasks;
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchTerm)
            );
        }
        Object.entries(this.activeFilters).forEach(([filterType, filterValue]) => {
            if (filterValue) {
                filteredTasks = filteredTasks.filter(task => {
                    switch(filterType) {
                        case 'priority':
                            return task.priority === filterValue;
                        case 'frequency':
                            return task.frequency === filterValue;
                        case 'status':
                            switch(filterValue) {
                                case 'completed':
                                    return task.completed;
                                case 'pending':
                                    return !task.completed && (!task.deadline || !this.isOverdue(task.deadline));
                                case 'overdue':
                                    return !task.completed && task.deadline && this.isOverdue(task.deadline);
                                default:
                                    return true;
                            }
                        default:
                            return true;
                    }
                });
            }
        });
        return filteredTasks;
    }
}
export default TaskManager;