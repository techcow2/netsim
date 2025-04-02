// API and external service interactions

async function fetchPixabayImages(query, count = 5) {
    // Get Pixabay API key from local storage
    const apiKey = getPixabayApiKey();
    
    // If no API key is set, check if we need to prompt the user
    if (!apiKey) {
        showNotification('API Key Required', 'Please set your Pixabay API key in API Settings', 'warning');
        showApiKeyModal();
        return [];
    }
    
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}&image_type=vector,illustration`;

    try {
        const response = await axios.get(url);

        return response.data.hits.map(image => ({
            url: image.webformatURL,
            alt: image.tags || query
        }));
    } catch (error) {
        console.error('Error fetching images from Pixabay:', error);
        showNotification('Error', 'Failed to fetch images from Pixabay. Please check your API key.', 'error');
        return [];
    }
}

// Load a page based on user input
async function loadPage(input) {
    // If images are uploaded, use the multimodal function instead
    if (uploadedImages && uploadedImages.length > 0) {
        return loadPageWithImages(input);
    }

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

Return ONLY the complete HTML code without any explanations, comments, or markdown formatting.`;
        
        const htmlContent = await generateWithOpenRouter(prompt);
        
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

// Continue the simulation based on user input
async function continueSimulation(input) {
    // If images are uploaded, handle them specially
    if (uploadedImages && uploadedImages.length > 0) {
        try {
            showLoadingIndicator();
            
            // Get current HTML content
            const frame = document.getElementById('simulation-frame');
            const currentHTML = frame.srcdoc;
            
            // Generate updated HTML using OpenRouter API with multimodal input
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

Current HTML: ${currentHTML}

User request: "${input}"

The user has also uploaded images they want incorporated into the HTML. Make creative use of these images within the HTML you generate.

Return ONLY the complete HTML code without any explanations, comments, or markdown formatting.`;
            
            const updatedHTML = await generateWithMultimodal(prompt, uploadedImages);
            
            // Clear images after use
            uploadedImages = [];
            updateUploadedImagesUI();
            
            // Update cache
            const fullPrompt = currentSimulation + ' + ' + input;
            cachedPages[fullPrompt] = updatedHTML;
            
            // Use displaySimulation to update the UI, which will properly save navigation history
            displaySimulation(updatedHTML, fullPrompt);
            
            // Update current simulation
            currentSimulation = fullPrompt;
            
            // Update address bar
            document.getElementById('addressbar').value = fullPrompt;
            
            // Add to history
            addToHistory(fullPrompt);
            
            hideLoadingIndicator();
            return updatedHTML;
        } catch (error) {
            hideLoadingIndicator();
            showNotification('Error', error.message, 'error');
            console.error('Error continuing simulation with images:', error);
        }
        return;
    }

    // Check if API key is set
    if (!isOpenRouterApiKeySet()) {
        showApiKeyModal();
        showNotification('Error', 'Please set your OpenRouter API key first.', 'error');
        return;
    }

    try {
        showLoadingIndicator();
        
        // Get current HTML content
        const frame = document.getElementById('simulation-frame');
        const currentHTML = frame.srcdoc;
        
        // Generate updated HTML using OpenRouter API
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

Current HTML: ${currentHTML}

User request: "${input}"

Return ONLY the complete HTML code without any explanations, comments, or markdown formatting.`;
        
        const updatedHTML = await generateWithOpenRouter(prompt);
        
        // Update cache
        const fullPrompt = currentSimulation + ' + ' + input;
        cachedPages[fullPrompt] = updatedHTML;
        
        // Use displaySimulation to update the UI, which will properly save navigation history
        displaySimulation(updatedHTML, fullPrompt);
        
        // Update current simulation
        currentSimulation = fullPrompt;
        
        // Update address bar
        document.getElementById('addressbar').value = fullPrompt;
        
        // Add to history
        addToHistory(fullPrompt);
        
        hideLoadingIndicator();
        return updatedHTML;
    } catch (error) {
        hideLoadingIndicator();
        showNotification('Error', error.message, 'error');
        console.error('Error continuing simulation:', error);
    }
}

// Publish a simulation to get a shareable URL
async function publishSimulation() {
    try {
        showLoadingIndicator();
        
        // Get current HTML content
        const frame = document.getElementById('simulation-frame');
        const htmlContent = frame.srcdoc;
        
        // Create a unique ID for the simulation
        const id = Math.random().toString(36).substring(2, 15);
        
        // Store the simulation (in a real app, this would send to a server)
        // For demo purposes, we'll just generate a fake URL
        const url = `https://netsim.example.com/s/${id}`;
        
        // Display the URL in the modal
        document.getElementById('generated-url').value = url;
        document.getElementById('share-modal').style.display = 'block';
        
        hideLoadingIndicator();
        return url;
    } catch (error) {
        hideLoadingIndicator();
        showNotification('Error', 'Failed to publish simulation', 'error');
        console.error('Error publishing simulation:', error);
    }
}

// Improve a prompt using AI
async function improvePrompt() {
    // Check if API key is set
    if (!isOpenRouterApiKeySet()) {
        showApiKeyModal();
        showNotification('Error', 'Please set your OpenRouter API key first.', 'error');
        return;
    }

    try {
        const currentPrompt = document.getElementById('addressbar').value;
        
        if (!currentPrompt) {
            showNotification('Error', 'Please enter a prompt first', 'error');
            return;
        }
        
        showLoadingIndicator();
        
        // Generate improved prompt using OpenRouter API
        const prompt = `You are an AI assistant helping users create better prompts for a web application generator. 
        The user has provided this prompt: "${currentPrompt}"
        
        Please improve this prompt to make it more specific, detailed, and likely to generate a high-quality web application.
        Focus on adding relevant details and clarity to help create a better user experience for the requested application.
        Return ONLY the improved prompt without any explanations or formatting.`;
        
        const improvedPrompt = await generateWithOpenRouter(prompt);
        
        // Display the improved prompt
        document.getElementById('improved-prompt-text').value = improvedPrompt;
        document.getElementById('improve-prompt-modal').style.display = 'block';
        
        hideLoadingIndicator();
        return improvedPrompt;
    } catch (error) {
        hideLoadingIndicator();
        showNotification('Error', error.message, 'error');
        console.error('Error improving prompt:', error);
    }
}

// Global variables for tracking generation progress
let generationStartTime = null;
let generationStages = [
    { name: "Analyzing prompt", percentage: 10 },
    { name: "Generating structure", percentage: 30 },
    { name: "Creating content", percentage: 60 },
    { name: "Finalizing", percentage: 90 },
    { name: "Rendering", percentage: 100 }
];
let currentStageIndex = 0;
let progressUpdateInterval = null;
let estimatedTotalTime = null;

// Helper functions for loading indicator
function showLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        
        // Reset progress indicators
        resetProgress();
        
        // Start progress simulation
        startProgressSimulation();
    }
}

function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // Complete progress before hiding
        updateProgress(100, "Complete");
        
        // Clear any running intervals
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
            progressUpdateInterval = null;
        }
        
        // Delay hiding to show completion
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }
}

function resetProgress() {
    // Reset all progress tracking variables
    generationStartTime = Date.now();
    currentStageIndex = 0;
    
    // Reset UI elements
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressTimeEstimate = document.querySelector('.progress-time-estimate');
    const generationStageElement = document.querySelector('.generation-stage');
    
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (progressTimeEstimate) progressTimeEstimate.textContent = 'Est. time: calculating...';
    if (generationStageElement) generationStageElement.textContent = 'Initializing...';
}

function startProgressSimulation() {
    // Clear any existing interval
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
    }
    
    // Estimate total time based on input complexity and selected model
    estimatedTotalTime = estimateGenerationTime();
    
    // Set up interval to update progress
    let simulatedProgress = 0;
    progressUpdateInterval = setInterval(() => {
        // Calculate elapsed time
        const elapsedTime = (Date.now() - generationStartTime) / 1000;
        
        // Calculate what percentage we should be at based on elapsed time
        const timeBasedPercentage = Math.min(90, (elapsedTime / estimatedTotalTime) * 100);
        
        // Move to next stage if needed
        if (currentStageIndex < generationStages.length - 1 && 
            timeBasedPercentage >= generationStages[currentStageIndex].percentage) {
            currentStageIndex++;
        }
        
        // Update UI with current stage and progress
        const currentStage = generationStages[currentStageIndex];
        updateProgress(
            timeBasedPercentage, 
            currentStage.name,
            Math.round(estimatedTotalTime - elapsedTime)
        );
        
        // If we're taking longer than expected, adjust the estimated time
        if (elapsedTime > estimatedTotalTime && timeBasedPercentage < 90) {
            estimatedTotalTime = elapsedTime * 1.5; // Add 50% more time
        }
    }, 200);
}

function updateProgress(percentage, stageName, secondsRemaining) {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressTimeEstimate = document.querySelector('.progress-time-estimate');
    const generationStageElement = document.querySelector('.generation-stage');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
    
    if (generationStageElement && stageName) {
        generationStageElement.textContent = stageName;
    }
    
    if (progressTimeEstimate) {
        if (secondsRemaining !== undefined && secondsRemaining > 0) {
            let timeText = `Est. time: `;
            if (secondsRemaining > 60) {
                timeText += `${Math.floor(secondsRemaining / 60)}m ${secondsRemaining % 60}s`;
            } else {
                timeText += `${secondsRemaining}s`;
            }
            progressTimeEstimate.textContent = timeText;
        } else if (percentage >= 100) {
            progressTimeEstimate.textContent = 'Complete!';
        }
    }
}

function estimateGenerationTime() {
    // Get input text and selected model to estimate generation time
    const inputText = document.getElementById('addressbar').value;
    const selectedModel = window.currentModel || 'gemini-2.5-pro';
    
    // Base time in seconds for different models
    const baseTimesByModel = {
        'claude-3.5-sonnet': 20,
        'gpt-4o': 18,
        'gemini-2.5-pro': 15,
        'deepseek-chat': 16
    };
    
    // Get base time for selected model or default to 15 seconds
    let baseTime = baseTimesByModel[selectedModel] || 15;
    
    // Adjust time based on input complexity
    const wordCount = inputText.split(/\s+/).length;
    
    // Longer inputs take more time
    if (wordCount > 10) {
        baseTime += Math.min(30, (wordCount - 10) / 2);
    }
    
    // Check for complex requirements
    const complexityIndicators = [
        'interactive', 'advanced', 'complex', 'simulation', 
        'animation', 'data visualization', 'chart', 'game',
        'dashboard', 'physics', '3d', 'dynamic'
    ];
    
    const inputLower = inputText.toLowerCase();
    for (const indicator of complexityIndicators) {
        if (inputLower.includes(indicator)) {
            baseTime += 5; // Add 5 seconds for each complexity indicator
        }
    }
    
    return baseTime;
}

// Add a prompt to history
function addToHistory(prompt) {
    // Check if the prompt is already in history
    if (!history.includes(prompt)) {
        history.unshift(prompt);
        
        // Limit history size
        if (history.length > 50) {
            history.pop();
        }
        
        // Save history to local storage
        saveHistory();
    }
}

// Save history to local storage
function saveHistory() {
    const compressed = LZString.compressToUTF16(JSON.stringify(history));
    localStorage.setItem('netsim_history', compressed);
}
