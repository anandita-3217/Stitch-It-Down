// task-renderer.js 
// CSS imports
import '@css/main.css';
import '@css/components/tasks.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

// Import TaskManager
import TaskManager from '@components/tasks.js';

import 'bootstrap-icons/font/bootstrap-icons.css';

let taskManager;

function initialize() {
    loadAllImages();
    setDailyQuote();
    // debugFunctions();
    initTheme();
    console.log('Initializing TaskManager...');
    window.taskManager = new TaskManager(); // Make globally accessible
    taskManager = window.taskManager;

    
    requestNotificationPermission();
    setupTaskFilters();
}


function debugFunctions() {
    const now = new Date();
    console.log('Functions check:');
    console.log('setDailyQuote:', typeof window.setDailyQuote);
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}
function debugTaskCompletion() {
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
}

// Add this to window for easy debugging
window.debugTaskCompletion = debugTaskCompletion;
// Add this function to your task-renderer.js
function showNotification(message, type = 'info') {
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
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Browser notification for important events
    if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Stitch Tasks', {
            body: message,
            icon: '@assets/images/characters/stitch-wink.ico' // Adjust path as needed
        });
    }
}

// Replace your existing taskUpdate listener with this enhanced version:
document.addEventListener('taskUpdate', (event) => {
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
        case 'task-completed':
            showNotification(task.completed ? 'Task completed! 🎉' : 'Task marked as incomplete', 'success');
            break;
        case 'task-priority-changed':
            showNotification(`Task priority changed to ${task.priority}`, 'info');
            break;
        case 'task-deadline-set':
            showNotification('Task deadline updated', 'info');
            break;
    }
});

// Make notification function available globally for debugging
window.taskRenderer = {
    showNotification
};


function setupTaskFilters() {
    // Priority filter
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            const priority = e.target.value;
            if (priority === 'all') {
                taskManager.displayTasks();
            } else {
                taskManager.displayTasks(task => task.priority === priority);
            }
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
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
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (searchTerm === '') {
                taskManager.displayTasks();
            } else {
                taskManager.displayTasks(task => 
                    task.text.toLowerCase().includes(searchTerm)
                );
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

// Listen for task updates from other modules
document.addEventListener('taskUpdate', (event) => {
    console.log('Task update received:', event.detail);
    // Handle cross-module task updates if needed
});

console.log('Tasks page loaded');