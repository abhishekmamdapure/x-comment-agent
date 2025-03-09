// Background script for Twitter Comment Assistant
// Core system initialization and communication framework

chrome.runtime.onInstalled.addListener(() => {
    console.log('Twitter Comment Assistant installed successfully');
    
    // Strategic storage initialization with validation and error handling
    chrome.storage.local.get(null, function(existingData) {
      try {
        // Establish configuration baseline if not already present
        const requiredDefaults = {
          processMode: 'removeVowelWords',
          enabled: true
        };
        
        // Determine which settings need initialization
        const updates = {};
        let needsUpdate = false;
        
        Object.entries(requiredDefaults).forEach(([key, value]) => {
          if (existingData[key] === undefined) {
            updates[key] = value;
            needsUpdate = true;
          }
        });
        
        // Apply configuration updates only if necessary
        if (needsUpdate) {
          chrome.storage.local.set(updates, () => {
            if (chrome.runtime.lastError) {
              console.error('Configuration initialization failed:', chrome.runtime.lastError);
            } else {
              console.log('System configuration initialized successfully');
            }
          });
        }
      } catch (error) {
        console.error('Storage initialization exception:', error);
      }
    });
  });
  
  // Extensible message communication framework
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      switch (request.type) {
        case 'INIT':
          sendResponse({ status: 'OK', message: 'System initialized' });
          break;
          
        case 'GET_SETTINGS':
          chrome.storage.local.get(null, (data) => {
            sendResponse({ 
              status: 'OK', 
              settings: data 
            });
          });
          break;
          
        case 'UPDATE_SETTINGS':
          if (request.settings) {
            chrome.storage.local.set(request.settings, () => {
              sendResponse({ 
                status: 'OK', 
                message: 'Settings updated successfully' 
              });
            });
          } else {
            sendResponse({ 
              status: 'ERROR', 
              message: 'Invalid settings payload' 
            });
          }
          break;
          
        default:
          sendResponse({ 
            status: 'ERROR', 
            message: 'Unknown request type' 
          });
      }
    } catch (error) {
      console.error('Message handler exception:', error);
      sendResponse({ 
        status: 'ERROR', 
        message: 'Internal system error' 
      });
    }
    
    // Return true to indicate asynchronous response pattern
    return true;
  });