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
let scheduleSection;
let dashboardSection;
let resourcesSection;
let sourcesSection;
let homeBtn;
let scheduleBtn;
let dashboardBtn;
let resourcesBtn;
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
    scheduleSection = document.getElementById('schedule-section');
    dashboardSection = document.getElementById('dashboard-section');
    resourcesSection = document.getElementById('resources-section');
    sourcesSection = document.getElementById('sources-section');

    // Get navigation buttons
    homeBtn = document.getElementById('home-btn');
    scheduleBtn = document.getElementById('schedule-btn');
    dashboardBtn = document.getElementById('dashboard-btn');
    resourcesBtn = document.getElementById('resources-btn');
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
    scheduleSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    resourcesSection.style.display = 'none';
    sourcesSection.style.display = 'none';
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

function showSchedule() {
    if (!isLoggedIn) {
        alert('Immersive LFA wants you to login first to access the schedule');
        showLogin();
        return;
    }
    hideAllSections();
    scheduleSection.style.display = 'flex';
    loadUserBookings();
}

function showDashboard() {
    if (!isLoggedIn) {
        alert('Immersive LFA wants you to login first to access your dashboard');
        showLogin();
        return;
    }
    hideAllSections();
    dashboardSection.style.display = 'flex';
    updateDashboard();
}

function showResources() {
    if (!isLoggedIn) {
        alert('Immersive LFA wants you to login first to access resources');
        showLogin();
        return;
    }
    hideAllSections();
    resourcesSection.style.display = 'flex';
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Navigation event listeners
    homeBtn.addEventListener('click', () => {
        console.log('Home button clicked');
        showHome();
    });

    scheduleBtn.addEventListener('click', () => {
        showSchedule();
    });

    dashboardBtn.addEventListener('click', () => {
        showDashboard();
    });

    resourcesBtn.addEventListener('click', () => {
        showResources();
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

            // Load lesson content from global lessonContent object
            if (window.lessonContent && window.lessonContent[lesson]) {
                const content = window.lessonContent[lesson];
                lessonContent.innerHTML = content.content + 
                    `<button class="complete-lesson-btn" onclick="markComplete('${lesson}')">Mark as Complete</button>`;
            } else {
                lessonContent.innerHTML = `
                    <h2>${item.textContent}</h2>
                    <p>Lesson content will be displayed here.</p>
                    <button class="complete-lesson-btn" onclick="markComplete('${lesson}')">Mark as Complete</button>
                `;
            }
        });
    });

    // Schedule tabs
    const privateTab = document.getElementById('private-tab');
    const groupTab = document.getElementById('group-tab');
    const privateContent = document.getElementById('private-content');
    const groupContent = document.getElementById('group-content');

    if (privateTab && groupTab) {
        privateTab.addEventListener('click', () => {
            privateTab.classList.add('active');
            groupTab.classList.remove('active');
            privateContent.classList.add('active');
            groupContent.classList.remove('active');
        });

        groupTab.addEventListener('click', () => {
            groupTab.classList.add('active');
            privateTab.classList.remove('active');
            groupContent.classList.add('active');
            privateContent.classList.remove('active');
        });
    }

    // Resources tabs
    const resourceTabs = document.querySelectorAll('.resource-tab');
    const resourceContents = document.querySelectorAll('.resource-content');

    resourceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetResource = tab.getAttribute('data-resource');
            
            resourceTabs.forEach(t => t.classList.remove('active'));
            resourceContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetContent = document.getElementById(targetResource + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
            }
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
            if (physicsCourse && physicsCourse.style.display === 'flex') {
                loadLessonProgress();
            }
            
            // Update dashboard if visible
            if (dashboardSection && dashboardSection.style.display === 'flex') {
                updateDashboard();
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

        // Show home page by default if no other section is visible
        const visibleSections = [
            loginSection, signupSection, homeSection, learnSection, 
            physicsCourse, scheduleSection, dashboardSection, resourcesSection, sourcesSection
        ].filter(section => section && (section.style.display === 'flex' || section.style.display === 'block'));
        
        if (visibleSections.length === 0) {
            showHome();
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

    // Update dashboard if it's visible
    if (dashboardSection && dashboardSection.style.display === 'flex') {
        updateDashboard();
    }

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
            'other': 'Other',
            'group-study': 'Group Study Session'
        };

        const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = formatTime(booking.time);
        
        // For group sessions, show the title; for private sessions, show subject name
        const displayTitle = booking.type === 'group' 
            ? (booking.title || 'Group Study Session')
            : (subjectNames[booking.subject] || booking.subject);
        
        // Calculate end time for display
        const [hour, minute] = booking.time.split(':');
        const startMinutes = parseInt(hour) * 60 + parseInt(minute);
        const endMinutes = startMinutes + parseInt(booking.duration);
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        const endTime = formatTime(`${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`);
        const timeDisplay = booking.type === 'group' 
            ? `${formattedTime} - ${endTime}`
            : formattedTime;

        return `
            <div class="booking-item">
                <div class="booking-details">
                    <h4>${displayTitle}${booking.type === 'group' ? ' <span class="group-badge">Group</span>' : ''}</h4>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${timeDisplay}</p>
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

// Dashboard Functions
function updateDashboard() {
    const progress = getLessonProgress();
    const totalLessons = 6; // intro, lesson1-5
    const completedLessons = Object.keys(progress).filter(key => 
        ['intro', 'lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5'].includes(key)
    ).length;
    
    const progressPercent = Math.round((completedLessons / totalLessons) * 100);
    
    // Update progress circle
    const progressCircle = document.getElementById('progress-circle');
    const progressPercentEl = document.getElementById('progress-percent');
    const lessonsCompletedEl = document.getElementById('lessons-completed');
    
    if (progressPercentEl) {
        progressPercentEl.textContent = progressPercent + '%';
    }
    if (lessonsCompletedEl) {
        lessonsCompletedEl.textContent = `${completedLessons} of ${totalLessons} lessons completed`;
    }
    
    // Update progress ring
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (progressPercent / 100) * circumference;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // Update recent activity
    const recentActivity = document.getElementById('recent-activity');
    if (recentActivity) {
        const activities = [];
        if (completedLessons > 0) {
            activities.push(`Completed ${completedLessons} lesson${completedLessons > 1 ? 's' : ''}`);
        }
        const bookings = getUserBookings();
        if (bookings.length > 0) {
            activities.push(`Booked ${bookings.length} session${bookings.length > 1 ? 's' : ''}`);
        }
        
        if (activities.length > 0) {
            recentActivity.innerHTML = activities.map(a => `<p>${a}</p>`).join('');
        } else {
            recentActivity.innerHTML = '<p class="no-activity">No recent activity</p>';
        }
    }
    
    // Update page views
    const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
    localStorage.setItem('pageViews', pageViews.toString());
    const pageViewsEl = document.getElementById('page-views');
    if (pageViewsEl) {
        pageViewsEl.textContent = pageViews;
    }
}

// Quiz Functions
const quizData = {
    'physics-basics': {
        title: 'Physics Basics Quiz',
        questions: [
            {
                question: 'What is the SI unit for length?',
                options: ['Meter', 'Kilogram', 'Second', 'Kelvin'],
                correct: 0
            },
            {
                question: 'Physics is the study of:',
                options: ['Only motion', 'Matter and energy', 'Only energy', 'Only matter'],
                correct: 1
            },
            {
                question: 'Which branch of physics deals with motion and forces?',
                options: ['Thermodynamics', 'Mechanics', 'Optics', 'Electromagnetism'],
                correct: 1
            }
        ]
    },
    'motion-quiz': {
        title: 'Motion & Kinematics Quiz',
        questions: [
            {
                question: 'What is the difference between speed and velocity?',
                options: ['Speed has direction, velocity does not', 'Velocity has direction, speed does not', 'They are the same', 'Speed is always greater'],
                correct: 1
            },
            {
                question: 'If a car accelerates from 0 to 20 m/s in 5 seconds, what is its acceleration?',
                options: ['4 m/s²', '5 m/s²', '10 m/s²', '20 m/s²'],
                correct: 0
            },
            {
                question: 'Displacement is:',
                options: ['Always equal to distance', 'A vector quantity', 'A scalar quantity', 'Always positive'],
                correct: 1
            }
        ]
    },
    'vectors-quiz': {
        title: 'Vectors & Scalars Quiz',
        questions: [
            {
                question: 'Which of the following is a scalar quantity?',
                options: ['Velocity', 'Displacement', 'Speed', 'Acceleration'],
                correct: 2
            },
            {
                question: 'A vector has:',
                options: ['Only magnitude', 'Only direction', 'Both magnitude and direction', 'Neither magnitude nor direction'],
                correct: 2
            },
            {
                question: 'If you walk 3 m east and 4 m north, your displacement is:',
                options: ['5 m', '7 m', '5 m northeast', '7 m northeast'],
                correct: 2
            }
        ]
    },
    'unit1-final': {
        title: 'Unit 1 Final Quiz',
        questions: [
            {
                question: 'What is the SI unit for mass?',
                options: ['Meter', 'Kilogram', 'Gram', 'Pound'],
                correct: 1
            },
            {
                question: 'Velocity is a:',
                options: ['Scalar', 'Vector', 'Both', 'Neither'],
                correct: 1
            },
            {
                question: 'In projectile motion, horizontal velocity is:',
                options: ['Constant', 'Increasing', 'Decreasing', 'Zero'],
                correct: 0
            },
            {
                question: 'Acceleration due to gravity on Earth is approximately:',
                options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '9.0 m/s²'],
                correct: 0
            },
            {
                question: 'The equation v = v₀ + at is used for:',
                options: ['Constant velocity', 'Constant acceleration', 'Variable acceleration', 'No motion'],
                correct: 1
            }
        ]
    }
};

window.startQuiz = function(quizId) {
    const quiz = quizData[quizId];
    if (!quiz) return;
    
    const modal = document.getElementById('quiz-modal');
    const title = document.getElementById('quiz-title');
    const content = document.getElementById('quiz-content');
    const results = document.getElementById('quiz-results');
    
    if (!modal || !title || !content) return;
    
    title.textContent = quiz.title;
    content.style.display = 'block';
    results.style.display = 'none';
    
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];
    
    function showQuestion() {
        if (currentQuestion >= quiz.questions.length) {
            showResults();
            return;
        }
        
        const q = quiz.questions[currentQuestion];
        content.innerHTML = `
            <div class="quiz-question">
                <p class="question-number">Question ${currentQuestion + 1} of ${quiz.questions.length}</p>
                <h3>${q.question}</h3>
                <div class="quiz-options">
                    ${q.options.map((opt, idx) => `
                        <button class="quiz-option" onclick="selectAnswer(${idx})">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    window.selectAnswer = function(answerIdx) {
        userAnswers[currentQuestion] = answerIdx;
        const q = quiz.questions[currentQuestion];
        if (answerIdx === q.correct) {
            score++;
        }
        currentQuestion++;
        showQuestion();
    };
    
    function showResults() {
        content.style.display = 'none';
        results.style.display = 'block';
        const percentage = Math.round((score / quiz.questions.length) * 100);
        results.innerHTML = `
            <div class="quiz-results-content">
                <h3>Quiz Complete!</h3>
                <p class="quiz-score">Your Score: ${score}/${quiz.questions.length} (${percentage}%)</p>
                <div class="quiz-feedback">
                    ${percentage >= 80 ? '<p class="success">Excellent work!</p>' : 
                      percentage >= 60 ? '<p class="warning">Good job! Keep practicing.</p>' : 
                      '<p class="error">Review the material and try again.</p>'}
                </div>
                <button class="close-quiz-btn" onclick="closeQuiz()">Close</button>
            </div>
        `;
        
        // Save quiz score
        const userId = auth.currentUser?.uid || 'anonymous';
        const key = `quizScores_${userId}`;
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        scores.push({ quizId, score, total: quiz.questions.length, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(scores));
    }
    
    modal.style.display = 'flex';
    showQuestion();
};

window.closeQuiz = function() {
    const modal = document.getElementById('quiz-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.joinGroupSession = function(sessionId, buttonElement) {
    // Find the group session card that was clicked
    const button = buttonElement || event?.target;
    const sessionCard = button.closest('.group-session-card');
    
    if (!sessionCard) {
        alert('Immersive LFA: Could not find session details.');
        return;
    }
    
    // Extract session details from the card
    const title = sessionCard.querySelector('h4')?.textContent || 'Group Study Session';
    const dateElement = sessionCard.querySelector('.session-date');
    
    // Get date from data-date attribute (preferred) or text content
    let sessionDate = '';
    if (dateElement) {
        sessionDate = dateElement.getAttribute('data-date') || dateElement.textContent.trim();
        // If date is formatted, try to extract YYYY-MM-DD format
        if (!sessionDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Try to parse formatted date back to YYYY-MM-DD
            try {
                const parsedDate = new Date(sessionDate);
                if (!isNaN(parsedDate.getTime())) {
                    sessionDate = parsedDate.toISOString().split('T')[0];
                } else {
                    sessionDate = new Date().toISOString().split('T')[0];
                }
            } catch (e) {
                sessionDate = new Date().toISOString().split('T')[0];
            }
        }
    }
    
    // Get time text - find the paragraph containing "Time"
    const timeParagraph = Array.from(sessionCard.querySelectorAll('p')).find(p => 
        p.textContent.includes('Time:')
    );
    const timeText = timeParagraph?.textContent || '';
    
    // Parse time range (e.g., "3:00 PM - 4:30 PM")
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
    let startTime = '';
    let duration = 90; // default 90 minutes
    
    if (timeMatch) {
        const startHour = parseInt(timeMatch[1]);
        const startMin = timeMatch[2];
        const startAmPm = timeMatch[3];
        const endHour = parseInt(timeMatch[4]);
        const endMin = timeMatch[5];
        const endAmPm = timeMatch[6];
        
        // Convert to 24-hour format for start time
        let startHour24 = startHour;
        if (startAmPm === 'PM' && startHour !== 12) startHour24 += 12;
        if (startAmPm === 'AM' && startHour === 12) startHour24 = 0;
        startTime = `${String(startHour24).padStart(2, '0')}:${startMin}`;
        
        // Calculate duration
        let endHour24 = endHour;
        if (endAmPm === 'PM' && endHour !== 12) endHour24 += 12;
        if (endAmPm === 'AM' && endHour === 12) endHour24 = 0;
        
        const startMinutes = startHour24 * 60 + parseInt(startMin);
        const endMinutes = endHour24 * 60 + parseInt(endMin);
        duration = endMinutes - startMinutes;
    } else {
        // Fallback: try to extract just start time
        const simpleTimeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
        if (simpleTimeMatch) {
            let hour = parseInt(simpleTimeMatch[1]);
            const min = simpleTimeMatch[2];
            const ampm = simpleTimeMatch[3];
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            startTime = `${String(hour).padStart(2, '0')}:${min}`;
        }
    }
    
    // If we still don't have a date, use a default
    if (!sessionDate) {
        sessionDate = new Date().toISOString().split('T')[0];
    }
    
    // Create booking object for group session
    const booking = {
        id: Date.now().toString(),
        type: 'group',
        title: title,
        subject: 'group-study',
        date: sessionDate,
        time: startTime || '15:00',
        duration: duration,
        sessionId: sessionId,
        createdAt: new Date().toISOString()
    };
    
    // Check if user is already registered for this session
    const existingBookings = getUserBookings();
    const alreadyJoined = existingBookings.some(b => b.sessionId === sessionId);
    
    if (alreadyJoined) {
        alert('Immersive LFA: You have already joined this group study session!');
        return;
    }
    
    // Save the booking
    saveBooking(booking);
    
    // Reload bookings list to show the new session
    loadUserBookings();
    
    alert(`Immersive LFA: You have joined the group study session "${title}"!`);
};

window.downloadFile = function(filename) {
    // Create a simple text file as a placeholder
    const content = `This is a placeholder for ${filename}. In a production environment, this would be a downloadable PDF file.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Immersive LFA: ${filename} download started!`);
};

function showSources() {
    hideAllSections();
    if (sourcesSection) {
        sourcesSection.style.display = 'flex';
    }
}

// Format dates for group sessions
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const sessionDates = document.querySelectorAll('.session-date');
        sessionDates.forEach(dateEl => {
            // Use data-date attribute if available, otherwise use textContent
            const dateStr = dateEl.getAttribute('data-date') || dateEl.textContent;
            if (dateStr) {
                try {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        const formatted = date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        dateEl.textContent = formatted;
                        // Preserve data-date attribute for later use
                        if (!dateEl.getAttribute('data-date')) {
                            dateEl.setAttribute('data-date', dateStr);
                        }
                    }
                } catch (e) {
                    // Keep original if parsing fails
                }
            }
        });
    }, 100);
});
