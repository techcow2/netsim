// Main entry point for NetSim application

// Event listeners for address bar
document.getElementById('addressbar').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleAddressBarSubmit();
    }
});

// Handle address bar submission
async function handleAddressBarSubmit() {
    const input = document.getElementById('addressbar').value;
    if (input.trim() === '') return;

    if (currentSimulation && isEditMode) {
        await continueSimulation(input);
    } else {
        await loadPage(input);
    }
}

// Generate a unique ID for projects
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
