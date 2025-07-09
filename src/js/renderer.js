// // // TODO:4 Need to make my own version of Wordle.
// // // TODO:5 Need to make gamification and streaks. 
// // // TODO:6 Add a preload file properly.

// // CSS imports
// import '@css/main.css';
// import '@css/components/sidebar.css';
// import '@components/sidebar.js';
// import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';
// import { GamificationSystem, GamificationUI } from '@js/gamification';
// import '@css//gamification.css';

// import 'bootstrap-icons/font/bootstrap-icons.css';


// function initializeApp() {
//     console.log('Initializing Stitch Productivity Tool...');
//     loadAllImages();
//     initTheme();
//     setDailyQuote();
//     updateDate();
//     // Set up event listeners
//     setupEventListeners();
//     console.log('App initialized successfully!');
// }



// function setSidebarGif() {
//     // Sets a random gif everytime the app starts
//     const gifId = 'stitch-mood-gif'; // Your <img> ID
//     const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
//     setImage(gifId, 'gifs', randomKey);
// }

// function setupEventListeners() {
//     console.log('Setting up event listeners...');
    
//     // Add any additional event listeners here
//     // For example, if you have navigation buttons, productivity tool controls, etc.
    
//     // Example: Add refresh quote button if it exists
//     const refreshQuoteBtn = document.getElementById('refresh-quote');
//     if (refreshQuoteBtn) {
//         refreshQuoteBtn.addEventListener('click', () => {
//             // Force refresh the quote
//             dailyQuoteState.date = null;
//             setDailyQuote();
//         });
//     }
    
//     // Example: Add random gif refresh buttons
//     const refreshTimerGif = document.getElementById('refresh-timer-gif');
//     if (refreshTimerGif) {
//         refreshTimerGif.addEventListener('click', setRandomGif);
//     }
    
//     const refreshSidebarGif = document.getElementById('refresh-sidebar-gif');
//     if (refreshSidebarGif) {
//         refreshSidebarGif.addEventListener('click', setSidebarGif);
//     }
// }

// // Initialize gamification system
// const gamification = new GamificationSystem();
// const gamificationUI = new GamificationUI(gamification);

// // Add gamification widget to main page
// document.addEventListener('DOMContentLoaded', () => {
//   const mainContainer = document.getElementById('main-container');
//   const gamificationWidget = document.createElement('div');
//   gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
//   mainContainer.appendChild(gamificationWidget);
  
//   // Update widget every 30 seconds
//   setInterval(() => {
//     gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
//   }, 30000);
// });






// // Export functions for potential use in other modules
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = {
//         initializeApp,
//         setTheme,
//         toggleTheme,
//         // getRandomQuote,
//         // getRandomGifKey,
//         // getCurrentTheme,
//         setImage,
//         setRandomGif,
//         setSidebarGif
//     };
// }

// // Initialize when DOM is ready
// document.addEventListener('DOMContentLoaded', initializeApp);

// // Handle window events
// window.addEventListener('beforeunload', () => {
//     console.log('Landing page unloading...');
//     // Clean up any intervals or event listeners if needed
// });

// // Electron-specific: Handle renderer process errors
// window.addEventListener('error', (error) => {
//     console.error('Renderer process error:', error);
// });

// // Optional: Expose some functions to global scope for debugging
// window.stitchApp = {
//     setTheme,
//     toggleTheme,
//     setRandomGif,
//     setSidebarGif,
//     // getRandomQuote,
//     // getCurrentTheme
// };
// CSS imports
import '@css/main.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import {setImage,setDailyQuote,setRandomGif,loadAllImages,initTheme,setTheme,toggleTheme,updateDate,updateClock} from '@components/utils.js';
import { GamificationSystem, GamificationUI } from '@js/gamification';
import '@css//gamification.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function initializeApp() {
    console.log('Initializing Stitch Productivity Tool...');
    loadAllImages();
    initTheme();
    setDailyQuote();
    updateDate();
    // Set up event listeners
    setupEventListeners();
    console.log('App initialized successfully!');
}

function setSidebarGif() {
    // Sets a random gif everytime the app starts
    const gifId = 'stitch-mood-gif'; // Your <img> ID
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Set up navigation for feature buttons
    setupNavigationListeners();
    
    // Add any additional event listeners here
    
    // Example: Add refresh quote button if it exists
    const refreshQuoteBtn = document.getElementById('refresh-quote');
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', () => {
            // Force refresh the quote
            dailyQuoteState.date = null;
            setDailyQuote();
        });
    }
    
    // Example: Add random gif refresh buttons
    const refreshTimerGif = document.getElementById('refresh-timer-gif');
    if (refreshTimerGif) {
        refreshTimerGif.addEventListener('click', setRandomGif);
    }
    
    const refreshSidebarGif = document.getElementById('refresh-sidebar-gif');
    if (refreshSidebarGif) {
        refreshSidebarGif.addEventListener('click', setSidebarGif);
    }
}

function setupNavigationListeners() {
    console.log('Setting up navigation listeners...');
    
    // Handle feature button clicks
    const featureButtons = document.querySelectorAll('.feature-button[data-page]');
    featureButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const pageName = button.getAttribute('data-page');
            console.log(`Navigating to page: ${pageName}`);
            
            // Add visual feedback
            button.classList.add('loading');
            
            try {
                // Use the electronAPI to navigate
                await window.electronAPI.navigateTo(pageName);
                console.log(`Successfully navigated to ${pageName}`);
            } catch (error) {
                console.error(`Failed to navigate to ${pageName}:`, error);
                // You could show an error message to the user here
            } finally {
                // Remove loading state
                button.classList.remove('loading');
            }
        });
    });
    
    // Handle sidebar menu clicks
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach(item => {
        item.addEventListener('click', async (event) => {
            event.preventDefault();
            const pageName = item.getAttribute('data-page');
            
            // Skip if clicking on dashboard (current page)
            if (pageName === 'index') {
                return;
            }
            
            console.log(`Navigating to page from sidebar: ${pageName}`);
            
            // Update active state
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            try {
                await window.electronAPI.navigateTo(pageName);
                console.log(`Successfully navigated to ${pageName}`);
            } catch (error) {
                console.error(`Failed to navigate to ${pageName}:`, error);
                // Revert active state on error
                document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
                document.querySelector('.menu-item[data-page="index"]').classList.add('active');
            }
        });
    });
}

// Initialize gamification system
const gamification = new GamificationSystem();
const gamificationUI = new GamificationUI(gamification);

// Add gamification widget to main page
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const gamificationWidget = document.createElement('div');
    gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
    mainContainer.appendChild(gamificationWidget);
    
    // Update widget every 30 seconds
    setInterval(() => {
        gamificationWidget.innerHTML = gamificationUI.createStatsWidget();
    }, 30000);
});

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setTheme,
        toggleTheme,
        setImage,
        setRandomGif,
        setSidebarGif
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle window events
window.addEventListener('beforeunload', () => {
    console.log('Landing page unloading...');
    // Clean up any intervals or event listeners if needed
});

// Electron-specific: Handle renderer process errors
window.addEventListener('error', (error) => {
    console.error('Renderer process error:', error);
});

// Optional: Expose some functions to global scope for debugging
window.stitchApp = {
    setTheme,
    toggleTheme,
    setRandomGif,
    setSidebarGif,
    navigateTo: (pageName) => window.electronAPI.navigateTo(pageName)
};