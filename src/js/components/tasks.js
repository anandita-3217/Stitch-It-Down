// tasks.js - Enhanced Task Manager with focus restoration and input validation
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';

class TaskManager {
    constructor() {
        this.STORAGE_KEY = 'stitchTasks';
        this.editingTask = null;
        this.tempTaskData = null;
        this.lastFocusedElement = null; // Track last focused element
        this.debug = true;
        this.searchTerm = ''; // Add search term tracking
        this.activeFilters = {
            priority: null,
            frequency: null,
            status: null // 'completed', 'pending', 'overdue'
        };
        this.init();
    }
    init() {
        // Clear any corrupted data on initialization
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
        this.setupFocusTracking(); // Add focus tracking
        this.setupSearchFunctionality(); 
    }
    // New method to track focus on input elements
    // setupFocusTracking() {
    //     const trackableFocusElements = ['taskInput', 'task-search'];
        
    //     trackableFocusElements.forEach(id => {
    //         const element = document.getElementById(id);
    //         if (element) {
    //             element.addEventListener('focus', () => {
    //                 this.lastFocusedElement = element;
    //             });
    //         }
    //     });
    // }

        // Enhanced focus tracking to include search
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
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // New method to set up search functionality
    setupSearchFunctionality() {
        const searchInput = document.getElementById('task-search');
        const clearSearchBtn = document.getElementById('clear-search');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        if (searchInput) {
            // Real-time search as user types
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim().toLowerCase();
                this.applyFiltersAndSearch();
            });

            // Clear search on Escape key
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }

        // Clear search button
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                const filterValue = e.target.dataset.value;
                this.toggleFilter(filterType, filterValue, e.target);
            });
        });
    }

    // Method to clear search
    clearSearch() {
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchTerm = '';
        this.applyFiltersAndSearch();
        
        // Update search results count
        this.updateSearchResultsCount();
    }

    // Method to toggle filters
    toggleFilter(filterType, filterValue, buttonElement) {
        // Toggle the filter
        if (this.activeFilters[filterType] === filterValue) {
            this.activeFilters[filterType] = null;
            buttonElement.classList.remove('active');
        } else {
            // Remove active class from other buttons of same type
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.activeFilters[filterType] = filterValue;
            buttonElement.classList.add('active');
        }
        
        this.applyFiltersAndSearch();
    }

    // Main method to apply search and filters
    applyFiltersAndSearch() {
        const tasks = this.getTasks();
        let filteredTasks = tasks;

        // Apply search filter
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply priority filter
        if (this.activeFilters.priority) {
            filteredTasks = filteredTasks.filter(task => 
                task.priority === this.activeFilters.priority
            );
        }

        // Apply frequency filter
        if (this.activeFilters.frequency) {
            filteredTasks = filteredTasks.filter(task => 
                task.frequency === this.activeFilters.frequency
            );
        }

        // Apply status filter
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

        // Display filtered tasks
        this.displayFilteredTasks(filteredTasks);
        this.updateSearchResultsCount(filteredTasks.length, tasks.length);
    }

    // Method to display filtered tasks
    displayFilteredTasks(filteredTasks) {
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Sort by priority and due date
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
        
        // Highlight search terms in results
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task, this.searchTerm);
            container.appendChild(taskElement);
        });
        
        if (filteredTasks.length === 0) {
            this.showEmptySearchState(container);
        }
    }

    // Method to update search results count
    updateSearchResultsCount(filteredCount = null, totalCount = null) {
        const countElement = document.getElementById('search-results-count');
        if (!countElement) return;

        if (filteredCount !== null && totalCount !== null) {
            if (this.searchTerm || Object.values(this.activeFilters).some(f => f !== null)) {
                countElement.textContent = `${filteredCount} of ${totalCount} tasks`;
                countElement.style.display = 'block';
            } else {
                countElement.style.display = 'none';
            }
        } else {
            countElement.style.display = 'none';
        }
    }
    // Enhanced empty state for search
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

    // Method to clear all filters
    clearAllFilters() {
        this.searchTerm = '';
        this.activeFilters = {
            priority: null,
            frequency: null,
            status: null
        };
        
        // Clear search input
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Remove active classes from filter buttons
        document.querySelectorAll('.filter-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Display all tasks
        this.displayTasks();
        this.updateSearchResultsCount();
    }

    // Add search keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('task-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Escape to clear search when search input is focused
            if (e.key === 'Escape' && document.activeElement?.id === 'task-search') {
                this.clearSearch();
            }
        });
    }

    // Method to restore focus to the last focused input
    restoreFocus() {
        setTimeout(() => {
            if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            } else {
                // Default to task input if no last focused element
                const taskInput = document.getElementById('taskInput');
                if (taskInput) {
                    taskInput.focus();
                }
            }
        }, 100); // Small delay to ensure modal is fully closed
    }

    // Enhanced input validation with shake animation
    validateInput(inputElement, errorMessage = 'Please enter a valid value') {
        const value = inputElement.value.trim();
        
        if (!value || value === '') {
            this.shakeInput(inputElement);
            this.emitToastNotification(errorMessage, 'error', 2000);
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

//     setupEventListeners() {
//     const addTaskBtn = document.getElementById('addTaskBtn');
//     const taskInput = document.getElementById('taskInput');
//     const tasksContainer = document.getElementById('tasksContainer');
    
//     console.log('Setting up event listeners...');
    
//     if (addTaskBtn) {
//         addTaskBtn.addEventListener('click', () => this.handleAddTask());
//     }
    
//     if (taskInput) {
//         taskInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.handleAddTask();
//         });
//     }

//     if (tasksContainer) {
//         // FIXED: Separate click handler specifically for checkboxes
//         tasksContainer.addEventListener('click', (e) => {
//             const target = e.target;
            
//             // Handle checkbox clicks FIRST
//             if (target.type === 'checkbox' && target.classList.contains('task-checkbox')) {
//                 console.log('Checkbox clicked:', target);
//                 const taskId = parseInt(target.getAttribute('data-task-id'));
//                 console.log('Toggling task ID:', taskId);
                
//                 if (taskId && !isNaN(taskId)) {
//                     // Small delay to let checkbox state update
//                     setTimeout(() => {
//                         this.toggleTask(taskId);
//                     }, 10);
//                 }
//                 return; // Exit early for checkbox clicks
//             }
            
//             // Handle button clicks (edit/delete)
//             const button = target.closest('button');
//             if (button) {
//                 e.preventDefault();
//                 e.stopPropagation();
                
//                 const taskId = parseInt(button.getAttribute('data-task-id'));
                
//                 if (button.classList.contains('edit-task') || target.classList.contains('bi-pencil')) {
//                     console.log('Edit button clicked for task:', taskId);
//                     this.editTask(taskId);
//                 } else if (button.classList.contains('delete-task') || target.classList.contains('bi-trash')) {
//                     console.log('Delete button clicked for task:', taskId);
//                     this.deleteTask(taskId);
//                 }
//             }
//         });

//         // BACKUP: Also listen for change events (in case click doesn't work)
//         tasksContainer.addEventListener('change', (e) => {
//             console.log('Change event detected:', e.target);
            
//             if (e.target.type === 'checkbox' && e.target.classList.contains('task-checkbox')) {
//                 const taskId = parseInt(e.target.getAttribute('data-task-id'));
//                 console.log('Change event - toggling task ID:', taskId, 'Checked:', e.target.checked);
                
//                 if (taskId && !isNaN(taskId)) {
//                     this.toggleTask(taskId);
//                 }
//             }
//         });

//         console.log('✓ Task container listeners attached');
//     }
// }
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
                
                if (target.type === 'checkbox' && target.classList.contains('task-checkbox')) {
                    console.log('Checkbox clicked:', target);
                    const taskId = parseInt(target.getAttribute('data-task-id'));
                    console.log('Toggling task ID:', taskId);
                    
                    if (taskId && !isNaN(taskId)) {
                        setTimeout(() => {
                            this.toggleTask(taskId);
                        }, 10);
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

            tasksContainer.addEventListener('change', (e) => {
                console.log('Change event detected:', e.target);
                
                if (e.target.type === 'checkbox' && e.target.classList.contains('task-checkbox')) {
                    const taskId = parseInt(e.target.getAttribute('data-task-id'));
                    console.log('Change event - toggling task ID:', taskId, 'Checked:', e.target.checked);
                    
                    if (taskId && !isNaN(taskId)) {
                        this.toggleTask(taskId);
                    }
                }
            });

            console.log('✓ Task container listeners attached');
        }
    }


    handleAddTask() {
        const taskInput = document.getElementById('taskInput');
        
        // Validate input with shake animation
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
                    <input type="datetime-local" id="task-deadline" 
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
        
        // Add event listeners
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
        
        // Set next reset for recurring tasks
        if (frequency !== 'once') {
            taskData.nextReset = this.calculateNextReset(frequency);
        }
        
        // Handle deadline and alerts
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
        this.restoreFocus(); // Restore focus after creating task
    }

    cancelTaskCreation(taskText) {
        // Return text to input field
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.value = taskText;
        }
        closeModal();
        this.tempTaskData = null;
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

    saveTask(taskData) {
        try {
            const tasks = this.getTasks();
            tasks.push(taskData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
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
            // Ensure we always return an array
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Could not load tasks from localStorage:', error);
            // Clear corrupted data
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
        }
    }

    loadTasks() {
        const tasks = this.getTasks();
        this.displayTasks();
        this.updateProgress();
    }
    
    // displayTasks(filter = null) {
    //     const tasks = this.getTasks();
    //     const container = document.getElementById('tasksContainer');
    //     if (!container) return;
        
    //     container.innerHTML = '';
        
    //     // Ensure tasks is always an array
    //     if (!Array.isArray(tasks)) {
    //         console.error('Tasks is not an array:', tasks);
    //         this.showEmptyState(container);
    //         return;
    //     }
        
    //     let filteredTasks = filter ? tasks.filter(filter) : tasks;
        
    //     // Double-check that filteredTasks is an array
    //     if (!Array.isArray(filteredTasks)) {
    //         console.error('Filtered tasks is not an array:', filteredTasks);
    //         filteredTasks = [];
    //     }
        
    //     // Sort by priority and due date
    //     filteredTasks.sort((a, b) => {
    //         const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    //         const aPriority = priorityOrder[a.priority] || 2;
    //         const bPriority = priorityOrder[b.priority] || 2;
            
    //         if (aPriority !== bPriority) return bPriority - aPriority;
            
    //         // If same priority, sort by deadline
    //         if (a.deadline && b.deadline) {
    //             return new Date(a.deadline) - new Date(b.deadline);
    //         }
    //         return 0;
    //     });
        
    //     filteredTasks.forEach(task => {
    //         const taskElement = this.createTaskElement(task);
    //         container.appendChild(taskElement);
    //     });
        
    //     if (filteredTasks.length === 0) {
    //         this.showEmptyState(container);
    //     }
    // }

//     createTaskElement(task) {
//     const div = document.createElement('div');
//     div.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
//     const isOverdue = task.deadline && this.isOverdue(task.deadline);
//     if (isOverdue) div.classList.add('overdue');
    
//     div.innerHTML = `
//         <div class="task-content">
//             <input type="checkbox" 
//                    ${task.completed ? 'checked' : ''} 
//                    data-task-id="${task.id}" 
//                    class="task-checkbox"
//                    id="checkbox-${task.id}">
//             <div class="task-text ${task.completed ? 'completed-text' : ''}">
//                 ${task.completed ? 
//                     `<del>${detectAndCreateLinks(task.text)}</del>` : 
//                     detectAndCreateLinks(task.text)
//                 }
//             </div>
//             <div class="task-meta">
//                 <span class="task-frequency">${task.frequency}</span>
//                 <span class="task-priority priority-${task.priority}">${task.priority}</span>
//                 ${task.deadline ? `
//                     <div class="deadline-info ${isOverdue ? 'overdue' : ''}">
//                         📅 ${this.formatDeadline(task.deadline)}
//                     </div>
//                 ` : ''}
//             </div>
//         </div>
//         <div class="task-timestamp">${formatTimestamp(task.timestamp)}</div>
//         <div class="task-actions">
//             <button class="edit-task" data-task-id="${task.id}" title="Edit" type="button">
//                 <i class="bi bi-pencil"></i>
//             </button>
//             <button class="delete-task" data-task-id="${task.id}" title="Delete" type="button" id="delete-task">
//                 <i class="bi bi-trash"></i>
//             </button>
//         </div>
//     `;
    
//     // SOLUTION 2: Direct event binding (more reliable than delegation)
//     const checkbox = div.querySelector('.task-checkbox');
//     if (checkbox) {
//         checkbox.addEventListener('change', (e) => {
//             console.log('Direct checkbox event:', e.target.checked, 'Task ID:', task.id);
//             this.toggleTask(task.id);
//         });
        
//         // Also handle click events
//         checkbox.addEventListener('click', (e) => {
//             console.log('Direct checkbox click:', e.target.checked, 'Task ID:', task.id);
//             // Let the change event handle the toggle
//         });
//     }
    
//     return div;
// }

 // Override displayTasks to work with search
    displayTasks(filter = null) {
        // If search is active, use search results instead
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
        
        // Sort by priority and due date
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
        
        // Highlight search term in task text
        let displayText = task.text;
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayText = displayText.replace(regex, '<mark>$1</mark>');
        }
        
        div.innerHTML = `
            <div class="task-content">
                <input type="checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       data-task-id="${task.id}" 
                       class="task-checkbox"
                       id="checkbox-${task.id}">
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
        
        // Direct event binding for checkbox
        const checkbox = div.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(task.id);
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

    toggleTask(taskId) {
    // console.log('toggleTask called with ID:', taskId);
    
    if (!taskId || isNaN(taskId)) {
        console.error('Invalid task ID provided to toggleTask:', taskId);
        return;
    }
    
    try {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const oldStatus = tasks[taskIndex].completed;
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            const newStatus = tasks[taskIndex].completed;
            
            console.log(`✓ Task ${taskId} toggled: ${oldStatus} → ${newStatus}`);
            const statusText = newStatus ? 'completed' : 'uncompleted';
            this.emitToastNotification(`Task ${statusText}!`, newStatus ? 'success' : 'info', 2000);

            // Reset alert flag if task is being uncompleted
            if (!tasks[taskIndex].completed) {
                delete tasks[taskIndex].alerted;
            }
            
            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            
            // IMMEDIATE visual update for the specific checkbox
            const checkbox = document.querySelector(`input[data-task-id="${taskId}"]`);
            if (checkbox) {
                checkbox.checked = newStatus;
                console.log('✓ Checkbox visual state updated');
            }
            
            // Update display and progress
            this.displayTasks();
            this.updateProgress();
            this.emitTaskUpdate('task-toggled', tasks[taskIndex]);
            
        } else {
            console.error('Task not found with ID:', taskId);
        }
        document.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { type: 'task-completed', task: task }
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
            this.restoreFocus(); // Restore focus if user cancels
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
            this.restoreFocus(); // Restore focus after successful deletion
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
        // Close any existing modals first
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
                    this.restoreFocus(); // Restore focus when canceling edit
                }
            });
        });
    }

    saveEditedTask() {
        const textArea = document.getElementById('editTaskText');
        const frequencySelect = document.getElementById('editFrequency');
        const prioritySelect = document.getElementById('editPriority');
        const deadlineInput = document.getElementById('edit-deadline');
        
        // Validate the textarea input
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
                
                // Handle frequency changes
                if (frequencySelect.value !== 'once') {
                    tasks[taskIndex].nextReset = this.calculateNextReset(frequencySelect.value);
                } else {
                    delete tasks[taskIndex].nextReset;
                }
                
                // Handle deadline changes
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
        this.restoreFocus(); // Restore focus after saving
    }

    updateProgress() {
        const tasks = this.getTasks();
        const completedTasks = tasks.filter(task => task.completed);
        const overdueTasks = tasks.filter(task => 
            task.deadline && this.isOverdue(task.deadline) && !task.completed
        );
        
        // Update progress bar
        const progressBar = document.querySelector('.task-progress-bar');
        const progressText = document.querySelector('.task-progress-text');
        
        if (progressBar && progressText) {
            const percentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completedTasks.length}/${tasks.length} tasks completed`;
        }
        
        // Update stats
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
            <p>No tasks yet. Create your first task!</p>
        `;
        container.appendChild(emptyState);
    }

    // Event system for inter-module communication
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
    // Alert and notification system
    setupDeadlineAlerts() {
        setInterval(() => this.checkAlerts(), 60000); // Check every minute
        this.checkAlerts(); // Check immediately
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
        // Emit toast notification
        this.emitToastNotification(
            `Task "${task.text}" is due soon!`, 
            'warning', 
            5000
        );

        // Keep browser notification as fallback
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Task Deadline Alert', {
                body: `Task "${task.text}" is due soon!`,
                icon: '/assets/icon.png'
            });
        }
    }

    // Recurring task management
    setupProgressTracking() {
        setInterval(() => this.checkTaskResets(), 60000);
        this.checkTaskResets();
    }

    checkTaskResets() {
        try {
            const tasks = this.getTasks();
            const now = new Date();
            let updated = false;
            
            const updatedTasks = tasks.map(task => {
                if (task.nextReset && new Date(task.nextReset) <= now) {
                    task.completed = false;
                    task.nextReset = this.calculateNextReset(task.frequency);
                    delete task.alerted; // Reset alert flag
                    updated = true;
                }
                return task;
            });
            
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTasks));
                this.displayTasks();
                this.updateProgress();
            }
        } catch (error) {
            console.error('Could not check task resets:', error);
        }
    }

    // IST timezone reset for daily tasks
    setupISTReset() {
        const checkMidnight = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
            
            if (istTime.getHours() === 0 && istTime.getMinutes() === 1) {
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
                    task.completed = false;
                    delete task.alerted;
                    updated = true;
                }
                return task;
            });
            
            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTasks));
                this.displayTasks();
                this.updateProgress();
            }
        } catch (error) {
            console.error('Could not reset daily tasks:', error);
        }
    }
    // Public API methods
    getTaskStats() {
        const tasks = this.getTasks();
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            overdue: tasks.filter(t => t.deadline && this.isOverdue(t.deadline) && !t.completed).length
        };
    }
        // Public API method to search tasks
    searchTasks(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.applyFiltersAndSearch();
    }

    // Public API method to get filtered tasks
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

    getTasksByPriority(priority) {
        return this.getTasks().filter(task => task.priority === priority);
    }

    getTasksByFrequency(frequency) {
        return this.getTasks().filter(task => task.frequency === frequency);
    }
}

// Export for use in other modules
export default TaskManager;