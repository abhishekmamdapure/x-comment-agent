// Background script for Twitter Comment Assistant
chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitter Comment Assistant installed successfully');
});

// Listen for any messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INIT') {
    sendResponse({ status: 'OK' });
  }
});