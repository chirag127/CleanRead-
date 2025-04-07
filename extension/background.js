// Backend API URL
// const API_URL = 'http://localhost:3000/api';
const API_URL = 'https://cleanread.onrender.com/api';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    summarize(request.content, request.mode)
      .then(summary => {
        sendResponse({ summary });
      })
      .catch(error => {
        console.error('Error generating summary:', error);
        sendResponse({ error: 'Failed to generate summary' });
      });

    return true; // Indicates async response
  }
});

// Function to generate summary using backend API
async function summarize(content, mode) {
  try {
    const response = await fetch(`${API_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, mode })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.sync.set({
    theme: 'light',
    textSize: 100,
    autoClean: false,
    viewMode: 'raw',
    summaryMode: 'tldr'
  });
});
