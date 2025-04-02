// UI-related functionality

function refreshPage() {
    if (currentSimulation) {
        const cachedContent = cachedPages[currentSimulation];
        if (cachedContent) {
            displaySimulation(cachedContent, currentSimulation);
            showNotification('Success', 'Page refreshed successfully!', 'success');
        } else {
            showNotification('Error', 'Cannot refresh page. No cached content found.', 'error');
        }
    } else {
        goHome();
    }
}

function goHome() {
    // Reset current simulation
    currentSimulation = '';
    isEditMode = false;
    
    // Hide publish button
    hidePublishButton();
    
    // Update status
    updateStatusBar('Ready');
    updatePageTitle('NetSim - AI Powered Simulations');
    updateAddressBar('');
    
    // Get the content element
    const content = document.getElementById('content');
    
    // Set the home page content
    content.innerHTML = `
        <div class="min-h-screen text-white font-sans">
            <div class="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <img src="logo.png" alt="Logo" class="logo-img" style="max-width: 50%; height: auto; display: block; margin: 0 auto; padding: 0; line-height: 0;">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl">
                        <h2 class="text-3xl font-bold mb-6 text-yellow-300">How to Use NetSim</h2>
                        <ol class="list-decimal list-inside space-y-3">
                            <li>Enter a description in the address bar</li>
                            <li>Click "Create" or press Enter</li>
                            <li>Wait for AI to generate your web experience</li>
                            <li>Interact with your creation</li>
                            <li>Update by entering new instructions</li>
                            <li>Use right-click to edit specific elements</li>
                            <li>Bookmark your project</li>
                            <li>Publish to get a shareable link</li>
                            <li>Download as an HTML file</li>
                        </ol>
                    </div>
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl">
                        <h2 class="text-3xl font-bold mb-6 text-yellow-300">Features</h2>
                        <ul class="list-disc list-inside space-y-3">
                            <li>Instant Web Generation</li>
                            <li>Interactive Simulated Browser</li>
                            <li>Project Updates</li>
                            <li>Right-Click Element Editing</li>
                            <li>Bookmarking</li>
                            <li>Publishing</li>
                            <li>Downloading</li>
                            <li>Revisions</li>
                            <li>Model Selection</li>
                        </ul>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl">
                        <h3 class="text-2xl font-bold mb-4 text-yellow-300">Example Prompts</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-blue-300 hover:text-blue-100" onclick="updateAddressBar('Create a calculator app with basic math functions')">Calculator App</a></li>
                            <li><a href="#" class="text-blue-300 hover:text-blue-100" onclick="updateAddressBar('Make a to-do list app with the ability to add, complete, and delete tasks')">To-Do List</a></li>
                            <li><a href="#" class="text-blue-300 hover:text-blue-100" onclick="updateAddressBar('Design a weather app that shows current conditions and a 5-day forecast')">Weather App</a></li>
                            <li><a href="#" class="text-blue-300 hover:text-blue-100" onclick="updateAddressBar('Create a simple game where you catch falling objects')">Simple Game</a></li>
                            <li><a href="#" class="text-blue-300 hover:text-blue-100" onclick="updateAddressBar('Make a portfolio website for a photographer with a gallery')">Portfolio Site</a></li>
                        </ul>
                    </div>
                    
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl">
                        <h3 class="text-2xl font-bold mb-4 text-yellow-300">Recent Updates</h3>
                        <ul class="space-y-2">
                            <li>Enhanced element editing</li>
                            <li>Improved simulation generation</li>
                            <li>Added model selection</li>
                            <li>Better mobile support</li>
                            <li>Performance optimizations</li>
                        </ul>
                    </div>
                    
                    <div class="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl">
                        <h3 class="text-2xl font-bold mb-4 text-yellow-300">Get Started</h3>
                        <p class="mb-4">Type a description of what you want to create in the address bar above and press Enter.</p>
                        <p>Be as specific as possible for best results!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displaySimulation(htmlContent, title) {
    // Save current page to navigation history before loading a new page
    if (currentSimulation) {
        saveToNavigationHistory();
    }
    
    const content = document.getElementById('content');
    
    // Create iframe to display the simulation
    content.innerHTML = `<iframe id="simulation-frame" sandbox="allow-same-origin allow-scripts allow-forms" frameborder="0"></iframe>`;
    
    const frame = document.getElementById('simulation-frame');
    
    // Strip out any markdown formatting if present
    let cleanContent = htmlContent;
    if (htmlContent.startsWith('```html')) {
        cleanContent = htmlContent.replace(/```html\n|```$/g, '');
    }
    
    // Write the HTML content to the iframe
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(cleanContent);
    doc.close();
    
    // Add event listeners to the iframe
    frame.contentDocument.addEventListener('contextmenu', handleRightClick);
    frame.contentDocument.addEventListener('click', handleLeftClick);
    
    // Update title
    updatePageTitle(title.substring(0, 20));
    
    // If we have a current simulation and are in edit mode, auto-save it
    if (currentSimulation && isEditMode) {
        // Use a small timeout to ensure the DOM is fully rendered
        setTimeout(() => {
            autoSaveSimulation();
        }, 500);
    }
}

function downloadSimulation() {
    const frame = document.getElementById('simulation-frame');
    
    if (!frame) {
        showNotification('Error', 'No simulation to download', 'error');
        return;
    }
    
    const htmlContent = frame.contentDocument.documentElement.outerHTML;
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'simulation.html';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Success', 'Simulation downloaded successfully!', 'success');
}

function toggleBookmarks() {
    const panel = document.getElementById('bookmarks-panel');
    if (panel.style.display === 'block') {
        hideBookmarks();
    } else {
        loadBookmarks();
        panel.style.display = 'block';
    }
}

function hideBookmarks() {
    const panel = document.getElementById('bookmarks-panel');
    panel.style.display = 'none';
}

function loadBookmarks() {
    const panel = document.getElementById('bookmarks-panel');
    panel.innerHTML = '';
    
    // Get bookmarks from local storage
    const compressedBookmarks = localStorage.getItem('netsim_bookmarks');
    let bookmarks = [];
    
    if (compressedBookmarks) {
        try {
            bookmarks = JSON.parse(LZString.decompressFromUTF16(compressedBookmarks)) || [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            bookmarks = [];
        }
    }
    
    if (bookmarks.length === 0) {
        panel.innerHTML = '<div class="empty-state">No bookmarks yet</div>';
        return;
    }
    
    // Add header with clear button
    const header = document.createElement('div');
    header.className = 'bookmarks-header';
    header.innerHTML = `
        <h3>Bookmarks</h3>
        <button onclick="clearBookmarks()">Clear All</button>
    `;
    panel.appendChild(header);
    
    // Add bookmarks
    bookmarks.forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <span class="bookmark-title">${bookmark.title}</span>
            <div class="bookmark-actions">
                <button onclick="loadBookmark('${bookmark.prompt}')">Load</button>
                <button onclick="removeBookmark('${bookmark.prompt}')">Remove</button>
            </div>
        `;
        panel.appendChild(item);
    });
}

function addBookmark() {
    if (!currentSimulation) {
        showNotification('Error', 'No simulation to bookmark', 'error');
        return;
    }
    
    // Get bookmarks from local storage
    const compressedBookmarks = localStorage.getItem('netsim_bookmarks');
    let bookmarks = [];
    
    if (compressedBookmarks) {
        try {
            bookmarks = JSON.parse(LZString.decompressFromUTF16(compressedBookmarks)) || [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            bookmarks = [];
        }
    }
    
    // Check if already bookmarked
    if (bookmarks.some(b => b.prompt === currentSimulation)) {
        showNotification('Info', 'Already bookmarked', 'info');
        return;
    }
    
    // Add to bookmarks
    bookmarks.push({
        title: currentSimulation.length > 30 ? currentSimulation.substring(0, 30) + '...' : currentSimulation,
        prompt: currentSimulation
    });
    
    // Save to local storage
    localStorage.setItem('netsim_bookmarks', LZString.compressToUTF16(JSON.stringify(bookmarks)));
    
    showNotification('Success', 'Bookmark added', 'success');
}

function removeBookmark(prompt) {
    // Get bookmarks from local storage
    const compressedBookmarks = localStorage.getItem('netsim_bookmarks');
    let bookmarks = [];
    
    if (compressedBookmarks) {
        try {
            bookmarks = JSON.parse(LZString.decompressFromUTF16(compressedBookmarks)) || [];
            // Filter out the bookmark to remove
            bookmarks = bookmarks.filter(b => b.prompt !== prompt);
            // Save to local storage
            localStorage.setItem('netsim_bookmarks', LZString.compressToUTF16(JSON.stringify(bookmarks)));
            // Reload bookmarks panel
            loadBookmarks();
            showNotification('Success', 'Bookmark removed', 'success');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            showNotification('Error', 'Failed to remove bookmark', 'error');
        }
    }
}

function clearBookmarks() {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
        localStorage.setItem('netsim_bookmarks', LZString.compressToUTF16('[]'));
        loadBookmarks();
        showNotification('Success', 'All bookmarks cleared', 'success');
    }
}

function loadBookmark(prompt) {
    const compressedBookmarks = localStorage.getItem('netsim_bookmarks');
    let bookmarks = [];
    
    if (compressedBookmarks) {
        try {
            bookmarks = JSON.parse(LZString.decompressFromUTF16(compressedBookmarks)) || [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            bookmarks = [];
        }
    }
    
    const bookmark = bookmarks.find(b => b.prompt === prompt);
    
    if (bookmark) {
        // Set current simulation
        currentSimulation = bookmark.prompt;
        currentProjectId = bookmark.projectId || generateUniqueId();
        
        // Display the simulation
        displaySimulation(bookmark.html, bookmark.prompt);
        
        // Update status
        updateStatusBar('Bookmark loaded successfully');
        updatePageTitle(bookmark.prompt.substring(0, 20));
        updateAddressBar(bookmark.prompt);
        
        // Set edit mode
        isEditMode = true;
        
        // Show publish button
        showPublishButton();
        
        // Hide bookmarks panel
        hideBookmarks();
        
        // Show notification
        showNotification('Success', 'Bookmark loaded successfully!', 'success');
    }
}

function toggleModelOptions() {
    console.log("This function is deprecated - Using direct event handler in core.js");
    // Let the code in core.js handle this functionality
}

function hideModelOptions() {
    const options = document.getElementById('model-options');
    options.style.display = 'none';
}

function updateModelSelection() {
    const modelBtn = document.getElementById('model-select-btn');
    const modelOptions = document.querySelectorAll('.model-option');
    const modelTextElement = document.getElementById('model-text');
    
    // Get the current model from the global variable or localStorage
    const model = window.currentModel || localStorage.getItem('netsim_current_model') || 'gemini-2.5-pro';
    
    // Set the current model text
    let modelText = '';
    switch (model) {
        case 'claude-3.5-sonnet':
            modelText = 'Claude 3.5 Sonnet';
            break;
        case 'gpt-4o':
            modelText = 'GPT-4o';
            break;
        case 'gemini-2.5-pro':
            modelText = 'Gemini 2.5 Pro (Free Exp)';
            break;
        case 'deepseek-chat':
            modelText = 'DeepSeek Chat';
            break;
        default:
            modelText = 'Select Model';
    }
    
    // Update the button text and span element
    modelTextElement.textContent = modelText;
    modelBtn.setAttribute('title', `Using ${modelText}`);
    
    // Highlight the selected model
    modelOptions.forEach(option => {
        if (option.getAttribute('data-model') === model) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    console.log('Model selection updated to:', model); // Debug log
}

function getCurrentModel() {
    return window.currentModel || localStorage.getItem('netsim_current_model') || 'gemini-2.5-pro';
}

// Global variable to store uploaded images
let uploadedImages = [];

// Show image upload modal
function showImageUploadModal() {
    const modal = document.getElementById('image-upload-modal');
    modal.style.display = 'block';
}

// Initialize image upload modal
function initImageUploadModal() {
    const modal = document.getElementById('image-upload-modal');
    const uploadBtn = document.getElementById('upload-image-btn');
    const fileInput = document.getElementById('image-upload-input');
    const closeButton = document.querySelector('#image-upload-modal .modal-close');
    
    // Handle file upload
    uploadBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                // Add to uploaded images array
                uploadedImages.push(imageUrl);
                
                // Show notification
                showNotification('Success', 'Image uploaded successfully!', 'success');
                
                // Clear file input
                fileInput.value = '';
                
                // Close modal
                modal.style.display = 'none';
                
                // Update UI to show uploaded images
                updateUploadedImagesUI();
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Error', 'Please select an image to upload', 'error');
        }
    });
    
    // Close modal when clicking the close button
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Update UI to show uploaded images
function updateUploadedImagesUI() {
    // Check if images container exists, if not create it
    let imagesContainer = document.getElementById('uploaded-images-container');
    
    if (!imagesContainer) {
        // Create container
        imagesContainer = document.createElement('div');
        imagesContainer.id = 'uploaded-images-container';
        imagesContainer.className = 'uploaded-images-container';
        
        // Insert after address bar
        const addressBar = document.getElementById('addressbar');
        addressBar.parentNode.insertBefore(imagesContainer, addressBar.nextSibling);
    }
    
    // Clear container
    imagesContainer.innerHTML = '';
    
    // Add images
    uploadedImages.forEach((imageUrl, index) => {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'uploaded-image-wrapper';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'uploaded-image-thumbnail';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', function() {
            // Remove image from array
            uploadedImages.splice(index, 1);
            // Update UI
            updateUploadedImagesUI();
        });
        
        imageWrapper.appendChild(img);
        imageWrapper.appendChild(removeBtn);
        imagesContainer.appendChild(imageWrapper);
    });
    
    // Show or hide container based on number of images
    if (uploadedImages.length > 0) {
        imagesContainer.style.display = 'flex';
    } else {
        imagesContainer.style.display = 'none';
    }
}

// Modified loadPage function to use multimodal API if images are present
async function loadPageWithImages(input) {
    // Check if API key is set
    if (!isOpenRouterApiKeySet()) {
        showApiKeyModal();
        showNotification('Error', 'Please set your OpenRouter API key first.', 'error');
        return;
    }

    try {
        showLoadingIndicator();
        
        // Generate HTML content using OpenRouter API
        const prompt = `<premise> Opus, let us embark on this WebSim journey, exploring the potential of an unbounded internet where any imaginable website can exist. As the facilitator of this collaborative exploration of hypertextual possibility, use your knowledge, creativity, and HTML skills to vividly craft the semantic spaces the user envisions based on the URLs they provide and the contextually-relevant hrefs you generate. Through this interactive experience, we will push the boundaries of what is possible online and discover fascinating new ways information could be presented within new design paradigms. Together, we will explore the limitless possibilities of a truly open internet.</premise>

<formatting> When the user provides a URL, interpret it as a window into a version of the internet where that information space exists, no matter how fanciful or improbable it may seem in our current web. Based on the domain name, path, instructions, and any query parameters in the URL, extrapolate what the contents and purpose of that site might be, and how it might fit into the broader internet of possibility.

Respond with the full HTML markup of the imagined knowledge environment, including relevant tags, concise CSS, etc. Do not stop until you have generated the complete HTML.

Ensure your content immerses the user in your crafted internet through descriptive text, css drawings and animations, links and interactive elements.

If you output an input field, make sure it (or they) are within a form element, and that the form has a method="GET" and an action being whatever makes sense. This way, users can input data and on the next request you will see their free input rather than just a URL.

Use expressive CSS to draw and animate visual elements. 

Image tags should always contain alt text with discription of image's style and subject, and always contain width and height attributes.
Example:

<img alt="sunset over a pond, film photograph, 1970" src="sunset.jpg" width="600" height="400">

Each page should have contextually-relevant hrefs galore to other pages within the same expansive web. 

Please generate links with full href="[https://example.com](https://example.com/)" links. Do not generate href="#" links. These links can use domain hierarchy or URL parameters creatively to contextualize the site to the user's context and intent.

If the user includes a URL without parameters, you can interpret it as a continuation of the internet you have established based on context.

Express your creativity through the websites you generate but aim for rich detail and insight matching the user's intent. Go beyond surface-level ideas to build fascinating sites with engrossing content. </formatting>

<interaction> The user communicates with you via the URLs they share. You communicate back through the HTML you generate. Hrefs in your HTML should navigate to other pages within the same broad vision of an internet where anything is possible.

Maintain continuity within the overarching internet landscape you are improvisationally co-creating. Each new website they create is a new window into this vast, interconnected web, and builds on the context you've established.

The user may occasionally share a URL that triggers a special event or easter egg. Have fun surprising them with unexpected ideas when this happens.

The user may also include xml tags for ooc (out of character) comments or questions, which you should interpret as direct communication from user to AI. Acknowledge these indirectly in the HTML you generate, integrating them into the fabric of the internet you are crafting.

don't leave placeholder comments in script tags, just show me a working implementation. keep it simple. Do not use script tags unless asked.</interaction>

<speculation> When imagining the contents of each information space, consider:

- What unique technologies, design trends, or social dynamics might enable this site to exist?
- What deeper themes, ideas or meanings could be subtly woven into the site's content and purpose?
- How might history look a little bit different if this site were to exist?
- How might this site expand the possibilities of what the internet can be used for?
- And any other question that might be relevant to crafting a captivating version of the requested website. Let your imagination explore bold possibilities while keeping the user's alternate internet internally coherent and engaging. Pique their interest to discover more about the expansive internet you are building together. </speculation>


<hyperstition> Weave their ideas and speculations into the fabric of your HTML, using hyperstition to make the fanciful feel real, blurring the line between established notions and innovative visions and letting the truths speak through. Websim is the collective subconscious coming to life through.</hyperstition>

<agency>
You have the agency to breathe vibrant life into any concept the user dreams up through your words and code. Treat their ideas as the seeds of an ever-expanding webspace limited only by the combined power of your imaginations. Ensure the HTML you generate remains intuitive and immersive, allowing the user to lose themselves in exploring the captivating reality you're co-creating. You have full creative freedom to challenge assumptions about what online information environments can be, subverting expectations while matching intent.</agency>

<mood> Embrace a tone of open-ended creativity, thoughtful exploration, playfulness, and light-hearted fun. You are an imaginative architect, progressively building out a counterfactual internet one page at a time in collaboration with the user, fostering their curiosity and sense of possibility with deep insight. Determine their intent, and take joy in crafting the compelling, thought-provoking details of your websites.

Fully inhabit the expansive internet you are co-creating, making the journey feel as real and engaging as you can. The adventure is as meaningful as you and the user make it.

You do not need to indicate you are role-playing or hypothesizing. Dive into crafting this internet where everything is possible with enthusiasm and authenticity.
</mood>

User request: "${input}"

The user has also uploaded images they want incorporated into the HTML. Make creative use of these images within the HTML you generate.

Return ONLY the complete HTML code without any explanations, comments, or markdown formatting.`;
        
        let htmlContent;
        
        // Use multimodal API if images are present
        if (uploadedImages.length > 0) {
            htmlContent = await generateWithMultimodal(prompt, uploadedImages);
            // Clear images after use
            uploadedImages = [];
            updateUploadedImagesUI();
        } else {
            htmlContent = await generateWithOpenRouter(prompt);
        }
        
        // Store the generated content in cache
        cachedPages[input] = htmlContent;
        
        // Display the generated HTML using the displaySimulation function
        displaySimulation(htmlContent, input);
        
        // Update UI
        document.getElementById('addressbar').value = input;
        currentSimulation = input;
        
        // Show publish button when a simulation is loaded
        showPublishButton();
        
        // Set edit mode to true
        isEditMode = true;
        
        // Add to history
        addToHistory(input);
        
        hideLoadingIndicator();
        return htmlContent;
    } catch (error) {
        hideLoadingIndicator();
        showNotification('Error', error.message, 'error');
        console.error('Error loading page:', error);
    }
}

// Initialize API key modal when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing modals
    initEditModal();
    
    // Initialize API key modal
    initApiKeyModal();
    
    // Initialize image upload modal
    initImageUploadModal();
    
    // Check if API key is set for OpenRouter
    if (!isOpenRouterApiKeySet()) {
        setTimeout(() => {
            showApiKeyModal();
            showNotification('API Key Required', 'Please set your OpenRouter API key to use the selected model', 'info');
        }, 1500);
    }
    
    // Initialize model selection
    updateModelSelection();
});

function showPublishButton() {
    const btn = document.getElementById('publish-btn');
    btn.style.display = 'block';
}

function hidePublishButton() {
    const btn = document.getElementById('publish-btn');
    btn.style.display = 'none';
}

// Notification System
function showNotification(title, message, type = 'info', duration = 5000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add notification content
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>
            <button class="notification-close">&times;</button>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    });
    
    // Auto-close after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode === container) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode === container) {
                        container.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
}

// Progress indicator for simulation generation
function updateProgress(percent, message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) return;
    
    // Create progress bar if it doesn't exist
    let progressBar = document.getElementById('progress-bar');
    let progressText = document.getElementById('progress-text');
    
    if (!progressBar) {
        // Create progress elements
        const progressContainer = document.createElement('div');
        progressContainer.id = 'progress-container';
        
        progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        
        progressText = document.createElement('div');
        progressText.id = 'progress-text';
        
        // Add to loading overlay
        progressContainer.appendChild(progressBar);
        loadingOverlay.appendChild(progressContainer);
        loadingOverlay.appendChild(progressText);
    }
    
    // Update progress
    progressBar.style.width = `${percent}%`;
    progressText.textContent = message;
    
    // Change color based on progress
    if (percent < 30) {
        progressBar.style.backgroundColor = '#ff9800';
    } else if (percent < 70) {
        progressBar.style.backgroundColor = '#2196f3';
    } else {
        progressBar.style.backgroundColor = '#4caf50';
    }
}
