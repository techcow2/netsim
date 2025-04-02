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

// Pixabay API Integration
// Get Pixabay API key from local storage or return null if not set
function getPixabayApiKey() {
    return localStorage.getItem('pixabay_api_key');
}

// Save Pixabay API key to local storage
function savePixabayApiKey(apiKey) {
    localStorage.setItem('pixabay_api_key', apiKey);
}

// Check if Pixabay API key is set
function isPixabayApiKeySet() {
    return !!getPixabayApiKey();
}

// Clear Pixabay API key from local storage
function clearPixabayApiKey() {
    localStorage.removeItem('pixabay_api_key');
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
        case 'deepseek-chat':
            return 'deepseek/deepseek-chat-v3-0324:free';
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
    
    // Get the current model directly from the window object
    const modelId = getOpenRouterModelId(window.currentModel || 'gemini-2.5-pro');
    
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
        console.log('OpenRouter API response:', data);
        
        // Handle different response formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else if (data.response) {
            // Some models might return a direct response property
            return data.response;
        } else if (data.output && data.output.content) {
            // Handle newer API format
            return data.output.content;
        } else if (data.text) {
            // Some APIs return direct text
            return data.text;
        } else {
            // Try to find content in any available nested structure
            const content = JSON.stringify(data);
            console.log('Unable to extract content from standard format, returning raw response');
            return content;
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
}

// Generate content with multimodal input (text and images)
async function generateWithMultimodal(textPrompt, imageUrls = [], options = {}) {
    const apiKey = getOpenRouterApiKey();
    
    if (!apiKey) {
        throw new Error('OpenRouter API key is not set. Please set your API key in the settings.');
    }
    
    // Get the current model directly from the window object
    const modelId = getOpenRouterModelId(window.currentModel || 'gemini-2.5-pro');
    
    // Create content array with text and images
    const content = [
        {
            type: "text",
            text: textPrompt
        }
    ];
    
    // Add images if provided
    if (imageUrls && imageUrls.length > 0) {
        imageUrls.forEach(url => {
            content.push({
                type: "image_url",
                image_url: {
                    url: url
                }
            });
        });
    }
    
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
                        content: content
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
        console.log('OpenRouter API multimodal response:', data);
        
        // Handle different response formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else if (data.response) {
            // Some models might return a direct response property
            return data.response;
        } else if (data.output && data.output.content) {
            // Handle newer API format
            return data.output.content;
        } else if (data.text) {
            // Some APIs return direct text
            return data.text;
        } else {
            // Try to find content in any available nested structure
            const content = JSON.stringify(data);
            console.log('Unable to extract content from standard format, returning raw response');
            return content;
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
}

// Show API key modal
function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const openRouterApiKeyInput = document.getElementById('openrouter-api-key');
    const pixabayApiKeyInput = document.getElementById('pixabay-api-key');
    
    // Set current API keys if they exist
    if (isOpenRouterApiKeySet()) {
        openRouterApiKeyInput.value = getOpenRouterApiKey();
    }
    
    if (isPixabayApiKeySet()) {
        pixabayApiKeyInput.value = getPixabayApiKey();
    }
    
    modal.style.display = 'block';
}

// Initialize API key modal event listeners
function initApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const saveButton = document.getElementById('save-api-key');
    const cancelButton = document.getElementById('cancel-api-key');
    const closeButton = document.querySelector('#apiKeyModal .modal-close');
    const openRouterApiKeyInput = document.getElementById('openrouter-api-key');
    const pixabayApiKeyInput = document.getElementById('pixabay-api-key');
    
    // Set current API keys if they exist
    if (isOpenRouterApiKeySet()) {
        openRouterApiKeyInput.value = getOpenRouterApiKey();
    }
    
    if (isPixabayApiKeySet()) {
        pixabayApiKeyInput.value = getPixabayApiKey();
    }
    
    saveButton.addEventListener('click', async function() {
        const openRouterApiKey = openRouterApiKeyInput.value.trim();
        const pixabayApiKey = pixabayApiKeyInput.value.trim();
        let validationPassed = true;
        
        // Validate and save OpenRouter API key if provided
        if (openRouterApiKey) {
            showNotification('Validating', 'Validating OpenRouter API key...', 'info');
            
            const isValid = await validateOpenRouterApiKey(openRouterApiKey);
            
            if (isValid) {
                saveOpenRouterApiKey(openRouterApiKey);
            } else {
                showNotification('Error', 'Invalid OpenRouter API key. Please check and try again.', 'error');
                validationPassed = false;
            }
        } else {
            // If key field is empty but previously had a value, show a warning
            if (isOpenRouterApiKeySet()) {
                showNotification('Warning', 'OpenRouter API key is required for AI functionality.', 'warning');
            }
        }
        
        // Save Pixabay API key if provided (no validation required)
        if (pixabayApiKey) {
            savePixabayApiKey(pixabayApiKey);
        }
        
        // If all validations passed, close modal and show success
        if (validationPassed) {
            modal.style.display = 'none';
            showNotification('Success', 'API settings saved successfully!', 'success');
        }
    });
    
    cancelButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
}
