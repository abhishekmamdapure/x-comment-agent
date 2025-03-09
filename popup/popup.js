// Twitter Comment Assistant - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    const enabledToggle = document.getElementById('enabled');
    const statusText = document.getElementById('status');
    
    // Load current state
    chrome.storage.local.get('enabled', function(data) {
      if (data.enabled !== undefined) {
        enabledToggle.checked = data.enabled;
        updateStatusText(data.enabled);
      }
    });
    
    // Save state when toggle changes
    enabledToggle.addEventListener('change', function() {
      const isEnabled = enabledToggle.checked;
      
      chrome.storage.local.set({ enabled: isEnabled }, function() {
        updateStatusText(isEnabled);
      });
    });
    
    function updateStatusText(isEnabled) {
      statusText.textContent = isEnabled 
        ? 'Extension is enabled' 
        : 'Extension is disabled';
    }
  });

// Initialize storage if not already set
chrome.storage.local.get(['processMode'], function(data) {
    if (data.processMode === undefined) {
      chrome.storage.local.set({ 
        processMode: 'removeVowelWords' 
      });
    }
  });