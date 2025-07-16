// Import Firebase functions and the configuration object
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Elements ---
const initialLoader = document.getElementById('initial-loader');
const authContainer = document.getElementById('auth-container');

// Login Form
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Signup Form
const signupForm = document.getElementById('signup-form');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupErrorMessage = document.getElementById('signup-error-message');

// Toggling buttons
const showSignupFormBtn = document.getElementById('show-signup-form');
const showLoginFormBtn = document.getElementById('show-login-form');
const showLoginContainer = document.getElementById('show-login-container');

// --- Page Protection and Auth State ---

onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // User is logged in.
        // If they are on the login page (index.html), redirect to stories.html.
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'stories.html';
        }
    } else {
        // User is not logged in.
        // If they are on a protected page, redirect to index.html.
        if (currentPage !== 'index.html' && currentPage !== '') {
            window.location.href = 'index.html';
        }
        // If on the login page, hide loader and show the forms.
        initialLoader.classList.add('hidden');
        authContainer.classList.remove('hidden');
    }
});

// --- Form Switching Logic ---

if (showSignupFormBtn) {
    showSignupFormBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        showSignupFormBtn.parentElement.parentElement.classList.add('hidden'); // Hide "Don't have an account?" text
        signupForm.classList.remove('hidden');
        showLoginContainer.classList.remove('hidden');
    });
}

if (showLoginFormBtn) {
    showLoginFormBtn.addEventListener('click', () => {
        signupForm.classList.add('hidden');
        showLoginContainer.classList.add('hidden');
        loginForm.classList.remove('hidden');
        showSignupFormBtn.parentElement.parentElement.classList.remove('hidden');
    });
}

// --- Firebase Authentication Logic ---

// Login
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // onAuthStateChanged will handle the redirect
            })
            .catch((error) => {
                errorMessage.textContent = getFriendlyErrorMessage(error.code);
                errorMessage.classList.remove('hidden');
            });
    });
}

// Signup
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // onAuthStateChanged will handle the redirect
            })
            .catch((error) => {
                signupErrorMessage.textContent = getFriendlyErrorMessage(error.code);
                signupErrorMessage.classList.remove('hidden');
            });
    });
}

// --- Sign Out Logic (for use on other pages) ---
// We define a global function so other scripts can use it.
window.performSignOut = () => {
    signOut(auth).catch((error) => {
        console.error("Sign out error", error);
    });
};

// --- Helper function for user-friendly error messages ---
function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}
