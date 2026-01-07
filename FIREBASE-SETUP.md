# Firebase Setup Guide for C.J Philip Website

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "CJ Philip Website" (or your preference)
4. Disable Google Analytics (optional)
5. Create project

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** authentication
4. Save

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Choose **Start in production mode**
3. Select your region (closest to you)
4. Create

### Step 4: Set Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts: Admin can write, everyone can read published
    match /posts/{postId} {
      allow read: if resource.data.status == 'published' || 
                     request.auth.token.email == 'AlvoraQR@outlook.com';
      allow write: if request.auth.token.email == 'AlvoraQR@outlook.com';
    }
    
    // Comments: Authenticated users can write, everyone can read
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
    
    // Messages: Only sender and admin can read
    match /messages/{messageId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      request.auth.token.email == 'AlvoraQR@outlook.com');
      allow create: if request.auth != null;
    }
  }
}
```

3. Publish rules

### Step 5: Enable Storage (for images)

1. Go to **Storage** → **Get Started**
2. Start in production mode
3. Set Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.email == 'AlvoraQR@outlook.com';
    }
  }
}
```

### Step 6: Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **</>** (Web app icon)
4. Register app with nickname "CJ Philip Website"
5. Copy the `firebaseConfig` object

### Step 7: Update firebase-config.js

1. Open `firebase-config.js`
2. Replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",  // Your API key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## 📧 Set Admin Email

In `firebase-config.js`, the admin email is set to:
```javascript
const ADMIN_EMAIL = 'AlvoraQR@outlook.com';
```

**Important:** Create an account with this email to get admin privileges!

## 🚀 Deploy to Vercel

1. Upload all files to your repository
2. Vercel will automatically deploy
3. Visit your site
4. Sign up with your admin email
5. You now have admin access!

## ✅ Features Enabled

### For Everyone (No Login Required):
- ✅ Browse all pages
- ✅ Read posts
- ✅ View content
- ✅ Sort/filter posts

### For Logged-In Users:
- ✅ Create account
- ✅ User profile page
- ✅ Comment on posts
- ✅ Send messages to you
- ✅ View their own comments

### For Admin (You):
- ✅ All user features
- ✅ "Manage Posts" button visible
- ✅ Create/edit/delete posts
- ✅ Posts save automatically to Firebase
- ✅ View all messages
- ✅ No need to export/upload files
- ✅ Changes go live instantly!

## 🎯 User Experience Flow

**First-Time Visitor:**
1. Browse site (no login required)
2. See "Sign In" button in header
3. Optional: Click to create account

**Registered User:**
1. Sign in
2. See their name in header
3. Click name → Dropdown menu
4. Access: Profile, Messages, Logout
5. Can comment on posts

**You (Admin):**
1. Sign in with AlvoraQR@outlook.com
2. See admin features everywhere
3. "Manage Posts" button visible
4. Access to all user interactions
5. Full control over content

## 📝 Database Structure

### Collections:

**users/**
- userId (document ID)
  - displayName
  - email
  - bio
  - interests[]
  - createdAt

**posts/**
- postId (auto-generated)
  - title
  - category (Updates/Book Reviews/Video Plans)
  - content
  - preview (Updates only)
  - thumbnail (Book Reviews/Video Plans)
  - rating (Book Reviews only)
  - status (published/draft)
  - createdAt
  - updatedAt

**comments/**
- commentId (auto-generated)
  - postId
  - postTitle
  - userId
  - userName
  - text
  - createdAt

**messages/**
- messageId (auto-generated)
  - userId
  - userName
  - userEmail
  - subject
  - message
  - createdAt
  - read (boolean)

## 🔧 Troubleshooting

**"Permission denied" errors:**
- Check Firestore security rules
- Make sure you're signed in
- Admin email must match exactly

**Posts not showing:**
- Check post status is "published"
- Check Firestore rules allow read access
- Check browser console for errors

**Can't sign in:**
- Email/password authentication enabled?
- Correct email format?
- Password at least 6 characters?

## 📞 Support

If you need help with Firebase setup, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- Firebase Support in console

## 🎉 You're All Set!

Once configured, your website will have:
- ✅ Automatic post saving
- ✅ User authentication
- ✅ User profiles
- ✅ Comment system
- ✅ Direct messaging
- ✅ Admin controls
- ✅ No manual file uploads needed!

Enjoy your fully-featured blog platform! 🚀
