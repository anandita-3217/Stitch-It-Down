// settings-tasks.js - Task-specific settings management
import { EventEmitter } from 'events';

export class TaskSettings extends EventEmitter {
    constructor() {
        super();
        this.currentSettings = {};
        this.originalSettings = {};
        this.validationRules = this.initializeValidationRules();
    }

    /**
     * Initialize validation rules for task settings
     */
    initializeValidationRules() {
        return {
            defaultPriority: {
                type: 'enum',
                values: ['low', 'medium', 'high'],
                default: 'medium'
            },
            defaultSort: {
                type: 'enum',
                values: ['due-date', 'priority', 'created', 'alphabetical'],
                default: 'due-date'
            },
            reminderDays: {
                type: 'number',
                min: 0,
                max: 30,
                default: 3
            },
            dailyGoal: {
                type: 'number',
                min: 1,
                max: 50,
                default: 5
            },
            timeEstimation: {
                type: 'boolean',
                default: true
            },
            completionTracking: {
                type: 'boolean',
                default: true
            }
        };
    }

    /**
     * Set current settings (called from main settings renderer)
     */
    setCurrentSettings(settings) {
        this.currentSettings = settings;
        this.originalSettings = JSON.parse(JSON.stringify(settings));
    }

    /**
     * Get current task settings
     */
    getCurrentTaskSettings() {
        return this.currentSettings.tasks || {};
    }

    /**
     * Validate task settings
     */
    validateSettings(taskSettings) {
        const errors = [];
        
        for (const [key, rule] of Object.entries(this.validationRules)) {
            const value = taskSettings[key];
            
            if (value === undefined || value === null) continue;

            try {
                switch (rule.type) {
                    case 'enum':
                        if (!rule.values.includes(value)) {
                            errors.push(`Invalid ${key}: must be one of ${rule.values.join(', ')}`);
                        }
                        break;
                    
                    case 'number':
                        const numValue = Number(value);
                        if (isNaN(numValue)) {
                            errors.push(`Invalid ${key}: must be a number`);
                        } else if (rule.min !== undefined && numValue < rule.min) {
                            errors.push(`Invalid ${key}: minimum value is ${rule.min}`);
                        } else if (rule.max !== undefined && numValue > rule.max) {
                            errors.push(`Invalid ${key}: maximum value is ${rule.max}`);
                        }
                        break;
                    
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            errors.push(`Invalid ${key}: must be true or false`);
                        }
                        break;
                }
            } catch (error) {
                errors.push(`Error validating ${key}: ${error.message}`);
            }
        }

        return errors;
    }

    /**
     * Get default task settings
     */
    getDefaultSettings() {
        const defaults = {};
        for (const [key, rule] of Object.entries(this.validationRules)) {
            defaults[key] = rule.default;
        }
        return defaults;
    }

    /**
     * Get priority options for UI
     */
    getPriorityOptions() {
        return [
            { value: 'low', label: 'Low', color: '#22c55e' },
            { value: 'medium', label: 'Medium', color: '#f59e0b' },
            { value: 'high', label: 'High', color: '#ef4444' }
        ];
    }

    /**
     * Get sort options for UI
     */
    getSortOptions() {
        return [
            { value: 'due-date', label: 'Due Date' },
            { value: 'priority', label: 'Priority' },
            { value: 'created', label: 'Created Date' },
            { value: 'alphabetical', label: 'Alphabetical' }
        ];
    }

    /**
     * Calculate productivity metrics based on current settings
     */
    calculateProductivityMetrics(tasks = []) {
        const settings = this.getCurrentTaskSettings();
        const dailyGoal = settings.dailyGoal || 5;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysTasks = tasks.filter(task => {
            const taskDate = new Date(task.completedAt || task.createdAt);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
        });

        const completedToday = todaysTasks.filter(task => task.completed).length;
        const progressPercentage = Math.min((completedToday / dailyGoal) * 100, 100);

        return {
            dailyGoal,
            completedToday,
            progressPercentage,
            tasksRemaining: Math.max(dailyGoal - completedToday, 0)
        };
    }

    /**
     * Get tasks that need reminders based on current settings
     */
    getTasksNeedingReminders(tasks = []) {
        const settings = this.getCurrentTaskSettings();
        const reminderDays = settings.reminderDays || 3;
        
        const now = new Date();
        const reminderThreshold = new Date();
        reminderThreshold.setDate(now.getDate() + reminderDays);

        return tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            return dueDate <= reminderThreshold && dueDate >= now;
        });
    }

    /**
     * Sort tasks based on current settings
     */
    sortTasks(tasks = []) {
        const settings = this.getCurrentTaskSettings();
        const sortBy = settings.defaultSort || 'due-date';

        const sortedTasks = [...tasks];

        switch (sortBy) {
            case 'due-date':
                sortedTasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;

            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                sortedTasks.sort((a, b) => {
                    const aPriority = priorityOrder[a.priority] || 1;
                    const bPriority = priorityOrder[b.priority] || 1;
                    return bPriority - aPriority;
                });
                break;

            case 'created':
                sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;

            case 'alphabetical':
                sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return sortedTasks;
    }

    /**
     * Estimate time for task completion based on settings and history
     */
    estimateTaskTime(task, completedTasks = []) {
        const settings = this.getCurrentTaskSettings();
        
        if (!settings.timeEstimation) {
            return null;
        }

        // If task already has an estimation, return it
        if (task.estimatedTime) {
            return task.estimatedTime;
        }

        // Find similar completed tasks for estimation
        const similarTasks = completedTasks.filter(completedTask => 
            completedTask.priority === task.priority &&
            completedTask.category === task.category &&
            completedTask.actualTime
        );

        if (similarTasks.length === 0) {
            // Default estimates based on priority
            const defaultEstimates = {
                high: 120, // 2 hours
                medium: 60, // 1 hour
                low: 30    // 30 minutes
            };
            return defaultEstimates[task.priority] || 60;
        }

        // Calculate average time for similar tasks
        const totalTime = similarTasks.reduce((sum, t) => sum + t.actualTime, 0);
        return Math.round(totalTime / similarTasks.length);
    }

    /**
     * Track task completion time
     */
    trackTaskCompletion(task, timeSpent) {
        const settings = this.getCurrentTaskSettings();
        
        if (!settings.completionTracking) {
            return task;
        }

        const updatedTask = {
            ...task,
            completed: true,
            completedAt: new Date().toISOString(),
            actualTime: timeSpent
        };

        // Calculate accuracy if there was an estimate
        if (task.estimatedTime) {
            const accuracy = Math.abs(task.estimatedTime - timeSpent) / task.estimatedTime;
            updatedTask.estimationAccuracy = Math.max(0, 1 - accuracy);
        }

        this.emit('taskCompleted', updatedTask);
        return updatedTask;
    }

    /**
     * Get task statistics for the current settings
     */
    getTaskStatistics(tasks = []) {
        const completedTasks = tasks.filter(task => task.completed);
        const pendingTasks = tasks.filter(task => !task.completed);
        
        const stats = {
            total: tasks.length,
            completed: completedTasks.length,
            pending: pendingTasks.length,
            completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
        };

        // Priority breakdown
        stats.byPriority = {
            high: tasks.filter(task => task.priority === 'high').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            low: tasks.filter(task => task.priority === 'low').length
        };

        // Time estimation accuracy (if tracking is enabled)
        const settings = this.getCurrentTaskSettings();
        if (settings.completionTracking) {
            const tasksWithEstimates = completedTasks.filter(task => 
                task.estimatedTime && task.actualTime
            );
            
            if (tasksWithEstimates.length > 0) {
                const totalAccuracy = tasksWithEstimates.reduce((sum, task) => 
                    sum + (task.estimationAccuracy || 0), 0
                );
                stats.estimationAccuracy = (totalAccuracy / tasksWithEstimates.length) * 100;
            }
        }

        return stats;
    }

    /**
     * Export task settings for backup
     */
    exportSettings() {
        return {
            tasks: this.getCurrentTaskSettings(),
            validationRules: this.validationRules,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import task settings from backup
     */
    importSettings(importedData) {
        try {
            if (importedData.tasks) {
                const errors = this.validateSettings(importedData.tasks);
                if (errors.length > 0) {
                    this.emit('error', `Invalid task settings: ${errors.join(', ')}`);
                    return false;
                }
                
                this.currentSettings.tasks = importedData.tasks;
                this.emit('settingsImported', this.currentSettings);
                return true;
            }
            return false;
        } catch (error) {
            this.emit('error', `Failed to import task settings: ${error.message}`);
            return false;
        }
    }

    /**
     * Check if current settings differ from original
     */
    hasUnsavedChanges(formData) {
        if (!formData.tasks) return false;
        
        const originalTasks = this.originalSettings.tasks || {};
        const currentTasks = formData.tasks;

        return JSON.stringify(originalTasks) !== JSON.stringify(currentTasks);
    }

    /**
     * Reset to original settings
     */
    resetToOriginal() {
        this.currentSettings.tasks = JSON.parse(JSON.stringify(this.originalSettings.tasks || {}));
        this.emit('settingsReset', this.currentSettings);
    }

    /**
     * Apply new settings
     */
    applySettings(newSettings) {
        const errors = this.validateSettings(newSettings);
        if (errors.length > 0) {
            this.emit('validationError', errors);
            return false;
        }

        this.currentSettings.tasks = newSettings;
        this.emit('settingsApplied', this.currentSettings);
        return true;
    }
}