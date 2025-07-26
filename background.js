// Background script for monitoring network requests
let isEnabled = true;

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true });
});

// Listen for network requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!isEnabled) return;
    
    // Only process requests from the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && details.tabId === tabs[0].id) {
        processRequest(details);
      }
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

function processRequest(details) {
  // Get response size from headers
  let contentLength = 0;
  if (details.responseHeaders) {
    const contentLengthHeader = details.responseHeaders.find(
      header => header.name.toLowerCase() === 'content-length'
    );
    if (contentLengthHeader) {
      contentLength = parseInt(contentLengthHeader.value, 10);
    }
  }
  
  // If no content-length header, estimate based on response type
  if (contentLength === 0) {
    contentLength = estimateResponseSize(details);
  }
  
  // Send message to content script to play audio
  chrome.tabs.sendMessage(details.tabId, {
    type: 'PLAY_AUDIO',
    size: contentLength,
    url: details.url,
    method: details.method
  }).catch(() => {
    // Content script might not be ready, ignore error
  });
}

function estimateResponseSize(details) {
  const url = details.url.toLowerCase();
  
  // Estimate sizes based on file types
  if (url.includes('.js') || url.includes('javascript')) return 50000; // ~50KB
  if (url.includes('.css')) return 20000; // ~20KB
  if (url.includes('.html')) return 15000; // ~15KB
  if (url.includes('.json') || url.includes('api/')) return 5000; // ~5KB
  if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return 100000; // ~100KB
  if (url.includes('.gif')) return 200000; // ~200KB
  if (url.includes('.svg')) return 10000; // ~10KB
  if (url.includes('.woff') || url.includes('.ttf')) return 30000; // ~30KB
  
  // Default estimate for unknown types
  return 10000; // ~10KB
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_ENABLED') {
    isEnabled = request.enabled;
    chrome.storage.sync.set({ enabled: isEnabled });
    sendResponse({ success: true });
  } else if (request.type === 'GET_STATUS') {
    sendResponse({ enabled: isEnabled });
  }
});

// Load saved state
chrome.storage.sync.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false; // Default to true
});