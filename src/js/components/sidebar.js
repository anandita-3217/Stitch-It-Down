class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.menuItems = document.querySelectorAll('.menu-item');
        this.currentPage = 'index';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setActivePage();
        this.loadRandomQuote();
        this.checkElectronAPI();
    }
    
    checkElectronAPI() {
        if (!window.electronAPI) {
            console.warn('Electron API not available. Running in browser mode.');
        }
    }
    
    bindEvents() {
        // Toggle sidebar
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }
        
        // Menu item clicks
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.toggle('open');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.toggle('active');
        }
        
        // Add stagger animation to menu items
        if (this.sidebar.classList.contains('open')) {
            this.animateMenuItems();
        }
    }
    
    closeSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('open');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
    }
    
    animateMenuItems() {
        this.menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }
    
    async handleNavigation(e) {
        e.preventDefault();
        
        const clickedItem = e.currentTarget;
        const page = clickedItem.dataset.page;
        
        if (!page) {
            console.warn('No page data found on menu item');
            return;
        }
        
        // Don't navigate if already on the same page
        if (page === this.currentPage) {
            return;
        }
        
        // Update active state
        this.updateActiveState(clickedItem);
        
        // Navigate to page
        await this.navigateToPage(page);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }
    
    updateActiveState(activeItem) {
        this.menuItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }
    
    async navigateToPage(page) {
        try {
            if (window.electronAPI) {
                // Use Electron IPC for navigation
                await window.electronAPI.navigateTo(page);
                this.currentPage = page;
                console.log(`Navigated to: ${page}`);
            } else {
                // Fallback for browser testing
                console.log(`Would navigate to: ${page}`);
                this.currentPage = page;
            }
        } catch (error) {
            console.error('Navigation error:', error);
            // Show user-friendly error message
            this.showNavigationError(page);
        }
    }
    
    showNavigationError(page) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'navigation-error';
        errorDiv.textContent = `Failed to navigate to ${page}. Please try again.`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    setActivePage() {
        // Try to determine current page from URL or default to index
        const currentPath = window.location.pathname;
        let currentPageName = 'index';
        
        // Extract page name from path if possible
        if (currentPath.includes('timer')) currentPageName = 'timer';
        else if (currentPath.includes('tasks')) currentPageName = 'tasks';
        else if (currentPath.includes('notes')) currentPageName = 'notes';
        else if (currentPath.includes('calendar')) currentPageName = 'calendar';
        else if (currentPath.includes('stats')) currentPageName = 'stats';
        else if (currentPath.includes('settings')) currentPageName = 'settings';
        
        this.currentPage = currentPageName;
        
        // Set active menu item
        this.menuItems.forEach(item => {
            if (item.dataset.page === currentPageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    handleKeyboard(e) {
        // Ctrl/Cmd + B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        // Number keys for quick navigation (1-7)
        if (e.altKey && e.key >= '1' && e.key <= '7') {
            e.preventDefault();
            const pages = ['index', 'timer', 'tasks', 'notes', 'calendar', 'stats', 'settings'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.navigateToPage(pages[pageIndex]);
            }
        }
    }
    
    loadRandomQuote() {
        const quotes = [
            "Ohana means family!",
            "Nobody gets left behind!",
            "I'm not fat, I'm fluffy!",
            "Cute and fluffy!",
            "Aloha, my friends!",
            "This is my family!",
            "Blue punch buggy! No punch back!",
            "Meega nala kweesta!",
            "Also cute and fluffy!"
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteElement = document.getElementById('sidebarQuote');
        if (quoteElement) {
            quoteElement.textContent = randomQuote;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sidebar;
}