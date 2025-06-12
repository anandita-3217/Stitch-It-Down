import '@css/components/timer.css';
import '@css/components/sidebar.css';
import '@components/sidebar.js';
import '@components/timer.js';

// Timer-specific initialization
document.addEventListener('DOMContentLoaded', () => {
   // Initialize theme
   const savedTheme = localStorage.getItem('theme') || 'light';
   document.body.classList.toggle('dark-theme', savedTheme === 'dark');
   
   // Add some timer-specific enhancements
   addTimerEnhancements();
});

function addTimerEnhancements() {
   // Add keyboard shortcuts info
   const shortcutsInfo = document.createElement('div');
   shortcutsInfo.className = 'shortcuts-info';
   shortcutsInfo.innerHTML = `
       <div class="shortcuts-toggle" id="shortcutsToggle">?</div>
       <div class="shortcuts-panel" id="shortcutsPanel">
           <h4>Keyboard Shortcuts</h4>
           <div class="shortcut"><kbd>Space</kbd> Start/Pause timer</div>
           <div class="shortcut"><kbd>R</kbd> Reset timer</div>
           <div class="shortcut"><kbd>S</kbd> Skip session</div>
           <div class="shortcut"><kbd>Ctrl+B</kbd> Toggle sidebar</div>
       </div>
   `;
   document.body.appendChild(shortcutsInfo);
   
   // Add shortcuts panel toggle
   document.getElementById('shortcutsToggle').addEventListener('click', () => {
       document.getElementById('shortcutsPanel').classList.toggle('show');
   });
   
   // Add more keyboard shortcuts
   document.addEventListener('keydown', (e) => {
       if (e.target.matches('input')) return;
       
       switch(e.key.toLowerCase()) {
           case 'r':
               e.preventDefault();
               document.getElementById('resetBtn').click();
               break;
           case 's':
               e.preventDefault();
               document.getElementById('skipBtn').click();
               break;
       }
   });
}