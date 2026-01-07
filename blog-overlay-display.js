// Blog Overlay Display System
(function() {
    let currentSort = 'recent';
    let allPosts = [];

    // Load posts from localStorage
    function loadPosts() {
        const posts = localStorage.getItem('blogPosts');
        return posts ? JSON.parse(posts) : [];
    }

    // Sort posts
    function sortPosts(posts) {
        const sorted = [...posts];
        
        switch(currentSort) {
            case 'recent':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'rating-high':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'rating-low':
                sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                break;
        }
        
        return sorted;
    }

    // Display posts
    function displayPosts() {
        allPosts = loadPosts().filter(p => 
            p.status === 'published' && p.category === CATEGORY
        );

        const sortedPosts = sortPosts(allPosts);
        const container = document.getElementById('posts-grid');

        if (sortedPosts.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No posts yet. <a href="blog-manager.html" style="color: var(--accent); font-weight: 600;">Create your first post!</a></p>';
            return;
        }

        // Generate cards based on category
        if (CATEGORY === 'Updates') {
            container.innerHTML = sortedPosts.map((post, index) => `
                <div class="post-card update-card" onclick="openOverlay(${index})">
                    <h3 class="update-card-title">${post.title}</h3>
                    <div class="update-card-preview">${post.preview || ''}</div>
                    <div class="update-card-date">${formatDate(post.createdAt)}</div>
                </div>
            `).join('');
        } else if (CATEGORY === 'Book Reviews') {
            container.innerHTML = sortedPosts.map((post, index) => `
                <div class="post-card book-card" onclick="openOverlay(${index})">
                    <div class="book-card-cover">
                        ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}">` : ''}
                    </div>
                    <div class="book-card-info">
                        <h3 class="book-card-title">${post.title}</h3>
                        ${post.rating ? `<div class="book-card-rating">${'⭐'.repeat(post.rating)}</div>` : ''}
                    </div>
                </div>
            `).join('');
        } else if (CATEGORY === 'Video Plans') {
            container.innerHTML = sortedPosts.map((post, index) => `
                <div class="post-card video-card" onclick="openOverlay(${index})">
                    <div class="video-card-thumbnail">
                        ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}">` : ''}
                    </div>
                    <h3 class="video-card-title">${post.title}</h3>
                    <div class="video-card-date">${formatDate(post.createdAt)}</div>
                </div>
            `).join('');
        }
    }

    // Open overlay
    window.openOverlay = function(index) {
        const sortedPosts = sortPosts(allPosts);
        const post = sortedPosts[index];
        const overlay = document.getElementById('post-overlay');
        const details = document.getElementById('post-details');

        let overlayHTML = '';

        if (CATEGORY === 'Updates') {
            overlayHTML = `
                <div class="overlay-post overlay-update">
                    <div class="overlay-header">
                        <h2>${post.title}</h2>
                        <div class="post-meta">${formatDate(post.createdAt)}</div>
                    </div>
                    <div class="post-preview">${post.preview || ''}</div>
                    <div class="post-content">${formatContent(post.content)}</div>
                </div>
            `;
        } else if (CATEGORY === 'Book Reviews') {
            overlayHTML = `
                <div class="overlay-book">
                    <div class="overlay-book-cover">
                        ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}">` : ''}
                    </div>
                    <div class="overlay-book-info">
                        <h2>${post.title}</h2>
                        ${post.rating ? `<div class="overlay-book-rating">${'⭐'.repeat(post.rating)}</div>` : ''}
                        <div class="overlay-book-meta">${formatDate(post.createdAt)}</div>
                        <div class="post-content">${formatContent(post.content)}</div>
                    </div>
                </div>
            `;
        } else if (CATEGORY === 'Video Plans') {
            overlayHTML = `
                <div class="overlay-post overlay-video">
                    ${post.thumbnail ? `
                        <div class="video-thumbnail-large">
                            <img src="${post.thumbnail}" alt="${post.title}">
                        </div>
                    ` : ''}
                    <h2>${post.title}</h2>
                    <div class="post-meta">${formatDate(post.createdAt)}</div>
                    <div class="post-content">${formatContent(post.content)}</div>
                </div>
            `;
        }

        details.innerHTML = overlayHTML;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close overlay
    window.closeOverlay = function() {
        const overlay = document.getElementById('post-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close on outside click
    document.addEventListener('click', function(e) {
        const overlay = document.getElementById('post-overlay');
        if (e.target === overlay) {
            closeOverlay();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOverlay();
        }
    });

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Format content
    function formatContent(content) {
        return content.split('\n').map(para => {
            if (para.trim()) {
                return `<p>${para.trim()}</p>`;
            }
            return '';
        }).join('');
    }

    // Filter button handling
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentSort = this.dataset.sort;
                displayPosts();
            });
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        displayPosts();
        setupFilters();
    });
})();
