// Blog Management System with Login and Custom Fields
(function() {
    const CORRECT_USERNAME = 'CJ Philip';
    const CORRECT_PASSWORD = 'CJMANSHOMETURF3';
    let currentFilterCategory = 'all';
    let currentThumbnail = null;

    // Check if already logged in
    function checkLogin() {
        const loggedIn = sessionStorage.getItem('blogManagerAuth');
        if (loggedIn === 'true') {
            showMainContent();
        }
    }

    // Attempt login
    window.attemptLogin = function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            sessionStorage.setItem('blogManagerAuth', 'true');
            errorElement.textContent = '';
            showMainContent();
        } else {
            errorElement.textContent = '❌ Invalid username or password';
            document.getElementById('password').value = '';
        }
    };

    // Show main content
    function showMainContent() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        loadPostsList();
        updateEditorFields();
    }

    // Logout
    window.logout = function() {
        sessionStorage.removeItem('blogManagerAuth');
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').textContent = '';
    };

    // Update editor fields based on category
    window.updateEditorFields = function() {
        const category = document.getElementById('post-category').value;
        
        // Hide all conditional fields
        document.getElementById('field-preview').style.display = 'none';
        document.getElementById('field-book-thumbnail').style.display = 'none';
        document.getElementById('field-book-rating').style.display = 'none';
        document.getElementById('field-video-thumbnail').style.display = 'none';
        
        // Show relevant field
        if (category === 'Updates') {
            document.getElementById('field-preview').style.display = 'block';
        } else if (category === 'Book Reviews') {
            document.getElementById('field-book-thumbnail').style.display = 'block';
            document.getElementById('field-book-rating').style.display = 'block';
        } else if (category === 'Video Plans') {
            document.getElementById('field-video-thumbnail').style.display = 'block';
        }
    };

    // Handle image upload
    window.handleImageUpload = function(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            currentThumbnail = e.target.result;
            
            // Show preview
            const previewId = type === 'book' ? 'book-thumbnail-preview' : 'video-thumbnail-preview';
            const preview = document.getElementById(previewId);
            preview.innerHTML = `<img src="${currentThumbnail}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    };

    // Filter posts list
    window.filterPostsList = function(category) {
        currentFilterCategory = category;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
        document.getElementById('tab-' + category).classList.add('active');
        
        loadPostsList();
    };

    // Load posts from localStorage
    function loadPosts() {
        const posts = localStorage.getItem('blogPosts');
        return posts ? JSON.parse(posts) : [];
    }

    // Save posts to localStorage
    function savePosts(posts) {
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }

    // Generate unique ID
    function generateId() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save/Update Post
    window.savePost = function() {
        const postId = document.getElementById('post-id').value;
        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value.trim();
        const status = document.getElementById('post-status').value;

        if (!title || !content) {
            alert('Please enter both title and content!');
            return;
        }

        // Get category-specific data
        let preview = null;
        let thumbnail = currentThumbnail;
        let rating = null;

        if (category === 'Updates') {
            preview = document.getElementById('post-preview').value.trim();
            if (!preview) {
                alert('Please enter a preview text for Updates posts!');
                return;
            }
        } else if (category === 'Book Reviews') {
            if (!postId && !thumbnail) {
                alert('Please upload a book cover!');
                return;
            }
            const ratingValue = document.getElementById('book-rating').value;
            rating = ratingValue ? parseInt(ratingValue) : null;
        } else {
            if (!postId && !thumbnail) {
                alert('Please upload a thumbnail!');
                return;
            }
        }

        const posts = loadPosts();
        const now = new Date().toISOString();

        if (postId) {
            // Update existing post
            const index = posts.findIndex(p => p.id === postId);
            if (index !== -1) {
                posts[index] = {
                    ...posts[index],
                    title,
                    category,
                    content,
                    status,
                    preview: preview || posts[index].preview,
                    thumbnail: thumbnail || posts[index].thumbnail,
                    rating: rating !== null ? rating : posts[index].rating,
                    updatedAt: now
                };
            }
        } else {
            // Create new post
            posts.unshift({
                id: generateId(),
                title,
                category,
                content,
                status,
                preview,
                thumbnail,
                rating,
                createdAt: now,
                updatedAt: now
            });
        }

        savePosts(posts);
        clearEditor();
        loadPostsList();
        alert(postId ? 'Post updated!' : 'Post created!');
    };

    // Clear editor
    window.clearEditor = function() {
        document.getElementById('post-id').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-category').value = 'Updates';
        document.getElementById('post-preview').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-status').value = 'published';
        document.getElementById('book-thumbnail').value = '';
        document.getElementById('book-rating').value = '';
        document.getElementById('video-thumbnail').value = '';
        document.getElementById('book-thumbnail-preview').innerHTML = '';
        document.getElementById('video-thumbnail-preview').innerHTML = '';
        currentThumbnail = null;
        updateEditorFields();
    };

    // Edit post
    window.editPost = function(postId) {
        const posts = loadPosts();
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-category').value = post.category;
            document.getElementById('post-content').value = post.content;
            document.getElementById('post-status').value = post.status;
            
            // Set category-specific fields
            if (post.category === 'Updates') {
                document.getElementById('post-preview').value = post.preview || '';
            } else if (post.category === 'Book Reviews') {
                if (post.thumbnail) {
                    currentThumbnail = post.thumbnail;
                    document.getElementById('book-thumbnail-preview').innerHTML = `<img src="${post.thumbnail}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
                }
                document.getElementById('book-rating').value = post.rating || '';
            } else if (post.category === 'Video Plans' && post.thumbnail) {
                currentThumbnail = post.thumbnail;
                document.getElementById('video-thumbnail-preview').innerHTML = `<img src="${post.thumbnail}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">`;
            }
            
            updateEditorFields();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Delete post
    window.deletePost = function(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        let posts = loadPosts();
        posts = posts.filter(p => p.id !== postId);
        savePosts(posts);
        loadPostsList();
        alert('Post deleted!');
    };

    // Load posts list
    function loadPostsList() {
        let posts = loadPosts();
        
        // Filter by category if not 'all'
        if (currentFilterCategory !== 'all') {
            posts = posts.filter(p => p.category === currentFilterCategory);
        }

        const container = document.getElementById('posts-list');

        if (posts.length === 0) {
            const message = currentFilterCategory === 'all' 
                ? 'No posts yet. Create your first post above!'
                : `No posts in ${currentFilterCategory}. Create one above!`;
            container.innerHTML = `<p style="text-align: center; color: #666;">${message}</p>`;
            return;
        }

        container.innerHTML = posts.map(post => {
            let previewContent = '';
            
            if (post.category === 'Updates') {
                previewContent = `<div class="post-item-preview">${post.preview || ''}</div>`;
            } else if (post.thumbnail) {
                const imgClass = post.category === 'Book Reviews' ? 'portrait' : 'landscape';
                previewContent = `<div class="post-item-thumbnail ${imgClass}"><img src="${post.thumbnail}" alt="Thumbnail"></div>`;
            }

            // Add rating for Book Reviews
            let ratingDisplay = '';
            if (post.category === 'Book Reviews' && post.rating) {
                ratingDisplay = `<span class="post-rating">${'⭐'.repeat(post.rating)}</span>`;
            }

            return `
                <div class="post-item">
                    <div class="post-item-header">
                        <h3>${post.title}</h3>
                        <span class="post-status ${post.status}">${post.status}</span>
                    </div>
                    <div class="post-item-meta">
                        <span class="post-category">${post.category}</span>
                        ${ratingDisplay}
                        <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${previewContent}
                    <div class="post-item-content">
                        ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                    </div>
                    <div class="post-item-actions">
                        <button onclick="editPost('${post.id}')" class="btn-edit">Edit</button>
                        <button onclick="deletePost('${post.id}')" class="btn-delete">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Export posts
    window.exportPosts = function() {
        const posts = loadPosts();
        const dataStr = JSON.stringify(posts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blog-posts-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Import posts
    window.importPosts = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedPosts = JSON.parse(e.target.result);
                if (!Array.isArray(importedPosts)) {
                    throw new Error('Invalid format');
                }

                if (confirm(`Import ${importedPosts.length} posts? This will merge with existing posts.`)) {
                    const existingPosts = loadPosts();
                    const allPosts = [...importedPosts, ...existingPosts];
                    savePosts(allPosts);
                    loadPostsList();
                    alert('Posts imported successfully!');
                }
            } catch (err) {
                alert('Error importing posts. Please check the file format.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Allow Enter key to submit login
    document.addEventListener('DOMContentLoaded', function() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    attemptLogin();
                }
            });
        }
        checkLogin();
    });
})();
