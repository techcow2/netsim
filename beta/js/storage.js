// Simulation Storage Management
// Handles automatic saving and retrieval of simulations

// Constants
const AUTOSAVE_KEY = 'netsim_autosaves';
const MAX_AUTOSAVES = 20; // Maximum number of auto-saves to keep

// Auto-save the current simulation
function autoSaveSimulation() {
    // Don't save if there's no simulation
    if (!currentSimulation) return;
    
    // Get the HTML content
    const frame = document.getElementById('simulation-frame');
    if (!frame) return;
    
    const htmlContent = frame.contentDocument.documentElement.outerHTML;
    
    // Get existing auto-saves
    const autoSaves = getAutoSaves();
    
    // Create a new save object
    const saveObj = {
        id: currentProjectId || generateUniqueId(),
        prompt: currentSimulation,
        html: htmlContent,
        timestamp: Date.now(),
        title: currentSimulation.length > 30 ? currentSimulation.substring(0, 30) + '...' : currentSimulation
    };
    
    // Check if this simulation already exists (by ID or prompt)
    const existingIndex = autoSaves.findIndex(s => 
        (currentProjectId && s.id === currentProjectId) || s.prompt === currentSimulation
    );
    
    if (existingIndex !== -1) {
        // Update existing save
        autoSaves[existingIndex] = saveObj;
    } else {
        // Add new save
        autoSaves.unshift(saveObj);
        
        // Keep only the most recent saves
        if (autoSaves.length > MAX_AUTOSAVES) {
            autoSaves.pop();
        }
    }
    
    // Save to local storage
    saveAutoSaves(autoSaves);
    
    console.log(`Auto-saved simulation: ${saveObj.title}`);
}

// Get all auto-saves from storage
function getAutoSaves() {
    try {
        const compressed = localStorage.getItem(AUTOSAVE_KEY);
        if (!compressed) return [];
        
        const saves = JSON.parse(LZString.decompressFromUTF16(compressed)) || [];
        return saves;
    } catch (error) {
        console.error('Error loading auto-saves:', error);
        return [];
    }
}

// Save auto-saves to storage
function saveAutoSaves(saves) {
    try {
        const compressed = LZString.compressToUTF16(JSON.stringify(saves));
        localStorage.setItem(AUTOSAVE_KEY, compressed);
    } catch (error) {
        console.error('Error saving auto-saves:', error);
        showNotification('Error', 'Failed to auto-save simulation', 'error');
    }
}

// Load a simulation from auto-save by ID
function loadAutoSave(id) {
    const autoSaves = getAutoSaves();
    const save = autoSaves.find(s => s.id === id);
    
    if (save) {
        // Set current simulation
        currentSimulation = save.prompt;
        currentProjectId = save.id;
        
        // Display the simulation
        displaySimulation(save.html, save.prompt);
        
        // Update status
        updateStatusBar('Simulation loaded successfully');
        updatePageTitle(save.prompt.substring(0, 20));
        updateAddressBar(save.prompt);
        
        // Set edit mode
        isEditMode = true;
        
        // Show publish button
        showPublishButton();
        
        showNotification('Success', 'Simulation loaded successfully', 'success');
        return true;
    }
    
    return false;
}

// Display auto-saves in a modal
function showAutoSavesModal() {
    const autoSaves = getAutoSaves();
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('autosaves-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'autosaves-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Your Saved Simulations</h2>
                    <span class="close" onclick="document.getElementById('autosaves-modal').style.display='none'">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="autosaves-list" class="autosaves-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Populate the list
    const listEl = document.getElementById('autosaves-list');
    
    if (autoSaves.length === 0) {
        listEl.innerHTML = '<p>No saved simulations found.</p>';
    } else {
        listEl.innerHTML = '';
        
        autoSaves.forEach(save => {
            const date = new Date(save.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            const saveItem = document.createElement('div');
            saveItem.className = 'autosave-item';
            saveItem.innerHTML = `
                <div class="autosave-title">${save.title}</div>
                <div class="autosave-date">${dateStr}</div>
                <div class="autosave-actions">
                    <button onclick="loadAutoSave('${save.id}')">Load</button>
                    <button onclick="deleteAutoSave('${save.id}')">Delete</button>
                </div>
            `;
            
            listEl.appendChild(saveItem);
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Delete an auto-save by ID
function deleteAutoSave(id) {
    const autoSaves = getAutoSaves();
    const newSaves = autoSaves.filter(s => s.id !== id);
    
    if (newSaves.length !== autoSaves.length) {
        saveAutoSaves(newSaves);
        showNotification('Success', 'Simulation deleted', 'success');
        
        // Refresh the modal
        showAutoSavesModal();
    }
}

// Clear all auto-saves
function clearAutoSaves() {
    if (confirm('Are you sure you want to delete all saved simulations?')) {
        localStorage.removeItem(AUTOSAVE_KEY);
        showNotification('Success', 'All saved simulations deleted', 'success');
        
        // Refresh the modal
        showAutoSavesModal();
    }
}