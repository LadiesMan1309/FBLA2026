// Import Firebase Auth functions
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Wait for both DOM and Firebase to be ready
let auth;
let googleProvider;

// Authentication State
let isLoggedIn = false;
let userEmail = '';

// DOM elements (will be initialized after DOM loads)
let loginSection;
let signupSection;
let homeSection;
let learnSection;
let physicsCourse;
let homeBtn;
let sessionBtn;
let learnBtn;
let authBtn;

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseAuth) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.firebaseAuth) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        }
    });
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Firebase to be ready
    await waitForFirebase();

    // Get Firebase auth instance
    auth = window.firebaseAuth;
    googleProvider = new GoogleAuthProvider();

    // Get sections
    loginSection = document.getElementById('login-section');
    signupSection = document.getElementById('signup-section');
    homeSection = document.getElementById('home-section');
    learnSection = document.getElementById('learn-section');
    physicsCourse = document.getElementById('physics-course');

    // Get navigation buttons
    homeBtn = document.getElementById('home-btn');
    sessionBtn = document.getElementById('session-btn');
    learnBtn = document.getElementById('learn-btn');
    authBtn = document.getElementById('auth-btn');

    // Initialize all event listeners
    console.log('DOM loaded, Firebase ready, initializing...');
    initializeEventListeners();
    console.log('Initialization complete');
});

// Show/hide sections
function hideAllSections() {
    loginSection.style.display = 'none';
    signupSection.style.display = 'none';
    homeSection.style.display = 'none';
    learnSection.style.display = 'none';
    physicsCourse.style.display = 'none';
}

function showLogin() {
    hideAllSections();
    loginSection.style.display = 'flex';
}

function showSignup() {
    hideAllSections();
    signupSection.style.display = 'flex';
}

function showHome() {
    hideAllSections();
    homeSection.style.display = 'block';
}

function showLearn() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    hideAllSections();
    learnSection.style.display = 'flex';
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Navigation event listeners
    homeBtn.addEventListener('click', () => {
        console.log('Home button clicked');
        showHome();
    });

    sessionBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            console.log('Book a Private Session clicked');
        } else {
            alert('Immersive LFA wants you to login first to book a private session');
            showLogin();
        }
    });

    learnBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
            alert('Immersive LFA wants you to login first to access courses');
            showLogin();
            return;
        }
        showLearn();
    });

    authBtn.addEventListener('click', async () => {
        console.log('Auth button clicked, isLoggedIn:', isLoggedIn);
        if (isLoggedIn) {
            // Logout
            try {
                await signOut(auth);
                // Redirect to homepage after logout
                showHome();
            } catch (error) {
                console.error('Logout error:', error);
            }
        } else {
            // Show login
            console.log('Showing login page');
            showLogin();
        }
    });

    // Logo click to return home
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', () => {
        showHome();
    });
    logo.style.cursor = 'pointer';

    // Google Login
    document.getElementById('google-login').addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log('Logged in:', user.email);
            showHome();
        } catch (error) {
            console.error('Google login error:', error);
            alert('Immersive LFA: Google login failed - ' + error.message);
        }
    });

    // Email Login
    document.getElementById('email-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showHome();
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found') {
                alert('Immersive LFA: No account found with this email. Please sign up first!');
            } else if (error.code === 'auth/wrong-password') {
                alert('Immersive LFA: Incorrect password. Please try again!');
            } else if (error.code === 'auth/invalid-credential') {
                alert('Immersive LFA: Invalid email or password. Please try again!');
            } else {
                alert('Immersive LFA: Login failed - ' + error.message);
            }
        }
    });

    // Signup link
    document.getElementById('signup-link').addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });

    // Login link (from signup page)
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    // Google Signup
    document.getElementById('google-signup').addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log('Signed up:', user.email);
            showHome();
        } catch (error) {
            console.error('Google signup error:', error);
            alert('Immersive LFA: Google signup failed - ' + error.message);
        }
    });

    // Email Signup
    document.getElementById('email-signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Client-side validation
        if (password !== confirmPassword) {
            alert('Immersive LFA: Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Immersive LFA: Password must be at least 6 characters long!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with name
            await updateProfile(userCredential.user, { displayName: name });
            alert('Immersive LFA: Account created successfully!');
            showHome();
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                alert('Immersive LFA: An account with this email already exists!');
            } else if (error.code === 'auth/weak-password') {
                alert('Immersive LFA: Password is too weak. Please use a stronger password.');
            } else {
                alert('Immersive LFA: Signup failed - ' + error.message);
            }
        }
    });

    // Handle course card clicks
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', () => {
            const course = card.getAttribute('data-course');
            if (course === 'physics') {
                hideAllSections();
                physicsCourse.style.display = 'flex';
                loadLessonProgress();
            }
        });
    });

    // Handle lesson clicks
    const lessonItems = document.querySelectorAll('.lesson-item');
    const lessonContent = document.getElementById('lesson-content');

    lessonItems.forEach(item => {
        item.addEventListener('click', () => {
            const lesson = item.getAttribute('data-lesson');

            // Remove active class from all lessons
            lessonItems.forEach(l => l.classList.remove('active'));
            // Add active class to clicked lesson
            item.classList.add('active');

            // Update content based on lesson (placeholder for now)
            lessonContent.innerHTML = `
                <h2>${item.textContent}</h2>
                <p>Lesson content will be displayed here.</p>
                <button class="complete-lesson-btn" onclick="markComplete('${lesson}')">Mark as Complete</button>
            `;
        });
    });

    // Firebase Auth State Observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isLoggedIn = true;
            userEmail = user.email;
            authBtn.textContent = 'Logout';
            homeBtn.style.display = 'block';
            sessionBtn.style.display = 'block';
            learnBtn.style.display = 'block';
            console.log('User logged in:', userEmail);

            // Reload lesson progress if on physics course page
            if (physicsCourse.style.display === 'flex') {
                loadLessonProgress();
            }
        } else {
            isLoggedIn = false;
            userEmail = '';
            authBtn.textContent = 'Login';
            homeBtn.style.display = 'block';
            sessionBtn.style.display = 'block';
            learnBtn.style.display = 'block';
            console.log('User logged out');

            // Clear lesson progress display when logged out
            const lessonItems = document.querySelectorAll('.lesson-item');
            lessonItems.forEach(item => {
                item.classList.remove('completed');
            });
        }

        // Show home page by default
        if (!loginSection.style.display || loginSection.style.display === 'none') {
            if (!signupSection.style.display || signupSection.style.display === 'none') {
                if (!learnSection.style.display || learnSection.style.display === 'flex') {
                    if (!physicsCourse.style.display || physicsCourse.style.display === 'flex') {
                        showHome();
                    }
                }
            }
        }
    });
}

// Lesson Progress Tracking (user-specific)
function getLessonProgress() {
    const userId = auth.currentUser?.uid || 'anonymous';
    const key = `lessonProgress_${userId}`;
    const progress = localStorage.getItem(key);
    return progress ? JSON.parse(progress) : {};
}

function saveLessonProgress(lessonId) {
    const userId = auth.currentUser?.uid || 'anonymous';
    const key = `lessonProgress_${userId}`;
    const progress = getLessonProgress();
    progress[lessonId] = true;
    localStorage.setItem(key, JSON.stringify(progress));
}

function loadLessonProgress() {
    const progress = getLessonProgress();
    const lessonItems = document.querySelectorAll('.lesson-item');

    // First, clear all completed status
    lessonItems.forEach(item => {
        item.classList.remove('completed');
    });

    // Then, load the current user's progress
    lessonItems.forEach(item => {
        const lessonId = item.getAttribute('data-lesson');
        if (progress[lessonId]) {
            item.classList.add('completed');
        }
    });
}

// Make markComplete globally accessible for onclick handlers
window.markComplete = function(lessonId) {
    saveLessonProgress(lessonId);

    // Find the lesson item and mark it as completed
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        if (item.getAttribute('data-lesson') === lessonId) {
            item.classList.add('completed');
        }
    });

    alert('Immersive LFA: Lesson marked as complete!');
}
