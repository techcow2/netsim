// Element editing functionality

// Generate a unique identifier for elements to help with targeting
function generateUniqueIdentifier(element) {
    // Check if element already has an ID
    if (element.id) {
        return element.id;
    }
    
    // Generate a unique ID based on tag name and random string
    const tagName = element.tagName.toLowerCase();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueId = `${tagName}-${randomString}`;
    
    // Set the ID on the element
    element.id = uniqueId;
    
    return uniqueId;
}

// Get the full path to an element for precise targeting
function getElementPath(element) {
    if (!element || element.tagName === 'HTML') {
        return 'html';
    }
    
    let path = '';
    let current = element;
    
    while (current && current.tagName !== 'HTML') {
        let selector = current.tagName.toLowerCase();
        
        if (current.id) {
            selector += `#${current.id}`;
        } else if (current.className) {
            const classes = Array.from(current.classList).join('.');
            if (classes) {
                selector += `.${classes}`;
            }
        }
        
        path = path ? `${selector} > ${path}` : selector;
        current = current.parentElement;
    }
    
    return path;
}

// Handle right-click on elements in the iframe
function handleRightClick(event) {
    // Prevent default context menu
    event.preventDefault();
    
    // Get the target element
    const element = event.target;
    
    // Remove any existing highlight and menu
    removeHighlightAndMenu();
    
    // Skip if body or html
    if (element.tagName === 'BODY' || element.tagName === 'HTML') {
        return;
    }
    
    // Generate unique identifier for the element if it doesn't have one
    const elementId = generateUniqueIdentifier(element);
    
    // Highlight the element
    highlightElement(element);
    
    // Set current edit element
    currentEditElement = element;
    
    // Create edit menu
    const editMenu = document.createElement('div');
    editMenu.id = 'element-edit-menu';
    editMenu.className = 'element-edit-menu';
    editMenu.style.position = 'absolute';
    editMenu.style.left = `${event.pageX}px`;
    editMenu.style.top = `${event.pageY}px`;
    
    // Add menu items
    editMenu.innerHTML = `
        <div class="edit-menu-item" data-action="edit">
            <i class="fas fa-edit"></i> Edit Content
        </div>
        <div class="edit-menu-item" data-action="style">
            <i class="fas fa-paint-brush"></i> Edit Style
        </div>
        <div class="edit-menu-item" data-action="replace">
            <i class="fas fa-exchange-alt"></i> Replace Element
        </div>
        <div class="edit-menu-item" data-action="duplicate">
            <i class="fas fa-copy"></i> Duplicate
        </div>
        <div class="edit-menu-item" data-action="delete">
            <i class="fas fa-trash"></i> Delete
        </div>
    `;
    
    // Add to document
    const doc = event.target.ownerDocument;
    doc.body.appendChild(editMenu);
    
    // Add event listeners to menu items
    const menuItems = editMenu.querySelectorAll('.edit-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch (action) {
                case 'edit':
                    showEditModal(element, 'edit');
                    break;
                case 'style':
                    showEditModal(element, 'style');
                    break;
                case 'replace':
                    showEditModal(element, 'replace');
                    break;
                case 'duplicate':
                    duplicateElement(element);
                    break;
                case 'delete':
                    deleteElement(element);
                    break;
            }
            
            // Remove menu
            doc.body.removeChild(editMenu);
        });
    });
    
    // Close menu when clicking outside
    doc.addEventListener('click', function closeMenu(e) {
        if (!editMenu.contains(e.target) && e.target !== editMenu) {
            if (doc.body.contains(editMenu)) {
                doc.body.removeChild(editMenu);
            }
            doc.removeEventListener('click', closeMenu);
        }
    });
    
    // Set edit menu visible flag
    editMenuVisible = true;
}

// Show edit modal with appropriate mode
function showEditModal(element, mode) {
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('edit-input');
    const label = document.getElementById('edit-mode-label');
    
    // Set current edit element
    currentEditElement = element;
    
    // Set w-tid attribute for element tracking if it doesn't exist
    if (!element.hasAttribute('w-tid')) {
        const tagId = generateUniqueId();
        element.setAttribute('w-tid', tagId);
    }
    
    // Set modal title and placeholder based on mode
    if (mode === 'edit') {
        label.textContent = 'Edit Content';
        input.placeholder = 'Enter new content for this element';
        input.value = element.innerHTML;
    } else if (mode === 'style') {
        label.textContent = 'Edit Style';
        input.placeholder = 'Enter CSS styles (e.g., color: red; font-size: 16px;)';
        input.value = element.getAttribute('style') || '';
    } else if (mode === 'replace') {
        label.textContent = 'Replace Element';
        input.placeholder = 'Describe what to replace this element with';
        input.value = '';
    }
    
    // Store the edit mode
    input.setAttribute('data-mode', mode);
    
    // Show modal
    modal.style.display = 'block';
    
    // Focus input
    input.focus();
}

// Generate a unique ID for tagging elements
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 10);
}

// Process edit operations using the new system prompt
async function editElementWithPrompt(operations) {
    if (!operations || !operations.length) {
        showNotification('Error', 'No edit operations provided', 'error');
        return;
    }
    
    const frame = document.getElementById('simulation-frame');
    if (!frame) {
        showNotification('Error', 'Simulation frame not found', 'error');
        return;
    }
    
    const doc = frame.contentDocument || frame.contentWindow.document;
    const currentHTML = doc.documentElement.outerHTML;
    
    // Prepare the edit payload
    const editPayload = {
        operations: operations.map(op => ({
            tagId: op.tagId,
            prompt: op.prompt
        }))
    };
    
    try {
        showLoadingIndicator();
        
        const editPrompt = `You are now in a subroutine to apply edits to the page.

Edit payloads come with the following type:

interface EditPayload {
  operations: EditOperation[];
}
interface EditOperation {
  tagId: string; 
  prompt: string;
}

Apply the changes to the appropriate elements based on the \`w-tid\` attribute. 
Only return the elements that need to be changed. These can extend beyond the tag ids specified in the edit payload.
Please preserve the \`w-tid\` attributes of only the top level elements.`;

        // Call the API with the current HTML and edit payload
        const response = await generateWithOpenRouter(`${editPrompt}

Current HTML: ${currentHTML}

Edit Payload: ${JSON.stringify(editPayload)}`);
        
        // Apply the changes to the page
        applyEditChanges(response);
        
        hideLoadingIndicator();
        showNotification('Success', 'Element updated successfully!', 'success');
    } catch (error) {
        hideLoadingIndicator();
        showNotification('Error', `Failed to edit element: ${error.message}`, 'error');
        console.error('Error editing element with prompt:', error);
    }
}

// Apply the edit changes to the page
function applyEditChanges(htmlChanges) {
    const frame = document.getElementById('simulation-frame');
    if (!frame) return;
    
    const doc = frame.contentDocument || frame.contentWindow.document;
    
    // Create a temporary div to parse the HTML changes
    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = htmlChanges;
    
    // For each element with a w-tid attribute in the response
    const changedElements = tempDiv.querySelectorAll('[w-tid]');
    changedElements.forEach(changedElement => {
        const tagId = changedElement.getAttribute('w-tid');
        const originalElement = doc.querySelector(`[w-tid="${tagId}"]`);
        
        if (originalElement) {
            // Replace the original element with the changed one
            originalElement.parentNode.replaceChild(
                doc.importNode(changedElement, true),
                originalElement
            );
        }
    });
}

// Update element based on user input
function updateElement() {
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('edit-input');
    const mode = input.getAttribute('data-mode');
    const value = input.value;
    
    if (!currentEditElement) {
        modal.style.display = 'none';
        return;
    }
    
    // Apply changes based on mode
    if (mode === 'edit') {
        if (currentEditElement.hasAttribute('w-tid')) {
            // Use the new edit system prompt
            const tagId = currentEditElement.getAttribute('w-tid');
            editElementWithPrompt([{ tagId, prompt: value }]);
        } else {
            currentEditElement.innerHTML = value;
            showNotification('Success', 'Element content updated!', 'success');
        }
    } else if (mode === 'style') {
        currentEditElement.setAttribute('style', value);
        showNotification('Success', 'Element style updated!', 'success');
    } else if (mode === 'replace') {
        // For replace, we need to use the API to generate new HTML
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';
        
        // Get element path for targeting
        const elementPath = getElementPath(currentEditElement);
        
        // Get the current HTML content
        const frame = document.getElementById('simulation-frame');
        const currentContent = frame ? frame.contentDocument.documentElement.outerHTML : '';
        
        // Make API request to replace element
        axios.post('https://api.netsim.xyz/replace-element', {
            html: currentContent,
            elementPath: elementPath,
            replacement: value,
            model: getCurrentModel()
        })
        .then(response => {
            if (response.data && response.data.html) {
                // Display the updated simulation
                displaySimulation(response.data.html, currentSimulation);
                showNotification('Success', 'Element replaced successfully!', 'success');
            } else {
                throw new Error('Invalid response from server');
            }
            loadingOverlay.style.display = 'none';
        })
        .catch(error => {
            console.error('Error replacing element:', error);
            loadingOverlay.style.display = 'none';
            showNotification('Error', 'Failed to replace element: ' + (error.message || 'Unknown error'), 'error');
        });
    }
    
    // Close modal
    modal.style.display = 'none';
    input.value = '';
    
    // Clear current edit element
    currentEditElement = null;
}

// Duplicate an element
function duplicateElement(element) {
    if (!element) return;
    
    // Clone the element
    const clone = element.cloneNode(true);
    
    // Generate a new ID for the clone
    const newId = generateUniqueIdentifier(clone);
    
    // Insert after the original element
    element.parentNode.insertBefore(clone, element.nextSibling);
    
    // Add event listeners to the clone
    clone.addEventListener('contextmenu', handleRightClick);
    
    // Add event listeners to all children of the clone
    const children = clone.querySelectorAll('*');
    children.forEach(child => {
        child.addEventListener('contextmenu', handleRightClick);
    });
    
    showNotification('Success', 'Element duplicated!', 'success');
}

// Delete an element
function deleteElement(element) {
    if (!element) return;
    
    // Confirm deletion
    const doc = element.ownerDocument;
    
    // Remove the element
    element.parentNode.removeChild(element);
    
    // Remove highlight and menu
    removeHighlightAndMenu();
    
    showNotification('Success', 'Element deleted!', 'success');
}

function highlightElement(element) {
    // Add highlight class
    element.classList.add('netsim-highlight');
    
    // Store original styles
    element.setAttribute('data-original-outline', element.style.outline);
    element.setAttribute('data-original-position', element.style.position);
    
    // Add highlight styles
    element.style.outline = '2px dashed #ff5722';
    element.style.position = element.style.position === 'static' ? 'relative' : element.style.position;
}

function removeHighlightAndMenu() {
    // Get the iframe document
    const frame = document.getElementById('simulation-frame');
    if (!frame) return;
    
    const doc = frame.contentDocument || frame.contentWindow.document;
    
    // Remove any existing highlight
    const highlighted = doc.querySelector('.netsim-highlight');
    if (highlighted) {
        // Restore original styles
        highlighted.style.outline = highlighted.getAttribute('data-original-outline') || '';
        highlighted.style.position = highlighted.getAttribute('data-original-position') || '';
        
        // Remove highlight class
        highlighted.classList.remove('netsim-highlight');
    }
    
    // Remove any existing edit menu
    const menu = doc.getElementById('element-edit-menu');
    if (menu) {
        menu.parentNode.removeChild(menu);
    }
    
    // Reset edit menu visible flag
    editMenuVisible = false;
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('edit-input');
    
    modal.style.display = 'none';
    input.value = '';
    
    // Clear current edit element
    currentEditElement = null;
}

function handleLeftClick(event) {
    // Remove highlight and menu if clicking outside of menu
    if (editMenuVisible && !event.target.closest('#element-edit-menu')) {
        removeHighlightAndMenu();
    }
}

// Initialize the edit modal event listeners
function initEditModal() {
    const updateButton = document.getElementById('update-element');
    const cancelButton = document.getElementById('cancel-edit');
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    
    // Update button click
    updateButton.addEventListener('click', updateElement);
    
    // Cancel button click
    cancelButton.addEventListener('click', () => {
        editModal.style.display = 'none';
        editInput.value = '';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
            editInput.value = '';
        }
    });
    
    // Handle Enter key in input
    editInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            updateElement();
        }
    });
}

// Add event listeners to elements in the iframe
function addEventListenersToIframe(iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Add right-click event listeners to all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(element => {
        element.addEventListener('contextmenu', handleRightClick);
    });
}
