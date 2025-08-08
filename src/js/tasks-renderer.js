// task-renderer.js 
// CSS imports
import '@css/main.css';
import '@css/components/tasks.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {
    setImage, setDailyQuote, setRandomGif, loadAllImages, 
    initTheme, setTheme, toggleTheme, updateDate, updateClock,
    errorHandler  // Import the errorHandler instance
} from '@components/utils.js';

// Import TaskManager
import TaskManager from '@components/tasks.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

let taskManager;

function initialize() {
    // Wrap initialization in error handler
    return errorHandler.wrapFunction(() => {
        console.log('Starting task renderer initialization...');
        
        loadAllImages();
        setDailyQuote();
        initTheme();
        
        console.log('Initializing TaskManager...');
        window.taskManager = new TaskManager();
        taskManager = window.taskManager;

        requestNotificationPermission();
        setupTaskFilters();
        
        console.log('Task renderer initialization completed successfully');
    }, 'Task Renderer Initialize')();
}

function debugFunctions() {
    return errorHandler.safeDOMOperation(() => {
        const now = new Date();
        console.log('Functions check:');
        console.log('setDailyQuote:', typeof window.setDailyQuote);
        
        // Simulate error for testing
        if (window.location.search.includes('debug-error')) {
            throw new Error('Debug error triggered from debugFunctions');
        }
    }, 'debugFunctions');
}

function requestNotificationPermission() {
    return errorHandler.wrapFunction(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            return errorHandler.wrapPromise(
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission);
                }),
                'Notification Permission Request'
            );
        }
    }, 'requestNotificationPermission')();
}

function debugTaskCompletion() {
    return errorHandler.safeDOMOperation(() => {
        console.log('=== TASK COMPLETION DEBUG ===');
        
        // Check if TaskManager instance exists
        if (window.taskManager) {
            const tasks = window.taskManager.getTasks();
            console.log('Total tasks:', tasks.length);
            console.log('Tasks:', tasks);
            
            // Check each task's structure
            tasks.forEach((task, index) => {
                console.log(`Task ${index}:`, {
                    id: task.id,
                    text: task.text,
                    completed: task.completed,
                    hasValidId: !isNaN(task.id) && task.id !== null && task.id !== undefined
                });
            });
        } else {
            console.log('TaskManager instance not found in window object');
        }
        
        // Check DOM elements
        const checkboxes = document.querySelectorAll('.task-checkbox');
        console.log('Checkboxes found:', checkboxes.length);
        
        checkboxes.forEach((checkbox, index) => {
            const taskId = checkbox.getAttribute('data-task-id');
            console.log(`Checkbox ${index}:`, {
                taskId: taskId,
                checked: checkbox.checked,
                hasEventListener: checkbox.onclick !== null || checkbox.onchange !== null
            });
        });
        
        // Check if tasks container exists
        const tasksContainer = document.getElementById('tasksContainer');
        console.log('Tasks container found:', !!tasksContainer);
        
        console.log('=== END DEBUG ===');
    }, 'debugTaskCompletion');
}

// Enhanced showNotification with error handling
function showNotification(message, type = 'info') {
    return errorHandler.safeDOMOperation(() => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            try {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            } catch (error) {
                console.error('Error removing notification:', error);
            }
        }, 3000);
        
        // Browser notification for important events
        if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('Stitch Tasks', {
                    body: message,
                    icon: '@assets/images/characters/stitch-wink.ico'
                });
            } catch (error) {
                console.warn('Could not create browser notification:', error);
            }
        }
    }, 'showNotification');
}

// Enhanced task update listener with error handling
document.addEventListener('taskUpdate', errorHandler.wrapFunction((event) => {
    console.log('Task update received:', event.detail);
    
    // Show notification for certain events
    const { type, task } = event.detail;
    switch (type) {
        case 'task-added':
            showNotification('Task created successfully!', 'success');
            break;
        case 'task-updated':
            showNotification('Task updated successfully!', 'success');
            break;
        case 'task-deleted':
            showNotification('Task deleted', 'info');
            break;
        // case 'task-completed':
        //     showNotification(task.completed ? 'Task completed! 🎉' : 'Task marked as incomplete', 'success');
        //     break;
        case 'task-priority-changed':
            showNotification(`Task priority changed to ${task.priority}`, 'info');
            break;
        case 'task-deadline-set':
            showNotification('Task deadline updated', 'info');
            break;
    }
}, 'taskUpdate Event Handler'));

function setupTaskFilters() {
    return errorHandler.safeDOMOperation(() => {
        // Priority filter
        const priorityFilter = document.getElementById('priority-filter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', errorHandler.wrapFunction((e) => {
                const priority = e.target.value;
                if (priority === 'all') {
                    taskManager.displayTasks();
                } else {
                    taskManager.displayTasks(task => task.priority === priority);
                }
            }, 'Priority Filter Change'));
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', errorHandler.wrapFunction((e) => {
                const status = e.target.value;
                switch(status) {
                    case 'all':
                        taskManager.displayTasks();
                        break;
                    case 'completed':
                        taskManager.displayTasks(task => task.completed);
                        break;
                    case 'pending':
                        taskManager.displayTasks(task => !task.completed);
                        break;
                    case 'overdue':
                        taskManager.displayTasks(task => 
                            task.deadline && taskManager.isOverdue(task.deadline) && !task.completed
                        );
                        break;
                }
            }, 'Status Filter Change'));
        }
        
        // Search functionality
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.addEventListener('input', errorHandler.wrapFunction((e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                if (searchTerm === '') {
                    taskManager.displayTasks();
                } else {
                    taskManager.displayTasks(task => 
                        task.text.toLowerCase().includes(searchTerm)
                    );
                }
            }, 'Search Input'));
        }
    }, 'setupTaskFilters');
}

// ============================================================================
// ERROR SIMULATION FUNCTIONS FOR TESTING
// ============================================================================

function simulateError(errorType = 'generic') {
    console.log(`🧪 Simulating ${errorType} error...`);
    
    switch (errorType) {
        case 'dom':
            // DOM manipulation error
            document.getElementById('non-existent-element').innerHTML = 'This will fail';
            break;
            
        case 'reference':
            // Reference error
            nonExistentFunction();
            break;
            
        case 'type':
            // Type error
            null.someProperty.anotherProperty = 'fail';
            break;
            
        case 'promise':
            // Promise rejection
            return Promise.reject(new Error('Simulated promise rejection'));
            
        case 'async':
            // Async error
            setTimeout(() => {
                throw new Error('Simulated async error');
            }, 1000);
            break;
            
        case 'task-manager':
            // Task manager related error
            if (window.taskManager) {
                window.taskManager.nonExistentMethod();
            } else {
                throw new Error('TaskManager not initialized');
            }
            break;
            
        case 'notification':
            // Notification error
            showNotification(null, 'invalid-type');
            break;
            
        default:
            // Generic error
            throw new Error('This is a simulated error for testing the error boundary');
    }
}

// Add error simulation to window for console testing
window.simulateError = simulateError;

// Debug functions with error simulation
window.debugTaskCompletion = debugTaskCompletion;
window.taskRenderer = {
    showNotification,
    simulateError,
    errorHandler  // Expose error handler for debugging
};

// ============================================================================
// INITIALIZATION WITH ERROR HANDLING
// ============================================================================

// Initialize when DOM is ready with error handling
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initialize();
        } catch (error) {
            console.error('Error during initialization:', error);
            errorHandler.showErrorBoundary();
        }
    });
} else {
    // DOM is already ready
    try {
        initialize();
    } catch (error) {
        console.error('Error during immediate initialization:', error);
        errorHandler.showErrorBoundary();
    }
}

// Enhanced task update listener (keeping the original one for compatibility)
document.addEventListener('taskUpdate', errorHandler.wrapFunction((event) => {
    console.log('Task update received (secondary listener):', event.detail);
    // Handle cross-module task updates if needed
}, 'Secondary taskUpdate Handler'));

console.log('Tasks page loaded with error handling');

// ============================================================================
// URL-BASED ERROR SIMULATION FOR EASY TESTING
// ============================================================================

// Check URL parameters for error simulation on page load
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('simulate-error')) {
    const errorType = urlParams.get('simulate-error');
    console.log(`🧪 URL-triggered error simulation: ${errorType}`);
    
    // Delay the error slightly to let the page initialize
    setTimeout(() => {
        simulateError(errorType);
    }, 2000);
}