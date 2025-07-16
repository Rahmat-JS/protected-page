// This script manages the individual story viewing page (story.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// --- GitHub Configuration ---
const githubUsername = "rahmat-js";
const githubRepo = "protected-page";
const storiesPath = "stories";

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Elements ---
const pageLoader = document.getElementById('page-loader');
const pageContent = document.getElementById('page-content');
const userEmailSpan = document.getElementById('user-email');
const storyTitle = document.getElementById('story-title');
const storyTextContainer = document.getElementById('story-text');
const homeButton = document.getElementById('home-button');
const dropdownButton = document.getElementById('dropdown-button');
const dropdownContent = document.getElementById('dropdown-content');
const signoutButton = document.getElementById('signout-button');

// --- Page Initialization ---
function initPage() {
    setupEventListeners();
    loadStory();
}

// --- Event Listeners ---
function setupEventListeners() {
    // Dropdown menu toggle
    dropdownButton.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    // Sign out
    signoutButton.addEventListener('click', () => {
        window.performSignOut(); // This function is defined in auth.js
    });

    // Home button navigation
    homeButton.addEventListener('click', () => {
        window.location.href = 'stories.html';
    });
}

// --- Load Story Content ---
async function loadStory() {
    // Get story filename from URL (e.g., story.html?name=the-little-prince.txt)
    const urlParams = new URLSearchParams(window.location.search);
    const storyFileName = urlParams.get('name');

    if (!storyFileName) {
        storyTextContainer.innerHTML = `<p class="text-red-500">Error: No story specified.</p>`;
        storyTitle.textContent = "Error";
        return;
    }

    // Set the page title
    const formattedTitle = storyFileName.replace('.txt', '').replace(/-/g, ' ').replace(/_/g, ' ');
    storyTitle.textContent = formattedTitle;
    document.title = `${formattedTitle} - Story App`;

    // Fetch story content from GitHub
    const fileUrl = `https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/main/${storiesPath}/${storyFileName}`;
    
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Could not fetch story: ${response.statusText}`);
        }
        const text = await response.text();
        
        // Format the text for display (e.g., convert newlines to paragraphs)
        const formattedText = text.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
        storyTextContainer.innerHTML = formattedText;

    } catch (error) {
        console.error("Failed to load story content:", error);
        storyTextContainer.innerHTML = `<p class="text-red-500">Could not load the story. Please ensure the file exists and the repository is public.</p>`;
    }
}

// --- Authentication Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, show content and initialize the page
        userEmailSpan.textContent = user.email;
        pageLoader.classList.add('hidden');
        pageContent.classList.remove('hidden');
        initPage();
    } else {
        // No user is signed in, redirect to login page.
        window.location.href = 'index.html';
    }
});

// Close dropdown if clicked outside
window.onclick = function(event) {
  if (!event.target.matches('#dropdown-button') && !event.target.closest('#dropdown-button')) {
    if (dropdownContent.classList.contains('show')) {
      dropdownContent.classList.remove('show');
    }
  }
}
