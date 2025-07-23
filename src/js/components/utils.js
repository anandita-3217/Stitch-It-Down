// import stitchHappy from '@assets/images/characters/stitch-happy.png';
// import stitchIcon from '@assets/images/characters/stitch-icon.png';
// import stitchWink from '@assets/images/characters/stitch-wink.png';
// import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
// import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';

// import stitchClothes from '@assets/gifs/stitch-clothes.gif';
// import stitchDancing from '@assets/gifs/stitch-dancing.gif';
// import stitchEating from '@assets/gifs/stitch-eating.gif';
// import stitchFrustrated from '@assets/gifs/stitch-frustrated.gif';
// import stitchHyping from '@assets/gifs/stitch-hyping.gif';
// import stitchLove from '@assets/gifs/stitch-love.gif';
// import stitchShocked from '@assets/gifs/stitch-shocked.gif';
// import stitchSinging from '@assets/gifs/stitch-singing.gif';
// import stitchSleeping from '@assets/gifs/stitch-sleeping.gif';
// import stitchTantrum from '@assets/gifs/stitch-tantrum.gif';


// import 'bootstrap-icons/font/bootstrap-icons.css';

// // Create an image registry
// const images = {
//     characters: {
//         happy: stitchHappy,
//         icon: stitchIcon,
//         wink: stitchWink,
//         corner1: stitchCorner1,
//         corner2: stitchCorner2
//     },
//     gifs: {
//         clothes: stitchClothes,
//         dancing: stitchDancing,
//         eating: stitchEating,
//         frustrated: stitchFrustrated,
//         hyping: stitchHyping,
//         love: stitchLove,
//         shocked: stitchShocked,
//         singing: stitchSinging,
//         sleeping: stitchSleeping,
//         tantrum: stitchTantrum
//     }
// };
// const gifKeys = [
//     'clothes',
//     'dancing',
//     'eating',
//     'frustrated',
//     'hyping',
//     'love',
//     'shocked',
//     'singing',
//     'sleeping',
//     'tantrum'
// ];
// const quotes = [
//     "Ohana means family. Family means nobody gets left behind or forgotten.",
//     "This is my family. I found it all on my own. It's little, and broken, but still good. Yeah, still good.",
//     "Also cute and fluffy!",
//     "Aloha! Today is a new day to make progress!",
//     "Sometimes you try your hardest, but things don't work out. Sometimes things don't go according to plan.",
//     "I like you better as you.",
//     "Remember to feed your fish! If you give him food, he will be your friend.",
//     "Family is always there for you, even when no one else is.",
//     "Just because we look different doesn't mean we aren't family."
// ];
// function setDailyQuote() {
//     const quoteElement = document.querySelector('.daily-quote');
//     if (!quoteElement) {
//         console.warn('Daily quote element not found (.daily-quote)');
//         return;
//     }
    
//     const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-30"
//     const stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};
    
//     // If we already have a quote for today, use it
//     if (stored.date === today && stored.quote) {
//         quoteElement.textContent = stored.quote;
//         return;
//     }
    
//     // Generate a consistent index based on the date
//     // This ensures the same quote appears for the entire day
//     const dateHash = today.split('-').reduce((hash, part) => {
//         return hash + parseInt(part);
//     }, 0);
    
//     const quoteIndex = dateHash % quotes.length;
//     const todaysQuote = quotes[quoteIndex];
    
//     // Store the quote for today
//     localStorage.setItem('dailyQuote', JSON.stringify({
//         date: today,
//         quote: todaysQuote
//     }));
    
//     // Display the quote
//     quoteElement.textContent = todaysQuote;
// }


// function setImage(elementId, category, imageName) {
//     // sets an image to a given elementId
//     const element = document.getElementById(elementId);
//     if (element && images[category] && images[category][imageName]) {
//         element.src = images[category][imageName];
//     }
// }

// function setRandomGif() {
//     // Sets a random gif everytime the app starts
//     const gifId = 'stitchTimer'; // Your <img> ID
//     const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
//     setImage(gifId, 'gifs', randomKey);
// }
// function setSidebarGif() {
//     // Sets a random gif everytime the app starts
//     const gifId = 'stitch-mood-gif'; // Your <img> ID
//     const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
//     setImage(gifId, 'gifs', randomKey);
// }
// function loadAllImages() {
//     // Load all static character images
//     setImage('happy-stitch', 'characters', 'happy');
//     setImage('icon-stitch', 'characters', 'icon');
//     setImage('wink-stitch', 'characters', 'wink');
//     setImage('corner1-stitch', 'characters', 'corner1');
//     setImage('corner2-stitch', 'characters','corner2');
    
//     // Load all GIF images (for preloading or other uses)
//     setImage('clothes-stitch', 'gifs', 'clothes');
//     setImage('dancing-stitch', 'gifs', 'dancing');
//     setImage('eating-stitch', 'gifs', 'eating');
//     setImage('frustrated-stitch', 'gifs', 'frustrated');
//     setImage('hyping-stitch', 'gifs', 'hyping');
//     setImage('love-stitch', 'gifs', 'love');
//     setImage('shocked-stitch', 'gifs', 'shocked');
//     setImage('singing-stitch', 'gifs', 'singing');
//     setImage('tantrum-stitch', 'gifs', 'tantrum');
    
//     // Set random gif for the timer
//     setRandomGif();
//     setSidebarGif();
// }
// //  Potential theme toggle for smaller screens
// // function initTheme() {
// //     let savedTheme = 'light'; // default
// //     try {
// //         savedTheme = localStorage.getItem('stitchTheme') || 'light';
// //     } catch (error) {
// //         console.warn('localStorage not available, using default theme');
// //     }
    
// //     setTheme(savedTheme);
    
// //     // Set up the theme toggle event listener
// //     const themeToggle = document.querySelector('.theme-checkbox');
// //     if (themeToggle) {
// //         themeToggle.addEventListener('change', toggleTheme);
// //         themeToggle.checked = savedTheme === 'dark';
// //     } else {
// //         console.error('Theme toggle element not found');
// //     }
// // }

// // function setTheme(theme) {
// //     // Validate theme value
// //     if (theme !== 'light' && theme !== 'dark') {
// //         theme = 'light';
// //     }
    
// //     document.documentElement.setAttribute('data-theme', theme);
// //     document.body.setAttribute('data-theme', theme); // Also set on body for better CSS targeting
    
// //     // Save to localStorage if available
// //     try {
// //         localStorage.setItem('stitchTheme', theme);
// //     } catch (error) {
// //         console.warn('Could not save theme to localStorage');
// //     }
    
// //     // Update toggle state
// //     const themeToggle = document.querySelector('.theme-checkbox');
// //     if (themeToggle) {
// //         themeToggle.checked = theme === 'dark';
// //     }
    
// //     console.log(`Theme set to: ${theme}`); // Debug log
// // }

// // function toggleTheme() {
// //     const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
// //     const newTheme = currentTheme === 'light' ? 'dark' : 'light';
// //     console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
// //     setTheme(newTheme);
// // }


// function initTheme() {
//     let savedTheme = 'light'; // default
//     try {
//         savedTheme = localStorage.getItem('stitchTheme') || 'light';
//     } catch (error) {
//         console.warn('localStorage not available, using default theme');
//     }
    
//     setTheme(savedTheme);
    
//     // Set up the theme toggle event listener
//     const themeToggle = document.getElementById('themeToggle');
//     if (themeToggle) {
//         themeToggle.addEventListener('change', toggleTheme);
//         themeToggle.checked = savedTheme === 'dark';
//     } else {
//         console.error('Theme toggle element not found');
//     }
// }

// function setTheme(theme) {
//     // Validate theme value
//     if (theme !== 'light' && theme !== 'dark') {
//         theme = 'light';
//     }
    
//     document.documentElement.setAttribute('data-theme', theme);
//     document.body.setAttribute('data-theme', theme); // Also set on body for better CSS targeting
    
//     // Save to localStorage if available
//     try {
//         localStorage.setItem('stitchTheme', theme);
//     } catch (error) {
//         console.warn('Could not save theme to localStorage');
//     }
    
//     // Update toggle state
//     const themeToggle = document.getElementById('themeToggle');
//     if (themeToggle) {
//         themeToggle.checked = theme === 'dark';
//     }
    
//     console.log(`Theme set to: ${theme}`); // Debug log
// }

// function toggleTheme() {
//     const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
//     const newTheme = currentTheme === 'light' ? 'dark' : 'light';
//     console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
//     setTheme(newTheme);
// }
// // Date and Time


// function updateDate() {
//     const now = new Date();
    
//     // Get day of week
//     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const currentDay = days[now.getDay()];
    
//     // Get date
//     const currentDate = now.getDate();
    
//     // Get month
//     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     const currentMonth = months[now.getMonth()];
    
//     // Update the HTML elements
//     const dayElement = document.getElementById('current-day');
//     const dateElement = document.getElementById('current-date');
//     const monthElement = document.getElementById('current-month');
    
//     if (dayElement) dayElement.textContent = currentDay;
//     if (dateElement) dateElement.textContent = currentDate;
//     if (monthElement) monthElement.textContent = currentMonth;
    
//     updateClock();
// }

// function updateClock() {
//     const now = new Date();
//     let hours = now.getHours();
//     let minutes = now.getMinutes();
//     let seconds = now.getSeconds();
    
//     // Add leading zeros
//     hours = hours < 10 ? '0' + hours : hours;
//     minutes = minutes < 10 ? '0' + minutes : minutes;
//     seconds = seconds < 10 ? '0' + seconds : seconds;
    
//     // Format time string
//     const timeString = `${hours}:${minutes}:${seconds}`;

//     // Update clock element
//     const clockElement = document.getElementById('digital-clock');
//     if (clockElement) {
//         clockElement.textContent = timeString;
        
//         // Optional: Add blink effect to the colons
//         const pulseEffect = Math.floor(now.getSeconds()) % 2 === 0 ? 'pulse' : '';
//         clockElement.className = `digital-clock ${pulseEffect}`;
//     }
    
//     // Update every second
//     setTimeout(updateClock, 1000);

// }
// // Add these functions to your utils.js file

// /**
//  * Detects URLs in text and converts them to clickable links
//  * @param {string} text - The text to process
//  * @returns {string} - HTML string with links
//  */
// export function detectAndCreateLinks(text) {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
// }

// /**
//  * Formats timestamp to human-readable format
//  * @param {string} timestamp - ISO timestamp string
//  * @returns {string} - Formatted timestamp
//  */
// export function formatTimestamp(timestamp) {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
//     if (diffMinutes < 1) {
//         return 'Just now';
//     } else if (diffMinutes < 60) {
//         return `${diffMinutes}m ago`;
//     } else if (diffHours < 24) {
//         return `${diffHours}h ago`;
//     } else if (diffDays < 7) {
//         return `${diffDays}d ago`;
//     } else {
//         return date.toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric',
//             year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//         });
//     }
// }

// /**
//  * Closes any open modal by removing it from DOM
//  */
// export function closeModal() {
//     const modals = document.querySelectorAll('.task-frequency-modal, .task-edit-modal');
//     modals.forEach(modal => {
//         if (modal && modal.parentNode) {
//             modal.parentNode.removeChild(modal);
//         }
//     });
    
//     // Also handle any backdrop/overlay
//     const backdrops = document.querySelectorAll('.modal-backdrop');
//     backdrops.forEach(backdrop => {
//         if (backdrop && backdrop.parentNode) {
//             backdrop.parentNode.removeChild(backdrop);
//         }
//     });
// }
// export {
//     setImage,
//     setDailyQuote,
//     setRandomGif,
//     loadAllImages,
//     initTheme,
//     setTheme,
//     toggleTheme,
//     updateDate,
//     updateClock,
//     images,
//     quotes,
//     gifKeys
// };
import stitchHappy from '@assets/images/characters/stitch-happy.png';
import stitchIcon from '@assets/images/characters/stitch-icon.png';
import stitchWink from '@assets/images/characters/stitch-wink.png';
import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';

import stitchClothes from '@assets/gifs/stitch-clothes.gif';
import stitchDancing from '@assets/gifs/stitch-dancing.gif';
import stitchEating from '@assets/gifs/stitch-eating.gif';
import stitchFrustrated from '@assets/gifs/stitch-frustrated.gif';
import stitchHyping from '@assets/gifs/stitch-hyping.gif';
import stitchLove from '@assets/gifs/stitch-love.gif';
import stitchShocked from '@assets/gifs/stitch-shocked.gif';
import stitchSinging from '@assets/gifs/stitch-singing.gif';
import stitchSleeping from '@assets/gifs/stitch-sleeping.gif';
import stitchTantrum from '@assets/gifs/stitch-tantrum.gif';

import 'bootstrap-icons/font/bootstrap-icons.css';

// ============================================================================
// ERROR HANDLER CLASS - Enhanced for Stitch App
// ============================================================================

class ErrorHandler {
    constructor(errorBoundaryId = 'errorBoundary') {
        this.errorBoundaryId = errorBoundaryId;
        this.isInitialized = false;
    }

    // Initialize error handling for the current page
    init() {
        if (this.isInitialized) {
            console.warn('ErrorHandler already initialized');
            return;
        }

        // Create error boundary if it doesn't exist
        this.ensureErrorBoundary();
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        this.isInitialized = true;
        console.log('ErrorHandler initialized successfully');
    }

    // Create Stitch-themed error boundary
    // ensureErrorBoundary() {
    //     let errorBoundary = document.getElementById(this.errorBoundaryId);
        
    //     if (!errorBoundary) {
    //         errorBoundary = document.createElement('div');
    //         errorBoundary.id = this.errorBoundaryId;
    //         errorBoundary.style.display = 'none';
    //         errorBoundary.innerHTML = `
    //             <div style="
    //                 position: fixed;
    //                 top: 0;
    //                 left: 0;
    //                 width: 100%;
    //                 height: 100%;
    //                 background: rgba(0,0,0,0.9);
    //                 display: flex;
    //                 align-items: center;
    //                 justify-content: center;
    //                 z-index: 9999;
    //                 color: white;
    //                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    //             ">
    //                 <div style="
    //                     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //                     padding: 2.5rem;
    //                     border-radius: 15px;
    //                     text-align: center;
    //                     max-width: 450px;
    //                     box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    //                     border: 2px solid rgba(255,255,255,0.1);
    //                 ">
    //                     <h2 style="margin-top: 0; color: #ff6b6b; font-size: 1.5rem;">Ohana Error Detected! 🏝️</h2>
    //                     <p style="margin: 1rem 0; color: #e8e8e8; line-height: 1.5;">
    //                         Something went wrong in our Stitch app! Don't worry, we'll get back to the fun stuff soon.
    //                     </p>
    //                     <div style="margin: 1.5rem 0;">
    //                         <button onclick="location.reload()" style="
    //                             background: linear-gradient(45deg, #4CAF50, #45a049);
    //                             color: white;
    //                             border: none;
    //                             padding: 0.75rem 1.5rem;
    //                             border-radius: 25px;
    //                             cursor: pointer;
    //                             font-size: 1rem;
    //                             font-weight: bold;
    //                             margin: 0 0.5rem;
    //                             transition: transform 0.2s ease;
    //                         " onmouseover="this.style.transform='scale(1.05)'" 
    //                            onmouseout="this.style.transform='scale(1)'">
    //                             🔄 Reload Page
    //                         </button>
    //                         <button onclick="document.getElementById('${this.errorBoundaryId}').style.display='none'" style="
    //                             background: linear-gradient(45deg, #f44336, #da190b);
    //                             color: white;
    //                             border: none;
    //                             padding: 0.75rem 1.5rem;
    //                             border-radius: 25px;
    //                             cursor: pointer;
    //                             font-size: 1rem;
    //                             font-weight: bold;
    //                             margin: 0 0.5rem;
    //                             transition: transform 0.2s ease;
    //                         " onmouseover="this.style.transform='scale(1.05)'" 
    //                            onmouseout="this.style.transform='scale(1)'">
    //                             ❌ Close
    //                         </button>
    //                     </div>
    //                     <p style="font-size: 0.8rem; color: #bbb; margin-top: 1rem;">
    //                         Check the console for technical details
    //                     </p>
    //                 </div>
    //             </div>
    //         `;
    //         document.body.appendChild(errorBoundary);
    //     }
    // }
    // Create simple error boundary that uses external CSS
ensureErrorBoundary() {
    let errorBoundary = document.getElementById(this.errorBoundaryId);
    
    if (!errorBoundary) {
        errorBoundary = document.createElement('div');
        errorBoundary.id = this.errorBoundaryId;
        errorBoundary.style.display = 'none';
        errorBoundary.innerHTML = `
            <h2>Something went wrong</h2>
            <p>The app encountered an error. Check the console for details.</p>
            <button onclick="location.reload()"><i class="bi bi-arrow-repeat"></i> Reload Page</button>
            <button onclick="document.getElementById('${this.errorBoundaryId}').style.display='none'">× Close</button>
        `;
        document.body.appendChild(errorBoundary);
    }
}

    // Set up global error event listeners
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showErrorBoundary();
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showErrorBoundary();
        });
    }

    // Show the error boundary
    showErrorBoundary() {
        const errorBoundary = document.getElementById(this.errorBoundaryId);
        if (errorBoundary) {
            errorBoundary.style.display = 'block';
        }
    }

    // Hide the error boundary
    hideErrorBoundary() {
        const errorBoundary = document.getElementById(this.errorBoundaryId);
        if (errorBoundary) {
            errorBoundary.style.display = 'none';
        }
    }

    // Try-catch wrapper for functions
    wrapFunction(fn, context = 'Function') {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (error) {
                console.error(`Error in ${context}:`, error);
                this.showErrorBoundary();
                throw error;
            }
        };
    }

    // Promise wrapper for async operations
    wrapPromise(promise, context = 'Promise') {
        return promise.catch(error => {
            console.error(`Error in ${context}:`, error);
            this.showErrorBoundary();
            throw error;
        });
    }

    // Safe DOM operation wrapper
    safeDOMOperation(operation, context = 'DOM Operation') {
        try {
            return operation();
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            // For DOM operations, we might not want to show error boundary
            // unless it's critical, so just log the error
            return null;
        }
    }

    // Clean up error handlers (useful for SPA navigation)
    destroy() {
        // Remove error boundary from DOM
        const errorBoundary = document.getElementById(this.errorBoundaryId);
        if (errorBoundary) {
            errorBoundary.remove();
        }
        
        this.isInitialized = false;
        console.log('ErrorHandler destroyed');
    }
}

// Create a global instance
const errorHandler = new ErrorHandler();

// ============================================================================
// IMAGE REGISTRY AND MANAGEMENT
// ============================================================================

const images = {
    characters: {
        happy: stitchHappy,
        icon: stitchIcon,
        wink: stitchWink,
        corner1: stitchCorner1,
        corner2: stitchCorner2
    },
    gifs: {
        clothes: stitchClothes,
        dancing: stitchDancing,
        eating: stitchEating,
        frustrated: stitchFrustrated,
        hyping: stitchHyping,
        love: stitchLove,
        shocked: stitchShocked,
        singing: stitchSinging,
        sleeping: stitchSleeping,
        tantrum: stitchTantrum
    }
};

const gifKeys = [
    'clothes', 'dancing', 'eating', 'frustrated', 'hyping',
    'love', 'shocked', 'singing', 'sleeping', 'tantrum'
];

const quotes = [
    "Ohana means family. Family means nobody gets left behind or forgotten.",
    "This is my family. I found it all on my own. It's little, and broken, but still good. Yeah, still good.",
    "Also cute and fluffy!",
    "Aloha! Today is a new day to make progress!",
    "Sometimes you try your hardest, but things don't work out. Sometimes things don't go according to plan.",
    "I like you better as you.",
    "Remember to feed your fish! If you give him food, he will be your friend.",
    "Family is always there for you, even when no one else is.",
    "Just because we look different doesn't mean we aren't family."
];

// ============================================================================
// ENHANCED UTILITY FUNCTIONS WITH ERROR HANDLING
// ============================================================================

function setDailyQuote() {
    return errorHandler.safeDOMOperation(() => {
        const quoteElement = document.querySelector('.daily-quote');
        if (!quoteElement) {
            console.warn('Daily quote element not found (.daily-quote)');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        let stored = {};
        
        try {
            stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
        }
        
        // If we already have a quote for today, use it
        if (stored.date === today && stored.quote) {
            quoteElement.textContent = stored.quote;
            return;
        }
        
        // Generate a consistent index based on the date
        const dateHash = today.split('-').reduce((hash, part) => {
            return hash + parseInt(part);
        }, 0);
        
        const quoteIndex = dateHash % quotes.length;
        const todaysQuote = quotes[quoteIndex];
        
        // Store the quote for today
        try {
            localStorage.setItem('dailyQuote', JSON.stringify({
                date: today,
                quote: todaysQuote
            }));
        } catch (error) {
            console.warn('Error saving to localStorage:', error);
        }
        
        // Display the quote
        quoteElement.textContent = todaysQuote;
    }, 'setDailyQuote');
}

function setImage(elementId, category, imageName) {
    return errorHandler.safeDOMOperation(() => {
        const element = document.getElementById(elementId);
        if (element && images[category] && images[category][imageName]) {
            element.src = images[category][imageName];
        }
    }, `setImage(${elementId})`);
}

function setRandomGif() {
    return errorHandler.safeDOMOperation(() => {
        const gifId = 'stitchTimer';
        const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
        setImage(gifId, 'gifs', randomKey);
    }, 'setRandomGif');
}

function setSidebarGif() {
    return errorHandler.safeDOMOperation(() => {
        const gifId = 'stitch-mood-gif';
        const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
        setImage(gifId, 'gifs', randomKey);
    }, 'setSidebarGif');
}

function loadAllImages() {
    return errorHandler.safeDOMOperation(() => {
        // Load all static character images
        setImage('happy-stitch', 'characters', 'happy');
        setImage('icon-stitch', 'characters', 'icon');
        setImage('wink-stitch', 'characters', 'wink');
        setImage('corner1-stitch', 'characters', 'corner1');
        setImage('corner2-stitch', 'characters','corner2');
        
        // Load all GIF images
        setImage('clothes-stitch', 'gifs', 'clothes');
        setImage('dancing-stitch', 'gifs', 'dancing');
        setImage('eating-stitch', 'gifs', 'eating');
        setImage('frustrated-stitch', 'gifs', 'frustrated');
        setImage('hyping-stitch', 'gifs', 'hyping');
        setImage('love-stitch', 'gifs', 'love');
        setImage('shocked-stitch', 'gifs', 'shocked');
        setImage('singing-stitch', 'gifs', 'singing');
        setImage('tantrum-stitch', 'gifs', 'tantrum');
        
        // Set random gifs
        setRandomGif();
        setSidebarGif();
    }, 'loadAllImages');
}

// ============================================================================
// THEME MANAGEMENT WITH ERROR HANDLING
// ============================================================================

function initTheme() {
    return errorHandler.safeDOMOperation(() => {
        let savedTheme = 'light';
        try {
            savedTheme = localStorage.getItem('stitchTheme') || 'light';
        } catch (error) {
            console.warn('localStorage not available, using default theme');
        }
        
        setTheme(savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', toggleTheme);
            themeToggle.checked = savedTheme === 'dark';
        } else {
            console.error('Theme toggle element not found');
        }
    }, 'initTheme');
}

function setTheme(theme) {
    return errorHandler.safeDOMOperation(() => {
        if (theme !== 'light' && theme !== 'dark') {
            theme = 'light';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        try {
            localStorage.setItem('stitchTheme', theme);
        } catch (error) {
            console.warn('Could not save theme to localStorage');
        }
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
        
        console.log(`Theme set to: ${theme}`);
    }, 'setTheme');
}

function toggleTheme() {
    return errorHandler.safeDOMOperation(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
        setTheme(newTheme);
    }, 'toggleTheme');
}

// ============================================================================
// DATE AND TIME FUNCTIONS WITH ERROR HANDLING
// ============================================================================

function updateDate() {
    return errorHandler.safeDOMOperation(() => {
        const now = new Date();
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        
        const currentDate = now.getDate();
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = months[now.getMonth()];
        
        const dayElement = document.getElementById('current-day');
        const dateElement = document.getElementById('current-date');
        const monthElement = document.getElementById('current-month');
        
        if (dayElement) dayElement.textContent = currentDay;
        if (dateElement) dateElement.textContent = currentDate;
        if (monthElement) monthElement.textContent = currentMonth;
        
        updateClock();
    }, 'updateDate');
}

function updateClock() {
    return errorHandler.safeDOMOperation(() => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        const timeString = `${hours}:${minutes}:${seconds}`;

        const clockElement = document.getElementById('digital-clock');
        if (clockElement) {
            clockElement.textContent = timeString;
            
            const pulseEffect = Math.floor(now.getSeconds()) % 2 === 0 ? 'pulse' : '';
            clockElement.className = `digital-clock ${pulseEffect}`;
        }
        
        // Use setTimeout with error handling
        setTimeout(() => {
            try {
                updateClock();
            } catch (error) {
                console.error('Error in updateClock timeout:', error);
            }
        }, 1000);
    }, 'updateClock');
}

// ============================================================================
// UTILITY FUNCTIONS WITH ERROR HANDLING
// ============================================================================

export function detectAndCreateLinks(text) {
    try {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    } catch (error) {
        console.error('Error in detectAndCreateLinks:', error);
        return text; // Return original text if processing fails
    }
}

export function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    } catch (error) {
        console.error('Error in formatTimestamp:', error);
        return 'Invalid date';
    }
}

export function closeModal() {
    return errorHandler.safeDOMOperation(() => {
        const modals = document.querySelectorAll('.task-frequency-modal, .task-edit-modal');
        modals.forEach(modal => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
        });
    }, 'closeModal');
}

// ============================================================================
// INITIALIZATION AND EXPORTS
// ============================================================================

// Auto-initialize error handler when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            errorHandler.init();
        });
    } else {
        errorHandler.init();
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = errorHandler;
}

// Export all functions and objects
export {
    // Error handling
    ErrorHandler,
    errorHandler,
    
    // Image and content management
    setImage,
    setDailyQuote,
    setRandomGif,
    setSidebarGif,
    loadAllImages,
    images,
    quotes,
    gifKeys,
    
    // Theme management
    initTheme,
    setTheme,
    toggleTheme,
    
    // Date and time
    updateDate,
    updateClock
};