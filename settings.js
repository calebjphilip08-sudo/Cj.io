// Settings Management System
(function() {
    // Default settings
    const defaultSettings = {
        layoutMode: 'header',
        animationSpeed: 'normal',
        reduceMotion: false,
        defaultYtChannel: 'cjphilip',
        letterboxdSort: 'recent',
        autoScroll: false
    };

    // Load settings from localStorage
    function loadSettings() {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading settings:', e);
                return defaultSettings;
            }
        }
        return defaultSettings;
    }

    // Save settings to localStorage
    function saveSettingsToStorage(settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }

    // Apply settings to the page
    function applySettings(settings) {
        // Apply layout mode
        if (settings.layoutMode === 'sidebar') {
            document.body.classList.add('sidebar-mode');
            localStorage.setItem('sidebarMode', 'true');
        } else {
            document.body.classList.remove('sidebar-mode');
            localStorage.setItem('sidebarMode', 'false');
        }

        // Apply animation speed
        document.documentElement.style.setProperty('--transition-speed', 
            settings.animationSpeed === 'slow' ? '1.2s' :
            settings.animationSpeed === 'fast' ? '0.4s' :
            settings.animationSpeed === 'none' ? '0s' : '0.8s'
        );

        // Apply reduce motion
        if (settings.reduceMotion) {
            document.body.classList.add('reduce-motion');
            document.documentElement.style.setProperty('--transition-speed', '0s');
        } else {
            document.body.classList.remove('reduce-motion');
        }

        // Store YouTube default channel preference
        localStorage.setItem('defaultYtChannel', settings.defaultYtChannel);

        // Store Letterboxd sort preference
        localStorage.setItem('letterboxdSort', settings.letterboxdSort);

        // Apply auto-scroll
        if (settings.autoScroll && !window.location.pathname.includes('settings.html')) {
            setTimeout(() => {
                const content = document.querySelector('.page-content-wrapper, .hero, main');
                if (content) {
                    content.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    }

    // Load and apply settings on page load
    document.addEventListener('DOMContentLoaded', function() {
        const settings = loadSettings();
        applySettings(settings);

        // If on settings page, populate form
        if (window.location.pathname.includes('settings.html')) {
            populateSettingsForm(settings);
        }
    });

    // Populate settings form
    function populateSettingsForm(settings) {
        document.getElementById('layout-mode').value = settings.layoutMode;
        document.getElementById('animation-speed').value = settings.animationSpeed;
        document.getElementById('reduce-motion').checked = settings.reduceMotion;
        document.getElementById('default-yt-channel').value = settings.defaultYtChannel;
        document.getElementById('letterboxd-sort').value = settings.letterboxdSort;
        document.getElementById('auto-scroll').checked = settings.autoScroll;
    }

    // Save settings from form
    window.saveSettings = function() {
        const settings = {
            layoutMode: document.getElementById('layout-mode').value,
            animationSpeed: document.getElementById('animation-speed').value,
            reduceMotion: document.getElementById('reduce-motion').checked,
            defaultYtChannel: document.getElementById('default-yt-channel').value,
            letterboxdSort: document.getElementById('letterboxd-sort').value,
            autoScroll: document.getElementById('auto-scroll').checked
        };

        saveSettingsToStorage(settings);
        applySettings(settings);

        // Show feedback
        showNotification('Settings saved successfully! ✓');
    };

    // Reset settings to defaults
    window.resetSettings = function() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('userSettings');
            localStorage.removeItem('sidebarMode');
            localStorage.removeItem('defaultYtChannel');
            localStorage.removeItem('letterboxdSort');
            
            applySettings(defaultSettings);
            
            if (window.location.pathname.includes('settings.html')) {
                populateSettingsForm(defaultSettings);
            }

            showNotification('Settings reset to defaults! ✓');
        }
    };

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.settings-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);

        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Export for other scripts to use
    window.getUserSettings = loadSettings;
})();
