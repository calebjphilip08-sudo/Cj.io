// Blog Management System with Firebase
(function() {
    const CORRECT_USERNAME = 'CJ Philip';
    const CORRECT_PASSWORD = 'CJMANSHOMETURF3';
    let currentFilterCategory = 'all';
    let currentThumbnail = null;
    let editingPostId = null;

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

    // Save/Update Post to Firebase
    window.savePost = async function() {
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

        const postData = {
            title,
            category,
            content,
            status,
            preview: preview || null,
            thumbnail: thumbnail || null,
            rating: rating,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (postId) {
                // Update existing post
                await db.collection('posts').doc(postId).update(postData);
                alert('✅ Post updated!');
            } else {
                // Create new post
                postData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('posts').add(postData);
                alert('✅ Post created!');
            }
            
            clearEditor();
            loadPostsList();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('❌ Error saving post. Please try again.');
        }
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
    window.editPost = async function(postId) {
        try {
            const doc = await db.collection('posts').doc(postId).get();
            if (!doc.exists) return;
            
            const post = doc.data();
            
            document.getElementById('post-id').value = postId;
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
        } catch (error) {
            console.error('Error loading post:', error);
            alert('Error loading post.');
        }
    };

    // Delete post
    window.deletePost = async function(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await db.collection('posts').doc(postId).delete();
            alert('✅ Post deleted!');
            loadPostsList();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('❌ Error deleting post.');
        }
    };

    // Load posts list from Firebase
    async function loadPostsList() {
        const container = document.getElementById('posts-list');
        container.innerHTML = '<p style="text-align: center; color: #666;">Loading...</p>';
        
        try {
            let query = db.collection('posts');
            
            // Filter by category if not 'all'
            if (currentFilterCategory !== 'all') {
                query = query.where('category', '==', currentFilterCategory);
            }
            
            const snapshot = await query.orderBy('createdAt', 'desc').get();
            
            if (snapshot.empty) {
                const message = currentFilterCategory === 'all' 
                    ? 'No posts yet. Create your first post above!'
                    : `No posts in ${currentFilterCategory}. Create one above!`;
                container.innerHTML = `<p style="text-align: center; color: #666;">${message}</p>`;
                return;
            }

            container.innerHTML = snapshot.docs.map(doc => {
                const post = doc.data();
                const postId = doc.id;
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

                const date = post.createdAt?.toDate?.() || new Date();

                return `
                    <div class="post-item">
                        <div class="post-item-header">
                            <h3>${post.title}</h3>
                            <span class="post-status ${post.status}">${post.status}</span>
                        </div>
                        <div class="post-item-meta">
                            <span class="post-category">${post.category}</span>
                            ${ratingDisplay}
                            <span class="post-date">${date.toLocaleDateString()}</span>
                        </div>
                        ${previewContent}
                        <div class="post-item-content">
                            ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                        </div>
                        <div class="post-item-actions">
                            <button onclick="editPost('${postId}')" class="btn-edit">Edit</button>
                            <button onclick="deletePost('${postId}')" class="btn-delete">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading posts:', error);
            container.innerHTML = '<p style="text-align: center; color: #ef4444;">Error loading posts. Please refresh the page.</p>';
        }
    }

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
