// Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyALqff44h7cxZTjenRtiQmtpHQC9XzfLK4",
    authDomain: "cj-philip.firebaseapp.com",
    projectId: "cj-philip",
    storageBucket: "cj-philip.firebasestorage.app",
    messagingSenderId: "743552590154",
    appId: "1:743552590154:web:e91ee1a7ff93c9740621b3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Admin user email (your email)
const ADMIN_EMAIL = 'AlvoraQR@outlook.com';

// Check if current user is admin
function isAdmin() {
    const user = auth.currentUser;
    return user && user.email === ADMIN_EMAIL;
}

// Get current user data
async function getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        return doc.exists ? { id: user.uid, ...doc.data() } : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const adminControls = document.querySelectorAll('.admin-only');
    
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenuBtn) {
            userMenuBtn.style.display = 'block';
            userMenuBtn.textContent = user.displayName || user.email.split('@')[0];
        }
        
        // Show admin controls if admin
        if (isAdmin()) {
            adminControls.forEach(el => el.style.display = 'block');
        }
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (userMenuBtn) userMenuBtn.style.display = 'none';
        adminControls.forEach(el => el.style.display = 'none');
    }
});
