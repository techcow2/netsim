// NetSim - Main Script File
// This file serves as an entry point to the application and loads all required modules

// Load required modules via script tags
document.addEventListener('DOMContentLoaded', function() {
    // Main initialization will be called after all modules are loaded
});

// Forward to the main.js handleAddressBarSubmit function when Enter is pressed
document.getElementById('addressbar')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (typeof handleAddressBarSubmit === 'function') {
            handleAddressBarSubmit();
        } else {
            console.error('handleAddressBarSubmit function not available yet');
        }
    }
});

// Initialize the window controls
window.onload = function() {
    // Add event listeners to the window buttons
    document.getElementById('close-button')?.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default behavior
        // Custom close behavior here
    });

    document.getElementById('minimize-button')?.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default behavior
        // Custom minimize behavior here
    });

    // Add event listener to the maximize button
    document.getElementById('maximize-button')?.addEventListener('click', function() {
        const browser = document.getElementById('browser');
        if (!browser) return;
        
        if (browser.style.width === '100%') {
            browser.style.width = '90%';
            browser.style.height = '90%';
            browser.style.top = '5%';
            browser.style.left = '5%';
        } else {
            browser.style.width = '100%';
            browser.style.height = '100%';
            browser.style.top = '0';
            browser.style.left = '0';
        }
    });
};
