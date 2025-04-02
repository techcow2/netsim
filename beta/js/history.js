// History and revision management

function saveRevision(prompt) {
    if (!prompt) return;
    
    const frame = document.getElementById('simulation-frame');
    if (!frame) return;
    
    const htmlContent = frame.contentDocument.documentElement.outerHTML;
    
    // Create revision object
    const revision = {
        prompt: prompt,
        html: htmlContent,
        date: new Date().toISOString()
    };
    
    // Add to history
    history.unshift(revision);
    
    // Limit history size
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Save history to local storage
    localStorage.setItem('netsim_history', LZString.compressToUTF16(JSON.stringify(history)));
    
    // Update last user input
    lastUserInput = prompt;
}

function toggleRevisions() {
    const revisionsPanel = document.getElementById('revisions-panel');
    
    if (revisionsPanel) {
        if (revisionsPanel.style.display === 'block') {
            hideRevisions();
        } else {
            showRevisions();
        }
    } else {
        showRevisions();
    }
}

function showRevisions() {
    // Create revisions panel if it doesn't exist
    let revisionsPanel = document.getElementById('revisions-panel');
    
    if (!revisionsPanel) {
        revisionsPanel = document.createElement('div');
        revisionsPanel.id = 'revisions-panel';
        document.getElementById('addressbar-container').appendChild(revisionsPanel);
    }
    
    // Generate HTML for revisions
    let html = '<div class="revisions-header">Recent Prompts</div>';
    
    if (history.length === 0) {
        html += '<div class="empty-revisions">No history yet</div>';
    } else {
        history.forEach((revision, index) => {
            html += `<div class="revision-item" onclick="loadRevision(${index})">${revision.prompt}</div>`;
        });
    }
    
    // Set the HTML and show the panel
    revisionsPanel.innerHTML = html;
    revisionsPanel.style.display = 'block';
}

function hideRevisions() {
    const revisionsPanel = document.getElementById('revisions-panel');
    if (revisionsPanel) {
        revisionsPanel.style.display = 'none';
    }
}

function loadRevision(index) {
    if (index >= 0 && index < history.length) {
        const revision = history[index];
        
        // Set current simulation
        currentSimulation = revision.prompt;
        
        // Display the simulation
        displaySimulation(revision.html, revision.prompt);
        
        // Update status
        updateStatusBar('Revision loaded successfully');
        updatePageTitle(revision.prompt.substring(0, 20));
        updateAddressBar(revision.prompt);
        
        // Set edit mode
        isEditMode = true;
        
        // Show publish button
        showPublishButton();
        
        // Hide revisions panel
        hideRevisions();
        
        // Show notification
        showNotification('Success', 'Revision loaded successfully!', 'success');
    }
}
