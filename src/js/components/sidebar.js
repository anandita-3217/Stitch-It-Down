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
    }
    
    bindEvents() {
        // Toggle sidebar
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        
        // Menu item clicks
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('active');
        
        // Add stagger animation to menu items
        if (this.sidebar.classList.contains('open')) {
            this.animateMenuItems();
        }
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('active');
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
    
    handleNavigation(e) {
        const clickedItem = e.currentTarget;
        const page = clickedItem.dataset.page;
        
        if (page === this.currentPage) return;
        
        // Update active state
        this.menuItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');
        
        // Navigate to page
        this.navigateToPage(page);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }
    
    navigateToPage(page) {
        this.currentPage = page;
        
        // For now, we'll use window.location to navigate
        // Later you can replace this with your Electron IPC
        if (page !== 'index') {
            window.location.href = `${page}.html`;
        }
        
        // If you want to use Electron IPC instead:
        // if (window.electronAPI) {
        //     window.electronAPI.navigateTo(page);
        // }
    }
    
    setActivePage() {
        // Determine current page from URL or other method
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop().replace('.html', '') || 'index';
        
        this.menuItems.forEach(item => {
            if (item.dataset.page === fileName) {
                item.classList.add('active');
                this.currentPage = fileName;
            }
        });
    }
    
    handleKeyboard(e) {
        // Ctrl/Cmd + B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
    }
    
    loadRandomQuote() {
        const quotes = [
            "Ohana means family!",
            "Nobody gets left behind!",
            "I'm not fat, I'm fluffy!",
            "Cute and fluffy!",
            "Aloha, my friends!",
            "This is my family!"
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

export default Sidebar;