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

import '@css/main.css';
import stitchHappy from '@assets/images/characters/stitch-happy.png';
import stitchThinking from '@assets/images/characters/stitch-thinking.png';
import stitchWink from '@assets/images/characters/stitch-wink.png';
import stitchDancing from '@assets/gifs/stitch-dancing.gif';
import stitchEating from '@assets/gifs/stitch-eating.gif';

// Create an image registry
const images = {
  characters: {
    happy: stitchHappy,
    thinking: stitchThinking,
    wink: stitchWink
  },
  gifs: {
    dancing: stitchDancing,
    eating: stitchEating
  }
};

// Helper function to set images
function setImage(elementId, category, imageName) {
  const element = document.getElementById(elementId);
  if (element && images[category] && images[category][imageName]) {
    element.src = images[category][imageName];
  }
}

// Use it
document.addEventListener('DOMContentLoaded', () => {
  setImage('main-stitch', 'characters', 'happy');
  setImage('animated-stitch', 'gifs', 'dancing');
});

console.log('👋 This message is being logged by "renderer.js", included via webpack');
