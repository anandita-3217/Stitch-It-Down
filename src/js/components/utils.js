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

// Create an image registry
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
    'clothes',
    'dancing',
    'eating',
    'frustrated',
    'hyping',
    'love',
    'shocked',
    'singing',
    'sleeping',
    'tantrum'
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


// function setDailyQuote() {
//     const quoteElement = document.querySelector('.daily-quote');
//     if (!quoteElement) return;
//     const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-30"
//     const stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};

//     if (stored.date === today && stored.quote) {
//         quoteElement.textContent = stored.quote;
//         return;
//     }
// }
function setDailyQuote() {
    const quoteElement = document.querySelector('.daily-quote');
    if (!quoteElement) {
        console.warn('Daily quote element not found (.daily-quote)');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-30"
    const stored = JSON.parse(localStorage.getItem('dailyQuote')) || {};
    
    // If we already have a quote for today, use it
    if (stored.date === today && stored.quote) {
        quoteElement.textContent = stored.quote;
        return;
    }
    
    // Generate a consistent index based on the date
    // This ensures the same quote appears for the entire day
    const dateHash = today.split('-').reduce((hash, part) => {
        return hash + parseInt(part);
    }, 0);
    
    const quoteIndex = dateHash % quotes.length;
    const todaysQuote = quotes[quoteIndex];
    
    // Store the quote for today
    localStorage.setItem('dailyQuote', JSON.stringify({
        date: today,
        quote: todaysQuote
    }));
    
    // Display the quote
    quoteElement.textContent = todaysQuote;
}


function setImage(elementId, category, imageName) {
    // sets an image to a given elementId
    const element = document.getElementById(elementId);
    if (element && images[category] && images[category][imageName]) {
        element.src = images[category][imageName];
    }
}

function setRandomGif() {
    // Sets a random gif everytime the app starts
    const gifId = 'stitchTimer'; // Your <img> ID
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}
function setSidebarGif() {
    // Sets a random gif everytime the app starts
    const gifId = 'stitch-mood-gif'; // Your <img> ID
    const randomKey = gifKeys[Math.floor(Math.random() * gifKeys.length)];
    setImage(gifId, 'gifs', randomKey);
}
function loadAllImages() {
    // Load all static character images
    setImage('happy-stitch', 'characters', 'happy');
    setImage('icon-stitch', 'characters', 'icon');
    setImage('wink-stitch', 'characters', 'wink');
    setImage('corner1-stitch', 'characters', 'corner1');
    setImage('corner2-stitch', 'characters','corner2');
    
    // Load all GIF images (for preloading or other uses)
    setImage('clothes-stitch', 'gifs', 'clothes');
    setImage('dancing-stitch', 'gifs', 'dancing');
    setImage('eating-stitch', 'gifs', 'eating');
    setImage('frustrated-stitch', 'gifs', 'frustrated');
    setImage('hyping-stitch', 'gifs', 'hyping');
    setImage('love-stitch', 'gifs', 'love');
    setImage('shocked-stitch', 'gifs', 'shocked');
    setImage('singing-stitch', 'gifs', 'singing');
    setImage('tantrum-stitch', 'gifs', 'tantrum');
    
    // Set random gif for the timer
    setRandomGif();
    setSidebarGif();
}
//  Potential theme toggle for smaller screens
// function initTheme() {
//     let savedTheme = 'light'; // default
//     try {
//         savedTheme = localStorage.getItem('stitchTheme') || 'light';
//     } catch (error) {
//         console.warn('localStorage not available, using default theme');
//     }
    
//     setTheme(savedTheme);
    
//     // Set up the theme toggle event listener
//     const themeToggle = document.querySelector('.theme-checkbox');
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
//     const themeToggle = document.querySelector('.theme-checkbox');
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


function initTheme() {
    let savedTheme = 'light'; // default
    try {
        savedTheme = localStorage.getItem('stitchTheme') || 'light';
    } catch (error) {
        console.warn('localStorage not available, using default theme');
    }
    
    setTheme(savedTheme);
    
    // Set up the theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
        themeToggle.checked = savedTheme === 'dark';
    } else {
        console.error('Theme toggle element not found');
    }
}

function setTheme(theme) {
    // Validate theme value
    if (theme !== 'light' && theme !== 'dark') {
        theme = 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme); // Also set on body for better CSS targeting
    
    // Save to localStorage if available
    try {
        localStorage.setItem('stitchTheme', theme);
    } catch (error) {
        console.warn('Could not save theme to localStorage');
    }
    
    // Update toggle state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
    }
    
    console.log(`Theme set to: ${theme}`); // Debug log
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
    setTheme(newTheme);
}
// Date and Time


function updateDate() {
    const now = new Date();
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    // Get date
    const currentDate = now.getDate();
    
    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = months[now.getMonth()];
    
    // Update the HTML elements
    const dayElement = document.getElementById('current-day');
    const dateElement = document.getElementById('current-date');
    const monthElement = document.getElementById('current-month');
    
    if (dayElement) dayElement.textContent = currentDay;
    if (dateElement) dateElement.textContent = currentDate;
    if (monthElement) monthElement.textContent = currentMonth;
    
    updateClock();
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Add leading zeros
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    // Format time string
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Update clock element
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.textContent = timeString;
        
        // Optional: Add blink effect to the colons
        const pulseEffect = Math.floor(now.getSeconds()) % 2 === 0 ? 'pulse' : '';
        clockElement.className = `digital-clock ${pulseEffect}`;
    }
    
    // Update every second
    setTimeout(updateClock, 1000);

}
// Add these functions to your utils.js file

/**
 * Detects URLs in text and converts them to clickable links
 * @param {string} text - The text to process
 * @returns {string} - HTML string with links
 */
export function detectAndCreateLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Formats timestamp to human-readable format
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted timestamp
 */
export function formatTimestamp(timestamp) {
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
}

/**
 * Closes any open modal by removing it from DOM
 */
export function closeModal() {
    const modals = document.querySelectorAll('.task-frequency-modal, .task-edit-modal');
    modals.forEach(modal => {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
    
    // Also handle any backdrop/overlay
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        if (backdrop && backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
        }
    });
}
export {
    setImage,
    setDailyQuote,
    setRandomGif,
    loadAllImages,
    initTheme,
    setTheme,
    toggleTheme,
    updateDate,
    updateClock,
    images,
    quotes,
    gifKeys
};