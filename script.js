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
let bookingSection;
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
    bookingSection = document.getElementById('booking-section');

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
    bookingSection.style.display = 'none';
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

function showBooking() {
    console.log('showBooking called');
    console.log('bookingSection:', bookingSection);
    hideAllSections();
    bookingSection.style.display = 'flex';
    console.log('bookingSection display set to flex');
    loadUserBookings();
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
            showBooking();
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

    // Booking form submission
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const subject = document.getElementById('booking-subject').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const duration = document.getElementById('booking-duration').value;
        const notes = document.getElementById('booking-notes').value;

        const booking = {
            id: Date.now().toString(),
            subject: subject,
            date: date,
            time: time,
            duration: duration,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        saveBooking(booking);

        // Send confirmation email
        await sendBookingEmail(booking);

        // Clear form
        document.getElementById('booking-form').reset();

        // Reload bookings list
        loadUserBookings();

        alert('Immersive LFA: Session booked successfully! We will confirm your booking via email.');
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

// Booking Management Functions
function getUserBookings() {
    const userId = auth.currentUser?.uid || 'anonymous';
    const key = `bookings_${userId}`;
    const bookings = localStorage.getItem(key);
    return bookings ? JSON.parse(bookings) : [];
}

function saveBooking(booking) {
    const bookings = getUserBookings();
    bookings.push(booking);

    const userId = auth.currentUser?.uid || 'anonymous';
    const key = `bookings_${userId}`;
    localStorage.setItem(key, JSON.stringify(bookings));
}

function deleteBooking(bookingId) {
    let bookings = getUserBookings();
    bookings = bookings.filter(b => b.id !== bookingId);

    const userId = auth.currentUser?.uid || 'anonymous';
    const key = `bookings_${userId}`;
    localStorage.setItem(key, JSON.stringify(bookings));
}

function loadUserBookings() {
    const bookings = getUserBookings();
    const bookingsList = document.getElementById('bookings-list');

    if (!bookingsList) {
        console.error('Bookings list element not found');
        return;
    }

    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p class="no-bookings">No upcoming sessions scheduled</p>';
        return;
    }

    // Sort bookings by date and time
    bookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });

    bookingsList.innerHTML = bookings.map(booking => {
        const subjectNames = {
            'physics': 'Physics 1',
            'history': 'US History',
            'other': 'Other'
        };

        const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = formatTime(booking.time);

        return `
            <div class="booking-item">
                <div class="booking-details">
                    <h4>${subjectNames[booking.subject] || booking.subject}</h4>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                    <p><strong>Duration:</strong> ${booking.duration} minutes</p>
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                </div>
                <button class="booking-cancel-btn" onclick="cancelBooking('${booking.id}')">Cancel</button>
            </div>
        `;
    }).join('');
}

function formatTime(time) {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
}

// Make cancelBooking globally accessible
window.cancelBooking = function(bookingId) {
    if (confirm('Immersive LFA: Are you sure you want to cancel this session?')) {
        deleteBooking(bookingId);
        loadUserBookings();
        alert('Immersive LFA: Session cancelled successfully.');
    }
}

// Email sending function
async function sendBookingEmail(booking) {
    console.log('sendBookingEmail called with booking:', booking);
    console.log('Current user:', auth.currentUser);

    try {
        const subjectNames = {
            'physics': 'Physics 1',
            'history': 'US History',
            'other': 'Other'
        };

        const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = formatTime(booking.time);

        const templateParams = {
            to_email: auth.currentUser?.email || 'user@example.com',
            to_name: auth.currentUser?.displayName || 'Student',
            subject_name: subjectNames[booking.subject] || booking.subject,
            booking_date: formattedDate,
            booking_time: formattedTime,
            booking_duration: booking.duration + ' minutes',
            booking_notes: booking.notes || 'No additional notes',
            user_email: auth.currentUser?.email || 'Not provided'
        };

        console.log('Sending email with template params:', templateParams);

        // EmailJS service configured
        const response = await emailjs.send(
            'service_mn5u6h9',     // Your EmailJS service ID
            'template_5bufvtp',    // Your EmailJS template ID
            templateParams
        );

        console.log('Email sent successfully! Response:', response);
    } catch (error) {
        console.error('Email sending failed:', error);
        console.error('Error details:', error.text || error.message || error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        alert('Immersive LFA: Booking saved, but email confirmation failed. Error: ' + (error.text || error.message || 'Unknown error'));
    }
}
