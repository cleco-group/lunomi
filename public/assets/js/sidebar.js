function toggleSubMenu(element) {
    const subMenu = element.nextElementSibling;
    const isOpen = subMenu.classList.contains('open');
    
    // Close all other sub-menus (optional)
    document.querySelectorAll('.sub-menu').forEach(menu => {
        if (menu !== subMenu) {
            menu.classList.remove('open');
            menu.previousElementSibling.classList.remove('open');
        }
    });

    if (!isOpen) {
        subMenu.classList.add('open');
        element.classList.add('open');
    } else {
        subMenu.classList.remove('open');
        element.classList.remove('open');
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
}

// Auto-activate menu based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Check main menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });

    // Check sub-menu items
    document.querySelectorAll('.sub-menu-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
            // Open the parent sub-menu
            const parentMenu = item.closest('.sub-menu');
            if (parentMenu) {
                parentMenu.classList.add('open');
                parentMenu.previousElementSibling.classList.add('open');
            }
        }
    });
});
