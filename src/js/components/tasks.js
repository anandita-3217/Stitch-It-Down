// tasks.js - Task-specific functionality
import { detectAndCreateLinks, formatTimestamp, closeModal } from '@components/utils.js';

class TaskManager {
    constructor() {
        this.STORAGE_KEY = 'stitchTasks';
        this.editingTask = null;
        this.tempTaskData = null;
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
}

    setupEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.handleAddTask());
        }
        
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleAddTask();
            });
        }
    }

    handleAddTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        
        if (!taskText) return;
        
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
    }

    cancelTaskCreation(taskText) {
        // Return text to input field
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.value = taskText;
        }
        closeModal();
        this.tempTaskData = null;
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
        } catch (error) {
            console.error('Could not save task to localStorage:', error);
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
    
    displayTasks(filter = null) {
    const tasks = this.getTasks();
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Ensure tasks is always an array
    if (!Array.isArray(tasks)) {
        console.error('Tasks is not an array:', tasks);
        this.showEmptyState(container);
        return;
    }
    
    let filteredTasks = filter ? tasks.filter(filter) : tasks;
    
    // Double-check that filteredTasks is an array
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
        
        // If same priority, sort by deadline
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

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        const isOverdue = task.deadline && this.isOverdue(task.deadline);
        if (isOverdue) div.classList.add('overdue');
        
        div.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       data-task-id="${task.id}" class="task-checkbox">
                <div class="task-text ${task.completed ? 'completed-text' : ''}">
                    ${task.completed ? 
                        `<del>${detectAndCreateLinks(task.text)}</del>` : 
                        detectAndCreateLinks(task.text)
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
                <button class="edit-task" data-task-id="${task.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-task" data-task-id="${task.id}" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        this.attachTaskEventListeners(div);
        return div;
    }

    attachTaskEventListeners(taskElement) {
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');
        
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.toggleTask(taskId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.editTask(taskId);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.deleteTask(taskId);
            });
        }
    }

    toggleTask(taskId) {
        try {
            const tasks = this.getTasks();
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                
                // Reset alert flag if task is being uncompleted
                if (!tasks[taskIndex].completed) {
                    delete tasks[taskIndex].alerted;
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
                this.displayTasks();
                this.updateProgress();
                this.emitTaskUpdate('task-toggled', tasks[taskIndex]);
            }
        } catch (error) {
            console.error('Could not toggle task:', error);
        }
    }

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {
            let tasks = this.getTasks();
            const taskToDelete = tasks.find(task => task.id === taskId);
            tasks = tasks.filter(task => task.id !== taskId);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            this.displayTasks();
            this.updateProgress();
            this.emitTaskUpdate('task-deleted', taskToDelete);
        } catch (error) {
            console.error('Could not delete task:', error);
        }
    }

    editTask(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTask = task;
        this.showEditModal(task);
    }

    showEditModal(task) {
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
                    <button data-action="save">Save Changes</button>
                    <button data-action="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'save') {
                    this.saveEditedTask();
                } else if (action === 'cancel') {
                    closeModal();
                }
            });
        });
    }

    saveEditedTask() {
        const textArea = document.getElementById('editTaskText');
        const frequencySelect = document.getElementById('editFrequency');
        const prioritySelect = document.getElementById('editPriority');
        const deadlineInput = document.getElementById('edit-deadline');
        
        const newText = textArea.value.trim();
        if (!newText || !this.editingTask) return;
        
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
            }
        } catch (error) {
            console.error('Could not save edited task:', error);
        }
        
        this.editingTask = null;
        closeModal();
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

    getTasksByPriority(priority) {
        return this.getTasks().filter(task => task.priority === priority);
    }

    getTasksByFrequency(frequency) {
        return this.getTasks().filter(task => task.frequency === frequency);
    }
}

// Export for use in other modules
export default TaskManager;