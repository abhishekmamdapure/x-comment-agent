// Simplified Twitter Comment Assistant - content.js

(function() {
    // Configuration
    const SUGGESTIONS = [
      { text: 'Thank you', icon: '👍' },
      { text: 'Contact Us via email', icon: '📧' },
      { text: 'Have a great day', icon: '☀️' }
    ];
    
    // State
    let popupVisible = false;
    let buttonAdded = false;
    
    // Add required CSS
    function injectStyles() {
      const css = `
        #tca-button {
          position: fixed;
          width: 40px;
          height: 40px;
          background-color: #00FF00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 9999;
          font-weight: bold;
          font-size: 20px;
        }
        
        #tca-popup {
          position: fixed;
          background-color: white;
          width: 250px;
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          z-index: 10000;
          overflow: hidden;
          display: none;
        }
        
        #tca-popup-header {
          background-color: #1DA1F2;
          color: white;
          padding: 10px;
          font-weight: bold;
        }
        
        .tca-suggestion {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .tca-suggestion:hover {
          background-color: #f5f8fa;
        }
        
        .tca-icon {
          margin-right: 10px;
          font-size: 18px;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
    
    // Create suggestion popup
    function createPopup() {
      const popup = document.createElement('div');
      popup.id = 'tca-popup';
      
      const header = document.createElement('div');
      header.id = 'tca-popup-header';
      header.textContent = 'Quick Replies';
      popup.appendChild(header);
      
      SUGGESTIONS.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'tca-suggestion';
        
        const icon = document.createElement('span');
        icon.className = 'tca-icon';
        icon.textContent = suggestion.icon;
        item.appendChild(icon);
        
        const text = document.createElement('span');
        text.textContent = suggestion.text;
        item.appendChild(text);
        
        item.addEventListener('click', () => {
          insertReply(suggestion.text);
          hidePopup();
        });
        
        popup.appendChild(item);
      });
      
      document.body.appendChild(popup);
      return popup;
    }
    
    // Show popup
    function showPopup(button) {
      const popup = document.getElementById('tca-popup') || createPopup();
      const rect = button.getBoundingClientRect();
      
      popup.style.left = `${rect.left - 210}px`;
      popup.style.top = `${rect.top - 170}px`;
      popup.style.display = 'block';
      
      popupVisible = true;
    }
    
    // Hide popup
    function hidePopup() {
      const popup = document.getElementById('tca-popup');
      if (popup) {
        popup.style.display = 'none';
        popupVisible = false;
      }
    }
    
    // Insert reply text into input field
    function insertReply(text) {
      const inputSelectors = [
        '[data-testid="tweetTextarea_0"]',
        '[role="textbox"][aria-label="Post your reply"]',
        '[contenteditable="true"][aria-label="Post your reply"]',
        'form [contenteditable="true"]'
      ];
      
      let input = null;
      
      for (const selector of inputSelectors) {
        input = document.querySelector(selector);
        if (input) break;
      }
      
      if (!input) {
        console.error('Could not find reply input field');
        return;
      }
      
      // Set text based on input type
      if (input.getAttribute('contenteditable') === 'true') {
        input.textContent = text;
        input.focus();
        
        // Create selection at end of text
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        input.value = text;
        input.focus();
      }
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      
      // Enable reply button if disabled
      setTimeout(() => {
        const replyButton = document.querySelector('[data-testid="tweetButton"]');
        if (replyButton && replyButton.disabled) {
          replyButton.disabled = false;
        }
      }, 100);
    }
    
    // Position button in the fixed location from screenshot
    function positionButton() {
      // Skip if already added
      if (buttonAdded) return;
      
      // Check if we're in a reply context
      const inReplyContext = !!document.querySelector(
        '[data-testid="tweetTextarea_0"], ' +
        '[role="textbox"][aria-label="Post your reply"]'
      );
      
      if (!inReplyContext) return;
      
      // Create button
      const button = document.createElement('div');
      button.id = 'tca-button';
      button.textContent = '+';
      
      // Position at fixed bottom-right corner of viewport
      button.style.right = '92px';  // Position to left of reply button
      button.style.bottom = '75px'; // Above bottom toolbar
      
      // Add click handler
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popupVisible) {
          hidePopup();
        } else {
          showPopup(button);
        }
      });
      
      document.body.appendChild(button);
      buttonAdded = true;
      
      // Handle clicks outside popup
      document.addEventListener('click', (e) => {
        if (popupVisible && 
            !e.target.closest('#tca-popup') && 
            e.target.id !== 'tca-button') {
          hidePopup();
        }
      });
    }
    
    // Watch for page changes
    function observeTwitterChanges() {
      const observer = new MutationObserver(() => {
        if (!buttonAdded) {
          positionButton();
        }
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    }
    
    // Initialize
    function init() {
      injectStyles();
      positionButton();
      observeTwitterChanges();
      
      // Periodically check for reply contexts
      setInterval(() => {
        const button = document.getElementById('tca-button');
        if (!button) {
          buttonAdded = false;
          positionButton();
        }
      }, 2000);
    }
    
    // Start when page is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();