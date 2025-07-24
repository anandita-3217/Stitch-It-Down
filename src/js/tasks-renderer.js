// // // task-renderer.js 
// // // CSS imports
// // import '@css/main.css';
// // import '@css/components/tasks.css';
// // import '@css/components/sidebar.css';
// // import '@components/sidebar.js';
// // import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';

// // // Import TaskManager
// // import TaskManager from '@components/tasks.js';

// // import 'bootstrap-icons/font/bootstrap-icons.css';

// // let taskManager;

// // function initialize() {
// //     loadAllImages();
// //     setDailyQuote();
// //     // debugFunctions();
// //     initTheme();
// //     console.log('Initializing TaskManager...');
// //     window.taskManager = new TaskManager(); // Make globally accessible
// //     taskManager = window.taskManager;

    
// //     requestNotificationPermission();
// //     setupTaskFilters();
// // }


// // function debugFunctions() {
// //     const now = new Date();
// //     console.log('Functions check:');
// //     console.log('setDailyQuote:', typeof window.setDailyQuote);
// // }

// // function requestNotificationPermission() {
// //     if ('Notification' in window && Notification.permission === 'default') {
// //         Notification.requestPermission().then(permission => {
// //             console.log('Notification permission:', permission);
// //         });
// //     }
// // }
// // function debugTaskCompletion() {
// //     console.log('=== TASK COMPLETION DEBUG ===');
    
// //     // Check if TaskManager instance exists
// //     if (window.taskManager) {
// //         const tasks = window.taskManager.getTasks();
// //         console.log('Total tasks:', tasks.length);
// //         console.log('Tasks:', tasks);
        
// //         // Check each task's structure
// //         tasks.forEach((task, index) => {
// //             console.log(`Task ${index}:`, {
// //                 id: task.id,
// //                 text: task.text,
// //                 completed: task.completed,
// //                 hasValidId: !isNaN(task.id) && task.id !== null && task.id !== undefined
// //             });
// //         });
// //     } else {
// //         console.log('TaskManager instance not found in window object');
// //     }
    
// //     // Check DOM elements
// //     const checkboxes = document.querySelectorAll('.task-checkbox');
// //     console.log('Checkboxes found:', checkboxes.length);
    
// //     checkboxes.forEach((checkbox, index) => {
// //         const taskId = checkbox.getAttribute('data-task-id');
// //         console.log(`Checkbox ${index}:`, {
// //             taskId: taskId,
// //             checked: checkbox.checked,
// //             hasEventListener: checkbox.onclick !== null || checkbox.onchange !== null
// //         });
// //     });
    
// //     // Check if tasks container exists
// //     const tasksContainer = document.getElementById('tasksContainer');
// //     console.log('Tasks container found:', !!tasksContainer);
    
// //     console.log('=== END DEBUG ===');
// // }

// // // Add this to window for easy debugging
// // window.debugTaskCompletion = debugTaskCompletion;
// // // Add this function to your task-renderer.js
// // function showNotification(message, type = 'info') {
// //     // Create notification element
// //     const notification = document.createElement('div');
// //     notification.className = `notification notification-${type}`;
// //     notification.innerHTML = `
// //         <div class="notification-content">
// //             <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
// //             <span>${message}</span>
// //         </div>
// //     `;
    
// //     // Add to page
// //     document.body.appendChild(notification);
    
// //     // Auto-remove after 3 seconds
// //     setTimeout(() => {
// //         notification.classList.add('fade-out');
// //         setTimeout(() => {
// //             if (notification.parentNode) {
// //                 notification.parentNode.removeChild(notification);
// //             }
// //         }, 300);
// //     }, 3000);
    
// //     // Browser notification for important events
// //     if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
// //         new Notification('Stitch Tasks', {
// //             body: message,
// //             icon: '@assets/images/characters/stitch-wink.ico' // Adjust path as needed
// //         });
// //     }
// // }

// // // Replace your existing taskUpdate listener with this enhanced version:
// // document.addEventListener('taskUpdate', (event) => {
// //     console.log('Task update received:', event.detail);
    
// //     // Show notification for certain events
// //     const { type, task } = event.detail;
// //     switch (type) {
// //         case 'task-added':
// //             showNotification('Task created successfully!', 'success');
// //             break;
// //         case 'task-updated':
// //             showNotification('Task updated successfully!', 'success');
// //             break;
// //         case 'task-deleted':
// //             showNotification('Task deleted', 'info');
// //             break;
// //         case 'task-completed':
// //             showNotification(task.completed ? 'Task completed! 🎉' : 'Task marked as incomplete', 'success');
// //             break;
// //         case 'task-priority-changed':
// //             showNotification(`Task priority changed to ${task.priority}`, 'info');
// //             break;
// //         case 'task-deadline-set':
// //             showNotification('Task deadline updated', 'info');
// //             break;
// //     }
// // });

// // // Make notification function available globally for debugging
// // window.taskRenderer = {
// //     showNotification
// // };


// // function setupTaskFilters() {
// //     // Priority filter
// //     const priorityFilter = document.getElementById('priority-filter');
// //     if (priorityFilter) {
// //         priorityFilter.addEventListener('change', (e) => {
// //             const priority = e.target.value;
// //             if (priority === 'all') {
// //                 taskManager.displayTasks();
// //             } else {
// //                 taskManager.displayTasks(task => task.priority === priority);
// //             }
// //         });
// //     }
    
// //     // Status filter
// //     const statusFilter = document.getElementById('status-filter');
// //     if (statusFilter) {
// //         statusFilter.addEventListener('change', (e) => {
// //             const status = e.target.value;
// //             switch(status) {
// //                 case 'all':
// //                     taskManager.displayTasks();
// //                     break;
// //                 case 'completed':
// //                     taskManager.displayTasks(task => task.completed);
// //                     break;
// //                 case 'pending':
// //                     taskManager.displayTasks(task => !task.completed);
// //                     break;
// //                 case 'overdue':
// //                     taskManager.displayTasks(task => 
// //                         task.deadline && taskManager.isOverdue(task.deadline) && !task.completed
// //                     );
// //                     break;
// //             }
// //         });
// //     }
    
// //     // Search functionality
// //     const searchInput = document.getElementById('task-search');
// //     if (searchInput) {
// //         searchInput.addEventListener('input', (e) => {
// //             const searchTerm = e.target.value.toLowerCase().trim();
// //             if (searchTerm === '') {
// //                 taskManager.displayTasks();
// //             } else {
// //                 taskManager.displayTasks(task => 
// //                     task.text.toLowerCase().includes(searchTerm)
// //                 );
// //             }
// //         });
// //     }
// // }

// // // Initialize when DOM is ready
// // if (document.readyState === 'loading') {
// //     document.addEventListener('DOMContentLoaded', initialize);
// // } else {
// //     // DOM is already ready
// //     initialize();
// // }

// // // Listen for task updates from other modules
// // document.addEventListener('taskUpdate', (event) => {
// //     console.log('Task update received:', event.detail);
// //     // Handle cross-module task updates if needed
// // });

// // console.log('Tasks page loaded');
// // task-renderer.js 
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
//     updateClock,
//     errorHandler // Import the error handler
// } from '@components/utils.js';

// // Import TaskManager
// import TaskManager from '@components/tasks.js';

// import 'bootstrap-icons/font/bootstrap-icons.css';

// let taskManager;

// // ============================================================================
// // INITIALIZATION WITH ERROR HANDLING
// // ============================================================================

// function initialize() {
//     return errorHandler.safeDOMOperation(() => {
//         console.log('Starting task renderer initialization...');
        
//         // Load images with error handling
//         loadAllImages();
//         setDailyQuote();
//         initTheme();
        
//         // Initialize TaskManager with error handling
//         console.log('Initializing TaskManager...');
//         try {
//             window.taskManager = new TaskManager();
//             taskManager = window.taskManager;
//             console.log('TaskManager initialized successfully');
//         } catch (error) {
//             console.error('Failed to initialize TaskManager:', error);
//             showNotification('Failed to initialize task system. Please refresh the page.', 'error');
//             return;
//         }

//         // Setup additional features
//         requestNotificationPermission();
//         setupTaskFilters();
//         setupTaskEventListeners();
        
//         console.log('Task renderer initialization complete');
//     }, 'Task Renderer Initialization');
// }

// // ============================================================================
// // NOTIFICATION SYSTEM WITH ERROR HANDLING
// // ============================================================================

// function requestNotificationPermission() {
//     return errorHandler.safeDOMOperation(() => {
//         if ('Notification' in window && Notification.permission === 'default') {
//             Notification.requestPermission()
//                 .then(permission => {
//                     console.log('Notification permission:', permission);
//                 })
//                 .catch(error => {
//                     console.warn('Failed to request notification permission:', error);
//                 });
//         }
//     }, 'Request Notification Permission');
// }

// function showNotification(message, type = 'info') {
//     return errorHandler.safeDOMOperation(() => {
//         // Validate inputs
//         if (!message || typeof message !== 'string') {
//             console.warn('Invalid notification message:', message);
//             return;
//         }

//         // Create notification element
//         const notification = document.createElement('div');
//         notification.className = `notification notification-${type}`;
        
//         // Get appropriate icon
//         const iconMap = {
//             success: 'check-circle',
//             error: 'exclamation-circle',
//             warning: 'exclamation-triangle',
//             info: 'info-circle'
//         };
//         const icon = iconMap[type] || 'info-circle';
        
//         notification.innerHTML = `
//             <div class="notification-content">
//                 <i class="bi bi-${icon}"></i>
//                 <span>${message}</span>
//                 <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
//                     <i class="bi bi-x"></i>
//                 </button>
//             </div>
//         `;
        
//         // Add to page
//         document.body.appendChild(notification);
        
//         // Auto-remove after 5 seconds (increased for better UX)
//         setTimeout(() => {
//             try {
//                 if (notification.parentNode) {
//                     notification.classList.add('fade-out');
//                     setTimeout(() => {
//                         if (notification.parentNode) {
//                             notification.parentNode.removeChild(notification);
//                         }
//                     }, 300);
//                 }
//             } catch (error) {
//                 console.warn('Error removing notification:', error);
//             }
//         }, 5000);
        
//         // Browser notification for important events
//         if ((type === 'success' || type === 'error') && 'Notification' in window && Notification.permission === 'granted') {
//             try {
//                 new Notification('Stitch Tasks', {
//                     body: message,
//                     icon: '/favicon.ico', // Adjust path as needed
//                     tag: 'stitch-task-notification'
//                 });
//             } catch (error) {
//                 console.warn('Failed to show browser notification:', error);
//             }
//         }
//     }, 'Show Notification');
// }

// // ============================================================================
// // DEBUGGING FUNCTIONS WITH ERROR HANDLING
// // ============================================================================

// function debugTaskCompletion() {
//     return errorHandler.safeDOMOperation(() => {
//         console.log('=== TASK COMPLETION DEBUG ===');
        
//         // Check if TaskManager instance exists
//         if (window.taskManager) {
//             try {
//                 const tasks = window.taskManager.getTasks();
//                 console.log('Total tasks:', tasks.length);
//                 console.log('Tasks:', tasks);
                
//                 // Check each task's structure
//                 tasks.forEach((task, index) => {
//                     console.log(`Task ${index}:`, {
//                         id: task.id,
//                         text: task.text,
//                         completed: task.completed,
//                         hasValidId: !isNaN(task.id) && task.id !== null && task.id !== undefined
//                     });
//                 });
//             } catch (error) {
//                 console.error('Error accessing tasks:', error);
//             }
//         } else {
//             console.log('TaskManager instance not found in window object');
//         }
        
//         // Check DOM elements
//         const checkboxes = document.querySelectorAll('.task-checkbox');
//         console.log('Checkboxes found:', checkboxes.length);
        
//         checkboxes.forEach((checkbox, index) => {
//             const taskId = checkbox.getAttribute('data-task-id');
//             console.log(`Checkbox ${index}:`, {
//                 taskId: taskId,
//                 checked: checkbox.checked,
//                 hasEventListener: checkbox.onclick !== null || checkbox.onchange !== null
//             });
//         });
        
//         // Check if tasks container exists
//         const tasksContainer = document.getElementById('tasksContainer');
//         console.log('Tasks container found:', !!tasksContainer);
        
//         console.log('=== END DEBUG ===');
//     }, 'Debug Task Completion');
// }

// function debugFunctions() {
//     return errorHandler.safeDOMOperation(() => {
//         const now = new Date();
//         console.log('Functions check:');
//         console.log('setDailyQuote:', typeof window.setDailyQuote);
//         console.log('TaskManager available:', !!window.taskManager);
//         console.log('Current time:', now.toISOString());
//     }, 'Debug Functions');
// }

// // ============================================================================
// // TASK FILTERING WITH ERROR HANDLING
// // ============================================================================

// function setupTaskFilters() {
//     return errorHandler.safeDOMOperation(() => {
//         console.log('Setting up task filters...');
        
//         // Priority filter
//         const priorityFilter = document.getElementById('priority-filter');
//         if (priorityFilter) {
//             priorityFilter.addEventListener('change', errorHandler.wrapFunction((e) => {
//                 if (!taskManager) {
//                     showNotification('Task manager not available', 'error');
//                     return;
//                 }
                
//                 const priority = e.target.value;
//                 if (priority === 'all') {
//                     taskManager.displayTasks();
//                 } else {
//                     taskManager.displayTasks(task => task.priority === priority);
//                 }
//             }, 'Priority Filter Change'));
//         }
        
//         // Status filter
//         const statusFilter = document.getElementById('status-filter');
//         if (statusFilter) {
//             statusFilter.addEventListener('change', errorHandler.wrapFunction((e) => {
//                 if (!taskManager) {
//                     showNotification('Task manager not available', 'error');
//                     return;
//                 }
                
//                 const status = e.target.value;
//                 switch(status) {
//                     case 'all':
//                         taskManager.displayTasks();
//                         break;
//                     case 'completed':
//                         taskManager.displayTasks(task => task.completed);
//                         break;
//                     case 'pending':
//                         taskManager.displayTasks(task => !task.completed);
//                         break;
//                     case 'overdue':
//                         taskManager.displayTasks(task => 
//                             task.deadline && taskManager.isOverdue(task.deadline) && !task.completed
//                         );
//                         break;
//                 }
//             }, 'Status Filter Change'));
//         }
        
//         // Search functionality
//         const searchInput = document.getElementById('task-search');
//         if (searchInput) {
//             searchInput.addEventListener('input', errorHandler.wrapFunction((e) => {
//                 if (!taskManager) {
//                     showNotification('Task manager not available', 'error');
//                     return;
//                 }
                
//                 const searchTerm = e.target.value.toLowerCase().trim();
//                 if (searchTerm === '') {
//                     taskManager.displayTasks();
//                 } else {
//                     taskManager.displayTasks(task => 
//                         task.text.toLowerCase().includes(searchTerm)
//                     );
//                 }
//             }, 'Search Input'));
//         }
        
//         console.log('Task filters setup complete');
//     }, 'Setup Task Filters');
// }

// // ============================================================================
// // EVENT LISTENERS WITH ERROR HANDLING
// // ============================================================================

// function setupTaskEventListeners() {
//     return errorHandler.safeDOMOperation(() => {
//         console.log('Setting up task event listeners...');
        
//         // Enhanced task update listener
//         document.addEventListener('taskUpdate', errorHandler.wrapFunction((event) => {
//             console.log('Task update received:', event.detail);
            
//             if (!event.detail) {
//                 console.warn('Task update event missing detail');
//                 return;
//             }
            
//             // Show notification for certain events
//             const { type, task, error } = event.detail;
            
//             // Handle errors in task operations
//             if (error) {
//                 console.error('Task operation error:', error);
//                 showNotification(`Task error: ${error.message || 'Unknown error'}`, 'error');
//                 return;
//             }
            
//             // Handle successful operations
//             switch (type) {
//                 case 'task-added':
//                     showNotification(`Task "${task?.text || 'New task'}" created successfully!`, 'success');
//                     break;
//                 case 'task-updated':
//                     showNotification(`Task "${task?.text || 'Task'}" updated successfully!`, 'success');
//                     break;
//                 case 'task-deleted':
//                     showNotification('Task deleted', 'info');
//                     break;
//                 case 'task-completed':
//                     if (task) {
//                         const message = task.completed ? 
//                             `Great job! "${task.text}" completed! 🎉` : 
//                             `Task "${task.text}" marked as incomplete`;
//                         showNotification(message, 'success');
//                     }
//                     break;
//                 case 'task-priority-changed':
//                     if (task) {
//                         showNotification(`Task priority changed to ${task.priority}`, 'info');
//                     }
//                     break;
//                 case 'task-deadline-set':
//                     showNotification('Task deadline updated', 'info');
//                     break;
//                 case 'task-sync-error':
//                     showNotification('Failed to sync tasks. Changes saved locally.', 'warning');
//                     break;
//                 default:
//                     console.log('Unhandled task update type:', type);
//             }
//         }, 'Task Update Handler'));
        
//         // Error handling for unhandled task errors
//         document.addEventListener('taskError', errorHandler.wrapFunction((event) => {
//             console.error('Task error event:', event.detail);
//             const { message, error, context } = event.detail;
            
//             showNotification(
//                 message || `Error in ${context || 'task operation'}: ${error?.message || 'Unknown error'}`, 
//                 'error'
//             );
//         }, 'Task Error Handler'));
        
//         console.log('Task event listeners setup complete');
//     }, 'Setup Task Event Listeners');
// }

// // ============================================================================
// // ENHANCED UTILITY FUNCTIONS
// // ============================================================================

// function safeTaskManagerOperation(operation, operationName, fallbackValue = null) {
//     try {
//         if (!taskManager) {
//             throw new Error('TaskManager not initialized');
//         }
//         return operation();
//     } catch (error) {
//         console.error(`Error in ${operationName}:`, error);
//         showNotification(`${operationName} failed: ${error.message}`, 'error');
//         return fallbackValue;
//     }
// }

// function refreshTaskDisplay() {
//     return safeTaskManagerOperation(
//         () => taskManager.displayTasks(),
//         'Refresh Task Display'
//     );
// }

// function getTaskStats() {
//     return safeTaskManagerOperation(
//         () => {
//             const tasks = taskManager.getTasks();
//             return {
//                 total: tasks.length,
//                 completed: tasks.filter(t => t.completed).length,
//                 pending: tasks.filter(t => !t.completed).length,
//                 overdue: tasks.filter(t => t.deadline && taskManager.isOverdue(t.deadline) && !t.completed).length
//             };
//         },
//         'Get Task Stats',
//         { total: 0, completed: 0, pending: 0, overdue: 0 }
//     );
// }

// // ============================================================================
// // INITIALIZATION AND CLEANUP
// // ============================================================================

// // Initialize when DOM is ready with enhanced error handling
// function initializeWhenReady() {
//     try {
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => {
//                 errorHandler.wrapFunction(initialize, 'DOMContentLoaded Initialize')();
//             });
//         } else {
//             // DOM is already ready
//             initialize();
//         }
//     } catch (error) {
//         console.error('Critical error during initialization setup:', error);
//         // Show a basic error message even if our notification system fails
//         if (document.body) {
//             document.body.innerHTML += `
//                 <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
//                             background: #f44336; color: white; padding: 20px; border-radius: 8px; 
//                             z-index: 10000; text-align: center;">
//                     <h3>🚨 Critical Error</h3>
//                     <p>Failed to initialize the task system. Please refresh the page.</p>
//                     <button onclick="location.reload()" style="background: #fff; color: #f44336; 
//                                                                border: none; padding: 8px 16px; 
//                                                                border-radius: 4px; cursor: pointer;">
//                         Refresh Page
//                     </button>
//                 </div>
//             `;
//         }
//     }
// }

// // Cleanup function for page unload
// window.addEventListener('beforeunload', errorHandler.wrapFunction(() => {
//     console.log('Task renderer cleanup...');
//     // Perform any necessary cleanup
//     if (taskManager && typeof taskManager.cleanup === 'function') {
//         taskManager.cleanup();
//     }
// }, 'Page Unload Cleanup'));

// // ============================================================================
// // GLOBAL EXPORTS AND DEBUG FUNCTIONS
// // ============================================================================

// // Make functions available globally for debugging
// window.taskRenderer = {
//     showNotification,
//     debugTaskCompletion,
//     refreshTaskDisplay,
//     getTaskStats,
//     taskManager: () => taskManager, // Getter function to always return current instance
    
//     // Error handling utilities
//     safeOperation: (operation, name) => errorHandler.safeDOMOperation(operation, name),
//     wrapFunction: (fn, name) => errorHandler.wrapFunction(fn, name)
// };

// // Add debug functions to window for console access
// window.debugTaskCompletion = debugTaskCompletion;
// window.debugFunctions = debugFunctions;

// // Start initialization
// initializeWhenReady();

// console.log('Task renderer loaded with enhanced error handling');
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