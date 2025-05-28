/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
// CSS imports
import '@css/main.css';
// PNG imports
import stitchHappy from '@assets/images/characters/stitch-happy.png';
import stitchIcon from '@assets/images/characters/stitch-icon.png';
import stitchWink from '@assets/images/characters/stitch-wink.png';
import stitchCorner1 from '@assets/images/characters/stitch-corner1.png';
import stitchCorner2 from '@assets/images/characters/stitch-corner2.png';
// GIF imports
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

function setImage(elementId, category, imageName) {
  const element = document.getElementById(elementId);
  if (element && images[category] && images[category][imageName]) {
    element.src = images[category][imageName];
  }
}

// Themes - Fixed and improved
function initTheme() {
    // Check if localStorage is available (it should be in Electron renderer)
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...'); // Debug log
    
    // Set up images
    setImage('happy-stitch', 'characters', 'happy');
    setImage('icon-stitch', 'characters', 'icon');
    setImage('wink-stitch', 'characters', 'wink');
    setImage('corner1-stitch', 'characters', 'corner1');
    setImage('corner2-stitch', 'characters','corner2');
    
    setImage('clothes-stitch', 'gifs', 'clothes');
    setImage('dancing-stitch', 'gifs', 'dancing');
    setImage('eating-stitch', 'gifs', 'eating');
    setImage('frustrated-stitch', 'gifs', 'frustrated');
    setImage('hyping-stitch', 'gifs', 'hyping');
    setImage('love-stitch', 'gifs', 'love');
    setImage('shocked-stitch', 'gifs', 'shocked');
    setImage('singing-stitch', 'gifs', 'singing');
    setImage('tantrum-stitch', 'gifs', 'tantrum');
    
    // Initialize theme system
    initTheme();
    
    // Initialize date and time
    updateDate();
});

// Alternative initialization in case DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

function initializeApp() {
    // Fallback initialization function
    if (!document.getElementById('themeToggle')?.hasAttribute('data-initialized')) {
        initTheme();
        updateDate();
        
        // Mark as initialized
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.setAttribute('data-initialized', 'true');
        }
    }
}