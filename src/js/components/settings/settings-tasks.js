// settings-tasks.js - Task-specific settings logic
export const TASK_PRIORITIES = {
    low: { id: 'low', name: 'Low', value: 1, color: '#28a745' },
    medium: { id: 'medium', name: 'Medium', value: 2, color: '#ffc107' },
    high: { id: 'high', name: 'High', value: 3, color: '#dc3545' },
    urgent: { id: 'urgent', name: 'Urgent', value: 4, color: '#6f42c1' }
};

export const TASK_SORT_OPTIONS = {
    'due-date': { id: 'due-date', name: 'Due Date', sortFn: (a, b) => new Date(a.dueDate) - new Date(b.dueDate) },
    'priority': { id: 'priority', name: 'Priority', sortFn: (a, b) => (TASK_PRIORITIES[b.priority]?.value || 0) - (TASK_PRIORITIES[a.priority]?.value || 0) },
    'created': { id: 'created', name: 'Created Date', sortFn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    'alphabetical': { id: 'alphabetical', name: 'Alphabetical', sortFn: (a, b) => a.title.localeCompare(b.title) },
    'completion': { id: 'completion', name: 'Completion Status', sortFn: (a, b) => a.completed - b.completed }
};

export class TaskSettings {
    constructor() {
        this.currentSettings = {};
        this.eventCallbacks = new Map();
        this.tasks = [];
    }

    // Event system
    emit(event, data) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => callback(data));
        }
        console.log(`Task settings event: ${event}`, data);
    }

    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    // Settings management
    setCurrentSettings(settings) {
        this.currentSettings = settings;
        this.applyTaskSettings();
    }

    getCurrentSettings() {
        return this.currentSettings.tasks || {};
    }

    getDefaultSettings() {
        return {
            defaultPriority: 'medium',
            defaultSort: 'priority',
            reminderDays: 3,
            dailyGoal: 5,
            timeEstimation: true,
            completionTracking: true,
            autoArchive: false,
            archiveDays: 30,
            showCompletedTasks: true,
            enableSubtasks: true,
            enableTags: true,
            enableDueDates: true,
            enableTimeTracking: false,
            enableRecurringTasks: false
        };
    }

    // Task operations
    createTask(taskData) {
        const task = {
            id: this.generateTaskId(),
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            priority: taskData.priority || this.getCurrentSettings().defaultPriority || 'medium',
            dueDate: taskData.dueDate || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false,
            completedAt: null,
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || [],
            timeEstimate: taskData.timeEstimate || null,
            timeSpent: 0,
            recurring: taskData.recurring || null,
            project: taskData.project || null,
            notes: taskData.notes || ''
        };

        this.tasks.push(task);
        this.emit('taskCreated', task);
        return task;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            this.emit('error', `Task with ID ${taskId} not found`);
            return null;
        }

        const task = this.tasks[taskIndex];
        const updatedTask = {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.tasks[taskIndex] = updatedTask;
        this.emit('taskUpdated', updatedTask);
        return updatedTask;
    }

    completeTask(taskId) {
        const task = this.updateTask(taskId, {
            completed: true,
            completedAt: new Date().toISOString()
        });

        if (task) {
            this.emit('taskCompleted', task);
            this.checkDailyGoal();
        }
        return task;
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            this.emit('error', `Task with ID ${taskId} not found`);
            return false;
        }

        const task = this.tasks.splice(taskIndex, 1)[0];
        this.emit('taskDeleted', task);
        return true;
    }

    // Task filtering and sorting
    getTasksByFilter(filter = {}) {
        let filteredTasks = [...this.tasks];

        if (filter.completed !== undefined) {
            filteredTasks = filteredTasks.filter(task => task.completed === filter.completed);
        }

        if (filter.priority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
        }

        if (filter.dueDate) {
            const targetDate = new Date(filter.dueDate);
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === targetDate.toDateString();
            });
        }

        if (filter.overdue) {
            const now = new Date();
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate || task.completed) return false;
                return new Date(task.dueDate) < now;
            });
        }

        if (filter.tags && filter.tags.length > 0) {
            filteredTasks = filteredTasks.filter(task =>
                filter.tags.some(tag => task.tags.includes(tag))
            );
        }

        return this.sortTasks(filteredTasks, filter.sortBy);
    }

    sortTasks(tasks, sortBy = null) {
        const sortOption = sortBy || this.getCurrentSettings().defaultSort || 'priority';
        const sortConfig = TASK_SORT_OPTIONS[sortOption];
        
        if (sortConfig && sortConfig.sortFn) {
            return [...tasks].sort(sortConfig.sortFn);
        }
        
        return tasks;
    }

    // Statistics and analytics
    getTaskStatistics(tasks = this.tasks) {
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            overdue: 0,
            dueToday: 0,
            dueThisWeek: 0,
            byPriority: {},
            byStatus: {
                completed: 0,
                pending: 0,
                overdue: 0
            }
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfWeek = new Date(today.getTime() + (7 - today.getDay()) * 24 * 60 * 60 * 1000);

        tasks.forEach(task => {
            // Priority stats
            if (!stats.byPriority[task.priority]) {
                stats.byPriority[task.priority] = 0;
            }
            stats.byPriority[task.priority]++;

            // Due date stats
            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                
                if (dueDate < now) {
                    stats.overdue++;
                    stats.byStatus.overdue++;
                } else if (dueDate.toDateString() === today.toDateString()) {
                    stats.dueToday++;
                } else if (dueDate <= endOfWeek) {
                    stats.dueThisWeek++;
                }
            }

            // Status stats
            if (task.completed) {
                stats.byStatus.completed++;
            } else {
                stats.byStatus.pending++;
            }
        });

        return stats;
    }

    calculateProductivityMetrics(tasks = this.tasks) {
        const settings = this.getCurrentSettings();
        const dailyGoal = settings.dailyGoal || 5;
        
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const completedToday = tasks.filter(task => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate >= startOfDay;
        }).length;

        const progressPercentage = Math.min(100, (completedToday / dailyGoal) * 100);
        
        // Calculate completion rate for the week
        const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
        const completedThisWeek = tasks.filter(task => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate >= startOfWeek;
        }).length;

        return {
            dailyGoal,
            completedToday,
            progressPercentage,
            completedThisWeek,
            isGoalMet: completedToday >= dailyGoal
        };
    }

    // Goal tracking
    checkDailyGoal() {
        const metrics = this.calculateProductivityMetrics();
        
        if (metrics.isGoalMet) {
            this.emit('dailyGoalAchieved', {
                completed: metrics.completedToday,
                goal: metrics.dailyGoal
            });
        }

        return metrics;
    }

    // Reminder system
    getTaskReminders() {
        const settings = this.getCurrentSettings();
        const reminderDays = settings.reminderDays || 3;
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + reminderDays);

        return this.tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate <= reminderDate && dueDate >= new Date();
        });
    }

    // Settings validation
    validateTaskSettings(settings) {
        const errors = [];

        if (settings.reminderDays !== undefined) {
            if (typeof settings.reminderDays !== 'number' || settings.reminderDays < 0 || settings.reminderDays > 365) {
                errors.push('Reminder days must be between 0 and 365');
            }
        }

        if (settings.dailyGoal !== undefined) {
            if (typeof settings.dailyGoal !== 'number' || settings.dailyGoal < 1 || settings.dailyGoal > 100) {
                errors.push('Daily goal must be between 1 and 100');
            }
        }

        if (settings.archiveDays !== undefined) {
            if (typeof settings.archiveDays !== 'number' || settings.archiveDays < 1 || settings.archiveDays > 365) {
                errors.push('Archive days must be between 1 and 365');
            }
        }

        if (settings.defaultPriority && !TASK_PRIORITIES[settings.defaultPriority]) {
            errors.push('Invalid default priority');
        }

        if (settings.defaultSort && !TASK_SORT_OPTIONS[settings.defaultSort]) {
            errors.push('Invalid default sort option');
        }

        return errors;
    }

    // Apply settings
    applyTaskSettings() {
        const settings = this.getCurrentSettings();
        
        // Apply auto-archive if enabled
        if (settings.autoArchive && settings.archiveDays) {
            this.autoArchiveCompletedTasks(settings.archiveDays);
        }

        this.emit('settingsApplied', settings);
    }

    // Auto-archive completed tasks
    autoArchiveCompletedTasks(archiveDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

        const tasksToArchive = this.tasks.filter(task => {
            if (!task.completed || !task.completedAt) return false;
            return new Date(task.completedAt) < cutoffDate;
        });

        tasksToArchive.forEach(task => {
            task.archived = true;
            task.archivedAt = new Date().toISOString();
        });

        if (tasksToArchive.length > 0) {
            this.emit('tasksArchived', tasksToArchive);
        }
    }

    // Utility methods
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    exportTasks() {
        return {
            tasks: this.tasks,
            settings: this.getCurrentSettings(),
            exportedAt: new Date().toISOString()
        };
    }

    importTasks(data) {
        if (data.tasks) {
            this.tasks = data.tasks;
            this.emit('tasksImported', data);
        }
        
        if (data.settings) {
            this.currentSettings.tasks = { ...this.currentSettings.tasks, ...data.settings };
            this.emit('settingsImported', data.settings);
        }
    }

    resetSettings() {
        const defaultSettings = this.getDefaultSettings();
        this.currentSettings.tasks = defaultSettings;
        this.applyTaskSettings();
        this.emit('settingsReset', defaultSettings);
        return defaultSettings;
    }

    // Integration with other modules
    linkTaskToCalendar(taskId, eventId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.calendarEventId = eventId;
            this.emit('taskLinkedToCalendar', { task, eventId });
        }
    }

    startTaskTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.timerStarted = new Date().toISOString();
            this.emit('taskTimerStarted', task);
        }
    }

    stopTaskTimer(taskId, timeSpent) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.timeSpent = (task.timeSpent || 0) + timeSpent;
            task.timerStarted = null;
            this.emit('taskTimerStopped', { task, timeSpent });
        }
    }
}