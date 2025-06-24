// // CSS imports
// import '@css/main.css';
// import '@css/components/tasks.css';
// import '@css/components/sidebar.css';
// import '@components/sidebar.js';
// import {
//     setImage,
//     setDailyQuote,
//     setRandomGif,
//     loadAllImages,
//     initTheme,
//     setTheme,
//     toggleTheme,
//     updateDate,
//     updateClock
// } from '@components/utils.js';

// import 'bootstrap-icons/font/bootstrap-icons.css';
// function initialize() {
//     loadAllImages(); // Load all images including random gif
//     setDailyQuote();
//     initTheme();
    
// }

// // Initialize when DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initialize);
// } else {
//     // DOM is already ready
//     initialize();
// }

// console.log('Tasks page loaded');

// tasks-renderer.js
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
    loadAllImages(); // Load all images including random gif
    setDailyQuote();
    initTheme();
    
    // Initialize TaskManager
    taskManager = new TaskManager();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Setup task filters if they exist
    setupTaskFilters();
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}

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