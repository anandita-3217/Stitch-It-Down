// renderer.js
import '@css/main.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';
import { GamificationSystem, GamificationUI } from '@js/gamification';
import '@css//gamification.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// Global state to prevent multiple clicks
let isNavigating = false;
let navigationTimeout = null;

function initializeApp() {
    console.log('Initializing Stitch Productivity Tool...');
    loadAllImages();
    initTheme();
    setDailyQuote();
    updateDate();
    setupEventListeners();
    console.log('App initialized successfully!');
}

function setSidebarGif() {
    const gifId = 'stitch-mood-gif';
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    setupNavigationListeners();
    setupUtilityListeners();
}

function setupUtilityListeners() {
    const refreshQuoteBtn = document.getElementById('refresh-quote');
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            dailyQuoteState.date = null;
            setDailyQuote();
        });
    }

    const refreshTimerGif = document.getElementById('refresh-timer-gif');
    if (refreshTimerGif) {
        refreshTimerGif.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            setRandomGif();
        });
    }    

    const refreshSidebarGif = document.getElementById('refresh-sidebar-gif');
    if (refreshSidebarGif) {
        refreshSidebarGif.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            setSidebarGif();
        });
    }
}

function setupNavigationListeners() {
    console.log('Setting up navigation listeners...');
    
    // Handle feature buttons with single click
    const featureButtons = document.querySelectorAll('.feature-button[data-page]');
    featureButtons.forEach(button => {
        // Add single click listener (remove existing listener prevention - it's unnecessary)
        button.addEventListener('click', handleFeatureButtonClick);
        
        // Prevent double-click from interfering
        button.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    // Handle sidebar menu items
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach(item => {
        // Add single click listener
        item.addEventListener('click', handleMenuItemClick);
        
        // Prevent double-click from interfering
        item.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });
}

// async function handleFeatureButtonClick(event) {
//     // Prevent default behavior and stop propagation
//     event.preventDefault();
//     event.stopPropagation();
    
//     // Prevent multiple rapid clicks with shorter timeout
//     if (isNavigating) {
//         return;
//     }
    
//     const button = event.currentTarget;
//     const pageName = button.getAttribute('data-page');
    
//     if (!pageName) {
//         console.error('No page name found on button');
//         return;
//     }
    
//     console.log(`Feature button clicked: ${pageName}`);
    
//     // Set navigation state
//     isNavigating = true;
    
//     // Add loading state
//     button.classList.add('loading');
    
//     try {
//         const result = await window.electronAPI.navigateTo(pageName);
        
//         if (result && result.success) {
//             console.log(`Successfully navigated to ${pageName}`);
//         } else {
//             console.error(`Failed to navigate to ${pageName}:`, result?.message || 'Unknown error');
//         }
//     } catch (error) {
//         console.error(`Navigation error for ${pageName}:`, error);
//     } finally {
//         // Reset button state immediately
//         button.classList.remove('loading');
        
//         // Reset navigation state after shorter delay
//         if (navigationTimeout) {
//             clearTimeout(navigationTimeout);
//         }
//         navigationTimeout = setTimeout(() => {
//             isNavigating = false;
//         }, 200);
//     }
// }
async function handleFeatureButtonClick(event) {
    // Prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent multiple rapid clicks with shorter timeout
    if (isNavigating) {
        return;
    }
    
    const button = event.currentTarget;
    const pageName = button.getAttribute('data-page');
    
    if (!pageName) {
        console.error('No page name found on button');
        return;
    }
    
    console.log(`Feature button clicked: ${pageName}`);
    
    // Set navigation state
    isNavigating = true;
    
    // Add loading state with spinner
    button.classList.add('loading');
    
    // Store original content and add spinner
    const originalHTML = button.innerHTML;
    button.setAttribute('data-original-html', originalHTML);
    button.innerHTML = '<div class="loader"></div>';
    button.disabled = true;
    
    try {
        const result = await window.electronAPI.navigateTo(pageName);
        
        if (result && result.success) {
            console.log(`Successfully navigated to ${pageName}`);
        } else {
            console.error(`Failed to navigate to ${pageName}:`, result?.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Navigation error for ${pageName}:`, error);
    } finally {
        // Reset button state
        button.classList.remove('loading');
        button.disabled = false;
        
        // Restore original content
        const storedHTML = button.getAttribute('data-original-html');
        if (storedHTML) {
            button.innerHTML = storedHTML;
            button.removeAttribute('data-original-html');
        }
        
        // Reset navigation state after shorter delay
        if (navigationTimeout) {
            clearTimeout(navigationTimeout);
        }
        navigationTimeout = setTimeout(() => {
            isNavigating = false;
        }, 200);
    }
}

async function handleMenuItemClick(event) {
    // Prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (isNavigating) {
        return;
    }
    
    const item = event.currentTarget;
    const pageName = item.getAttribute('data-page');
    
    if (!pageName || pageName === 'index') {
        return;
    }
    
    console.log(`Menu item clicked: ${pageName}`);
    
    // Set navigation state
    isNavigating = true;
    
    // Update menu item active state
    document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
    item.classList.add('active');
    
    try {
        const result = await window.electronAPI.navigateTo(pageName);
        
        if (result && result.success) {
            console.log(`Successfully navigated to ${pageName}`);
        } else {
            console.error(`Failed to navigate to ${pageName}:`, result?.message || 'Unknown error');
            // Reset active state on error
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            const indexItem = document.querySelector('.menu-item[data-page="index"]');
            if (indexItem) {
                indexItem.classList.add('active');
            }
        }
    } catch (error) {
        console.error(`Navigation error for ${pageName}:`, error);
        // Reset active state on error
        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        const indexItem = document.querySelector('.menu-item[data-page="index"]');
        if (indexItem) {
            indexItem.classList.add('active');
        }
    } finally {
        // Reset navigation state after shorter delay
        if (navigationTimeout) {
            clearTimeout(navigationTimeout);
        }
        navigationTimeout = setTimeout(() => {
            isNavigating = false;
        }, 200);
    }
}

// Initialize gamification system
const gamification = new GamificationSystem();
const gamificationUI = new GamificationUI(gamification);

// Setup gamification widget
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        const gamificationWidget = document.createElement('div');
        gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
        mainContainer.appendChild(gamificationWidget);
        
        // Update gamification stats periodically
        setInterval(() => {
            if (gamificationWidget && !document.hidden) {
                gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
            }
        }, 30000);
    }
});

// Module exports for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setTheme,
        toggleTheme,
        setImage,
        setRandomGif,
        setSidebarGif,
        handleFeatureButtonClick,
        handleMenuItemClick
    };
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('Landing page unloading...');
    isNavigating = false;
});

// Handle renderer errors
window.addEventListener('error', (error) => {
    console.error('Renderer process error:', error);
    isNavigating = false;
});

// Expose app functions globally
window.stitchApp = {
    setTheme,
    toggleTheme,
    setRandomGif,
    setSidebarGif,
    navigateTo: async (pageName) => {
        if (!isNavigating) {
            return await window.electronAPI.navigateTo(pageName);
        }
        return { success: false, message: 'Navigation already in progress' };
    },
    isNavigating: () => isNavigating
};