// Core variables and initialization
let history = [];
let currentSimulation = '';
let currentProjectId = '';
let cachedPages = {};
window.currentModel = 'gemini-2.5-pro'; // Use window object to make it truly global
let isEditMode = false;
let currentEditElement = null;
let editMenuVisible = false;
let lastUserInput = '';
let autoSaveInterval = null; // Auto-save interval
let navigationHistory = []; // Stack to track browsing history

// Save current page to navigation history before navigating to a new page
function saveToNavigationHistory() {
    const frame = document.getElementById('simulation-frame');
    if (frame && currentSimulation) {
        navigationHistory.push({
            html: frame.srcdoc,
            prompt: currentSimulation
        });
        
        // Limit history size to prevent memory issues
        if (navigationHistory.length > 50) {
            navigationHistory.shift();
        }
    }
}

const loadingTexts = [
    "Brewing some digital magic...",
    "Assembling pixels with care...",
    "Feeding hamsters to power the server...",
    "Consulting the digital oracle...",
    "Reticulating splines...",
    "Generating witty loading messages...",
    "Proving P=NP...",
    "Dividing by zero...",
    "Spinning up the flux capacitor...",
    "Untangling the world wide web..."
];

function checkRateLimit(action, limit, timeFrame) {
    const now = Date.now();
    const actionKey = `rateLimit_${action}`;
    const storedData = JSON.parse(sessionStorage.getItem(actionKey) || '[]');
    
    // Filter out timestamps older than the time frame
    const validData = storedData.filter(timestamp => now - timestamp < timeFrame);
    
    if (validData.length >= limit) {
        return false; 
    }
    
    // Add the current timestamp to the list
    validData.push(now);
    sessionStorage.setItem(actionKey, JSON.stringify(validData));
    return true; 
}

function clearInputAndSetPlaceholder() {
    document.getElementById('addressbar').value = '';
    document.getElementById('addressbar').placeholder = "Enter text here to update or make changes to your project";
}

function initializeApp() {
    goHome();
    document.getElementById('addressbar').addEventListener('click', toggleRevisions);
    document.getElementById('addressbar').addEventListener('focus', toggleRevisions);
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#addressbar-container')) {
            hideRevisions();
        }
        if (!event.target.closest('#model-select-container')) {
            hideModelOptions();
        }
        if (!event.target.closest('#bookmarks-panel') && !event.target.closest('.btn[onclick="toggleBookmarks()"]')) {
            hideBookmarks();
        }
    });
    document.getElementById('addressbar').setAttribute('autocomplete', 'off');
    
    // Initialize model selection from localStorage
    const savedModel = localStorage.getItem('netsim_current_model');
    if (savedModel) {
        window.currentModel = savedModel;
    }
    
    // Update the UI to reflect the current model
    updateModelSelection();
    
    document.getElementById('modal-close').onclick = function() {
        document.getElementById('modal').style.display = "none";
    }
    
    document.getElementById('copy-url').onclick = function() {
        const urlInput = document.getElementById('generated-url');
        urlInput.select();
        document.execCommand('copy');
        alert('URL copied to clipboard!');
    }
    
    document.getElementById('open-url').onclick = function() {
        const url = document.getElementById('generated-url').value;
        window.open(url, '_blank');
    }

    // Ensure the bookmarks panel hides on outside clicks
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#bookmarks-panel') && !event.target.closest('.btn[onclick="toggleBookmarks()"]')) {
            hideBookmarks();
        }
    });

    // Load history from local storage
    const compressedHistory = localStorage.getItem('netsim_history');
    if (compressedHistory) {
        try {
            history = JSON.parse(LZString.decompressFromUTF16(compressedHistory) || '[]');
        } catch (error) {
            console.error('Error loading history:', error);
            history = [];
        }
    }

    const frame = document.getElementById('simulation-frame');
    if (frame && frame.contentDocument) {
        frame.contentDocument.addEventListener('contextmenu', handleRightClick);
        frame.contentDocument.addEventListener('click', handleLeftClick);
    }
    
    // Initialize auto-save functionality
    setupAutoSave();
}

function showLoadingOverlay() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="loading-overlay">
            <div id="loading-spinner"></div>
            <div id="loading-text">${getRandomLoadingText()}</div>
        </div>
    `;
    startLoadingTextAnimation();
}

function getRandomLoadingText() {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
}

function startLoadingTextAnimation() {
    const loadingText = document.getElementById('loading-text');
    setInterval(() => {
        loadingText.textContent = getRandomLoadingText();
    }, 3000);
}

function updateStatusBar(message) {
    const maxLength = 50; // Adjust this based on your design needs
    if (message.length > maxLength) {
        message = message.substring(0, maxLength) + '...';
    }
    document.getElementById('status-message').textContent = message;
}

function updatePageTitle(title) {
    const maxLength = 20;
    if (title.length > maxLength) {
        title = title.substring(0, maxLength) + '...';
    }
    document.getElementById('page-title').textContent = title;
}

function updateAddressBar(text) {
    document.getElementById('addressbar').value = text;
}

// Set up auto-save functionality
function setupAutoSave() {
    // Clear any existing auto-save interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Set up auto-save every 30 seconds when a simulation is active
    autoSaveInterval = setInterval(() => {
        if (currentSimulation && isEditMode) {
            autoSaveSimulation();
        }
    }, 30000); // 30 seconds
    
    // Also manually trigger auto-save when switching pages
    window.addEventListener('beforeunload', function() {
        if (currentSimulation && isEditMode) {
            autoSaveSimulation();
        }
    });
}

// Go back to the previous page in navigation history
function goBack() {
    // Check if there's anything in the navigation history
    if (navigationHistory.length === 0) {
        showNotification('Info', 'No previous page to go back to', 'info');
        return;
    }
    
    // Get the previous page from the history stack
    const prevPage = navigationHistory.pop();
    
    // Display the previous page
    if (prevPage && prevPage.html) {
        // Display the simulation from history
        displaySimulation(prevPage.html, prevPage.prompt || currentSimulation);
        
        // Update UI elements
        updateStatusBar('Returned to previous page');
        
        // Update address bar if prompt exists
        if (prevPage.prompt) {
            updateAddressBar(prevPage.prompt);
        }
        
        showNotification('Success', 'Returned to previous page', 'success');
    } else {
        showNotification('Error', 'Unable to go back - no previous page data', 'error');
    }
}

// Initialize model selection
function initModelSelection() {
    // This function is now deprecated - Model selection is handled directly in DOMContentLoaded
    console.log("Using new model selection implementation");
}

// Hide model options
function hideModelOptions() {
    const modelOptions = document.getElementById('model-options');
    if (modelOptions) {
        modelOptions.style.display = 'none';
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initEditModal();
    initializeApp();
    
    // Direct setup of model selection to ensure it works
    const modelBtn = document.getElementById('model-select-btn');
    const modelOptions = document.getElementById('model-options');
    const modelTextElement = document.getElementById('model-text');
    
    // Set initial model text
    updateModelSelection();
    
    // Add click event to the model button directly
    modelBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        console.log('Model button clicked'); // Debug log
        
        // Toggle display
        if (modelOptions.style.display === 'block') {
            modelOptions.style.display = 'none';
        } else {
            modelOptions.style.display = 'block';
        }
    });
    
    // Add click events to all model options
    const modelOptionElements = document.querySelectorAll('.model-option');
    modelOptionElements.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const model = this.getAttribute('data-model');
            
            console.log('Model option clicked:', model); // Debug log
            
            // Update the global currentModel variable
            window.currentModel = model;
            
            // Save the selected model to localStorage
            localStorage.setItem('netsim_current_model', model);
            
            // Update UI
            updateModelSelection();
            
            // Hide options
            modelOptions.style.display = 'none';
            
            // Show API key notification if needed
            if (!isOpenRouterApiKeySet() && model !== 'gemini-2.5-pro') {
                showApiKeyModal();
                const modelText = this.textContent.trim();
                showNotification('API Key Required', 'Please set your OpenRouter API key to use ' + modelText, 'info');
            }
        });
    });
    
    // Close model options when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#model-select-container')) {
            modelOptions.style.display = 'none';
        }
    });
});
