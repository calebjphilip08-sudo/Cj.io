// Sidebar toggle functionality
(function() {
    // Check for saved preference
    const sidebarMode = localStorage.getItem('sidebarMode') === 'true';
    
    // Apply saved preference on page load
    if (sidebarMode) {
        document.body.classList.add('sidebar-mode');
    }
    
    // Toggle layout function (matches button onclick)
    window.toggleLayout = function() {
        document.body.classList.toggle('sidebar-mode');
        const isActive = document.body.classList.contains('sidebar-mode');
        localStorage.setItem('sidebarMode', isActive);
    };
    
    // Keep old name for backwards compatibility
    window.toggleSidebar = window.toggleLayout;
    
    // Handle dropdown clicks in sidebar mode
    document.addEventListener('DOMContentLoaded', function() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            
            toggle.addEventListener('click', function(e) {
                // Only handle click if in sidebar mode
                if (document.body.classList.contains('sidebar-mode')) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        });
    });
})();
