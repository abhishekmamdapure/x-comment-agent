// Twitter Comment Assistant - Background Script

// Listen for installation
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
      console.log('Twitter Comment Assistant installed');
      
      // Initialize default settings
      chrome.storage.local.set({
        enabled: true
      });
    }
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'log') {
      console.log('Twitter Comment Assistant:', message.data);
    }
    return true;
  });