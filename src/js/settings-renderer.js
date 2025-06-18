// CSS imports
import '@css/main.css'
import '@css/components/timer.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import '@components/timer.js';

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

// Bootstrap
// import 'bootstrap/dist/css/bootstrap.min.css';
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

// Global timer instance for this window
let timerInstance = null;

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

function initialize() {
    loadAllImages(); // Load all images including random gif
    initTheme();
    
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

console.log('Tasks page loaded');

// Add any tasks-specific functionality here
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Settings page DOM loaded');
//     // Settings page initialization
// });