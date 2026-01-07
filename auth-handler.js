// Authentication Handler

// Open auth modal
function openAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
}

// Switch to signup form
function switchToSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-error').textContent = '';
}

// Switch to login form
function switchToLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-error').textContent = '';
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    if (!email || !password) {
        errorElement.textContent = 'Please enter email and password';
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
        location.reload(); // Refresh to show user-specific content
    } catch (error) {
        errorElement.textContent = getAuthErrorMessage(error.code);
    }
}

// Handle signup
async function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorElement = document.getElementById('signup-error');
    
    if (!name || !email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({ displayName: name });
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            bio: '',
            interests: []
        });
        
        closeAuthModal();
        location.reload();
    } catch (error) {
        errorElement.textContent = getAuthErrorMessage(error.code);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Toggle user menu dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-menu-dropdown');
    
    if (dropdown && userMenuBtn && 
        !userMenuBtn.contains(event.target) && 
        !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Get friendly error messages
function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later';
        default:
            return 'An error occurred. Please try again';
    }
}
