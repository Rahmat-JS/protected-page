// This script manages the main stories listing page (stories.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// --- GitHub Configuration ---
const githubUsername = "rahmat-js";
const githubRepo = "protected-page";
const storiesPath = "stories"; // The folder where your stories are located

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Elements ---
const pageLoader = document.getElementById('page-loader');
const pageContent = document.getElementById('page-content');
const userEmailSpan = document.getElementById('user-email');
const storyGrid = document.getElementById('story-grid');
const searchInput = document.getElementById('search-input');
const homeButton = document.getElementById('home-button');
const dropdownButton = document.getElementById('dropdown-button');
const dropdownContent = document.getElementById('dropdown-content');
const signoutButton = document.getElementById('signout-button');

// --- Page Initialization ---
function initPage() {
    setupEventListeners();
    fetchStories();
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

    // Live search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allStories = document.querySelectorAll('.story-card');
        allStories.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// --- Fetch Stories from GitHub API ---
async function fetchStories() {
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${storiesPath}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        const files = await response.json();
        
        // Filter for .txt files only
        const storyFiles = files.filter(file => file.name.endsWith('.txt'));
        
        displayStories(storyFiles);

    } catch (error) {
        console.error("Failed to fetch stories:", error);
        storyGrid.innerHTML = `<p class="text-red-500 col-span-full">Error loading stories. Please check your GitHub username/repository settings in stories.js and ensure the 'stories' folder exists.</p>`;
    }
}

// --- Display Stories on the Page ---
function displayStories(storyFiles) {
    if (storyFiles.length === 0) {
        storyGrid.innerHTML = `<p class="text-gray-500 col-span-full">No stories found in the '${storiesPath}' directory.</p>`;
        return;
    }

    storyGrid.innerHTML = ''; // Clear loader or previous content
    storyFiles.forEach(file => {
        const storyName = file.name.replace('.txt', '').replace(/-/g, ' ').replace(/_/g, ' ');
        
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `<h3>${storyName}</h3>`;
        
        // Add event listener to navigate to the story viewer
        card.addEventListener('click', () => {
            window.location.href = `story.html?name=${file.name}`;
        });
        
        storyGrid.appendChild(card);
    });
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
        // This is a fallback, as auth.js should already handle this.
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
