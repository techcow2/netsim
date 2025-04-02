// OpenRouter API Integration

// Get API key from local storage or return null if not set
function getOpenRouterApiKey() {
    return localStorage.getItem('openrouter_api_key');
}

// Save API key to local storage
function saveOpenRouterApiKey(apiKey) {
    localStorage.setItem('openrouter_api_key', apiKey);
}

// Check if API key is set
function isOpenRouterApiKeySet() {
    return !!getOpenRouterApiKey();
}

// Clear API key from local storage
function clearOpenRouterApiKey() {
    localStorage.removeItem('openrouter_api_key');
}

// Validate API key by making a simple request
async function validateOpenRouterApiKey(apiKey) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'NetSim'
            }
        });
        
        if (!response.ok) {
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('API Key validation error:', error);
        return false;
    }
}

// Get the OpenRouter model ID based on the selected model
function getOpenRouterModelId(model) {
    switch(model) {
        case 'gemini-2.5-pro':
            return 'google/gemini-2.5-pro-exp-03-25:free';
        case 'claude-3.5-sonnet':
            return 'anthropic/claude-3.5-sonnet';
        case 'gpt-4o':
            return 'openai/gpt-4o';
        default:
            return 'google/gemini-2.5-pro-exp-03-25:free';
    }
}

// Generate content using OpenRouter API
async function generateWithOpenRouter(prompt, options = {}) {
    const apiKey = getOpenRouterApiKey();
    
    if (!apiKey) {
        throw new Error('OpenRouter API key is not set. Please set your API key in the settings.');
    }
    
    // Get the current model
    const modelId = getOpenRouterModelId(getCurrentModel());
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'NetSim'
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                ...options
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error connecting to OpenRouter API');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
}

// Show API key modal
function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('openrouter-api-key');
    
    // Set current API key if exists
    if (isOpenRouterApiKeySet()) {
        apiKeyInput.value = getOpenRouterApiKey();
    }
    
    modal.style.display = 'block';
}

// Initialize API key modal event listeners
function initApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const saveButton = document.getElementById('save-api-key');
    const cancelButton = document.getElementById('cancel-api-key');
    const closeButton = document.querySelector('#apiKeyModal .modal-close');
    
    saveButton.addEventListener('click', async function() {
        const apiKey = document.getElementById('openrouter-api-key').value.trim();
        if (apiKey) {
            // Show loading notification
            showNotification('Validating', 'Validating API key...', 'info');
            
            // Validate the API key
            const isValid = await validateOpenRouterApiKey(apiKey);
            
            if (isValid) {
                saveOpenRouterApiKey(apiKey);
                modal.style.display = 'none';
                showNotification('Success', 'API key saved successfully!', 'success');
            } else {
                showNotification('Error', 'Invalid API key. Please check and try again.', 'error');
            }
        } else {
            showNotification('Error', 'Please enter a valid API key', 'error');
        }
    });
    
    cancelButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
}
