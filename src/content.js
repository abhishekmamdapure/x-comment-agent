// Twitter Comment Assistant - Enhanced content.js implementation

(function() {
    // Configuration with improved isolation
    const SUGGESTIONS = [
      { text: 'Thank you', icon: '👍' },
      { text: 'Contact Us via email', icon: '📧' },
      { text: 'Have a great day', icon: '☀️' }
    ];
    
    // Enhanced state management with React-aware tracking
    let popupVisible = false;
    let buttonAdded = false;
    let currentViewMode = null;
    let lastTextareaRef = null;
    
    // React-compatible DOM selectors
    const REPLY_SELECTORS = [
      '[data-testid="tweetTextarea_0"]',
      '[role="textbox"][aria-label="Post your reply"]',
      '[contenteditable="true"][aria-label="Post your reply"]',
      'div[contenteditable="true"]'
    ];
    
    // CSS Injection with improved specificity for Twitter context
    function injectStyles() {
      const css = `
        .tca-button {
          width: 24px;
          height: 24px;
          background-color: #00FF00;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 8px;
          font-weight: bold;
          font-size: 16px;
          position: relative;
          z-index: 9999;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .tca-button:hover {
          background-color:rgb(18, 162, 230);
          transform: scale(1.1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .tca-button:active {
          transform: scale(0.95);
        }
        
        .tca-popup-container {
          position: fixed;
          z-index: 10000;
          pointer-events: none;
          transition: transform 0.2s ease-out, opacity 0.2s ease-out;
          transform: scale(0.95);
          opacity: 0;
        }
        
        .tca-popup {
          background-color: white;
          width: 250px;
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          overflow: hidden;
          pointer-events: auto;
        }
        
        .tca-popup-header {
          background-color: #1DA1F2;
          color: white;
          padding: 10px;
          font-weight: bold;
          text-align: center;
        }
        
        .tca-suggestion {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          color: #2C3E50;
          background-color: white;
          transition: background-color 0.2s ease;
        }
        
        .tca-suggestion:hover {
          background-color: #f8f9fa;
        }
        
        .tca-icon {
          margin-right: 10px;
          font-size: 18px;
        }
        
        .tca-text {
          color: #2C3E50;
          font-size: 14px;
          font-weight: normal;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
    
    // Component-based popup with enhanced positioning logic
    function createPopup(button) {
      // Create a container for the popup that's separate from the button
      const container = document.createElement('div');
      container.className = 'tca-popup-container';
      
      const popup = document.createElement('div');
      popup.className = 'tca-popup';
      
      const header = document.createElement('div');
      header.className = 'tca-popup-header';
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
        text.className = 'tca-text';
        text.textContent = suggestion.text;
        item.appendChild(text);
        
        item.addEventListener('click', () => {
          insertReply(suggestion.text);
          hidePopup();
        });
        
        popup.appendChild(item);
      });
      
      container.appendChild(popup);
      document.body.appendChild(container);
      return container;
    }
    
    // Enhanced popup positioning with viewport boundary awareness
    function showPopup(button) {
      // Hide any existing popups first
      hidePopup();
      
      const popup = document.querySelector('.tca-popup-container') || createPopup(button);
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate optimal position with viewport constraints
      const popupHeight = 160; // Approximate height
      const popupWidth = 250; // Width from CSS
      
      // Default position above the button
      let top = rect.top - popupHeight - 10;
      let left = rect.left - popupWidth + rect.width;
      
      // If popup would go off the top, position it below the button
      if (top < 10) {
        top = rect.bottom + 10;
      }
      
      // If popup would go off the right, align it to the right edge with padding
      if (left + popupWidth > viewportWidth - 10) {
        left = viewportWidth - popupWidth - 10;
      }
      
      // If popup would go off the left, align it to the left edge with padding
      if (left < 10) {
        left = 10;
      }
      
      popup.style.transform = 'scale(1)';
      popup.style.opacity = '1';
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
      popup.style.display = 'block';
      
      // Store reference to current button
      popup.dataset.sourceButton = button.id || Date.now().toString();
      if (!button.id) {
        button.id = popup.dataset.sourceButton;
      }
      
      popupVisible = true;
    }
    
    function hidePopup() {
      const popup = document.querySelector('.tca-popup-container');
      if (popup) {
        popup.style.display = 'none';
        popup.style.transform = 'scale(0.95)';
        popup.style.opacity = '0';
      }
      popupVisible = false;
    }
    
    // React-compatible text insertion that preserves Twitter's state management
    function insertReply(text) {
      try {
        let inputField = null;
        
        // Find active input field
        for (const selector of REPLY_SELECTORS) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isElementVisible(element)) {
              inputField = element;
              break;
            }
          }
          if (inputField) break;
        }
        
        if (!inputField) {
          console.error('Could not find reply input field');
          return;
        }
        
        // Store reference for focus management
        lastTextareaRef = inputField;
        
        // Clear and insert text using a more reliable method
        const insertTextIntoField = () => {
          // Focus the field first
          inputField.focus();

          // For contenteditable divs (Twitter's modern implementation)
          if (inputField.getAttribute('contenteditable') === 'true') {
            // Clear existing content
            inputField.innerHTML = '';
            
            // Create and insert text node
            const textNode = document.createTextNode(text);
            inputField.appendChild(textNode);
            
            // Set cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(inputField);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            // For traditional input fields
            inputField.value = text;
            inputField.selectionStart = inputField.selectionEnd = text.length;
          }

          // Dispatch events that Twitter's React implementation expects
          const eventSequence = [
            new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertText',
              data: text
            }),
            new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertText',
              data: text
            }),
            new Event('change', { bubbles: true }),
            new KeyboardEvent('keydown', {
              bubbles: true,
              key: 'Process',
              code: 'Process',
              keyCode: 229,
              which: 229
            }),
            new KeyboardEvent('keyup', {
              bubbles: true,
              key: 'Process',
              code: 'Process',
              keyCode: 229,
              which: 229
            })
          ];

          // Dispatch events in sequence with small delays
          eventSequence.forEach((event, index) => {
            setTimeout(() => {
              inputField.dispatchEvent(event);
            }, index * 10);
          });
        };

        // Execute insertion with retries if needed
        const maxRetries = 3;
        let retryCount = 0;

        const tryInsertWithRetry = () => {
          insertTextIntoField();

          // Verify insertion after a short delay
          setTimeout(() => {
            const currentText = inputField.getAttribute('contenteditable') === 'true' 
              ? inputField.textContent 
              : inputField.value;

            if (!currentText || currentText !== text) {
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retry attempt ${retryCount}`);
                tryInsertWithRetry();
              }
            }

            // Enable reply button
            enableReplyButton();
          }, 50);
        };

        // Start the insertion process
        tryInsertWithRetry();

      } catch (error) {
        console.error('Error inserting reply:', error);
      }
    }
    
    // Helper to find and enable the reply button
    function enableReplyButton() {
      const replyButton = document.querySelector('[data-testid="tweetButton"]');
      if (replyButton && replyButton.disabled) {
        if (lastTextareaRef) {
          // Focus and trigger events on the textarea
          lastTextareaRef.focus();

          // Simulate user interaction
          const events = [
            new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertText'
            }),
            new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertText'
            }),
            new Event('change', { bubbles: true }),
            new KeyboardEvent('keydown', {
              bubbles: true,
              key: 'Process',
              code: 'Process',
              keyCode: 229,
              which: 229
            })
          ];

          // Dispatch events with delays
          events.forEach((event, index) => {
            setTimeout(() => {
              lastTextareaRef.dispatchEvent(event);
            }, index * 10);
          });

          // Additional check to force button state update
          setTimeout(() => {
            if (replyButton.disabled) {
              replyButton.disabled = false;
              replyButton.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, 100);
        }
      }
    }
    
    // Enhanced visibility check for elements
    function isElementVisible(element) {
      if (!element) return false;
      
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             element.offsetWidth > 0 &&
             element.offsetHeight > 0;
    }
    
    // View-aware button positioning with context detection
    function addButton() {
      if (buttonAdded) return;
      
      // Identify the current view context
      const isDetailedView = window.location.pathname.includes('/status/');
      const viewMode = isDetailedView ? 'detail' : 'timeline';
      
      // Skip if view hasn't changed to prevent unnecessary updates
      if (viewMode === currentViewMode && buttonAdded) return;
      currentViewMode = viewMode;
      
      // Remove any existing buttons to prevent duplicates
      removeButton();
      
      // Multi-targeting strategy based on view context
      let replyContainer = null;
      
      if (isDetailedView) {
        // Detailed post view targeting
        const replyAreas = [];
        
        // Collect all possible reply areas
        REPLY_SELECTORS.forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            if (isElementVisible(element)) {
              replyAreas.push(element);
            }
          });
        });
        
        // Find the most appropriate container based on visibility and position
        for (const area of replyAreas) {
          const possibleContainer = area.closest('div[role="group"]') || 
                                   area.closest('form');
          
          if (possibleContainer && isElementVisible(possibleContainer)) {
            replyContainer = possibleContainer;
            break;
          }
        }
        
        // If still not found, look for the reply button as anchor
        if (!replyContainer) {
          const replyButton = document.querySelector('[data-testid="tweetButton"]');
          if (replyButton && isElementVisible(replyButton)) {
            replyContainer = replyButton.closest('div[role="group"]') || 
                            replyButton.parentElement;
          }
        }
      } else {
        // Timeline view targeting
        for (const selector of REPLY_SELECTORS) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isElementVisible(element)) {
              const container = element.closest('div[role="group"]') || 
                               element.closest('form');
              
              if (container && isElementVisible(container)) {
                replyContainer = container;
                break;
              }
            }
          }
          if (replyContainer) break;
        }
      }
      
      if (!replyContainer) return;
      
      // Create enhanced button with accessibility attributes
      const button = document.createElement('div');
      button.className = 'tca-button';
      button.textContent = '+';
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-label', 'Quick reply suggestions');
      
      // Add keyboard support for accessibility
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          if (popupVisible) {
            hidePopup();
          } else {
            showPopup(button);
          }
        }
      });
      
      // Add click handler with enhanced event management
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (popupVisible) {
          hidePopup();
        } else {
          showPopup(button);
        }
      });
      
      // Find optimal position with view context awareness
      const replyButton = replyContainer.querySelector('[data-testid="tweetButton"]');
      if (replyButton && isElementVisible(replyButton)) {
        // Position relative to reply button
        const buttonContainer = replyButton.parentNode;
        buttonContainer.insertBefore(button, replyButton);
        
        // Apply view-specific styling
        if (isDetailedView) {
          button.style.display = 'inline-flex';
          button.style.verticalAlign = 'middle';
        }
      } else {
        // Fallback position at end of container
        const lastChild = replyContainer.lastElementChild;
        if (lastChild) {
          replyContainer.insertBefore(button, lastChild);
        } else {
          replyContainer.appendChild(button);
        }
      }
      
      buttonAdded = true;
    }
    
    // Enhanced button removal with comprehensive cleanup
    function removeButton() {
      const buttons = document.querySelectorAll('.tca-button');
      buttons.forEach(button => button.remove());
      buttonAdded = false;
    }
    
    // Advanced Twitter UI monitoring with context awareness
    function observeTwitterChanges() {
      // Track DOM changes that might affect reply areas
      const observer = new MutationObserver(debounce(() => {
        const inReplyContext = REPLY_SELECTORS.some(selector => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).some(el => isElementVisible(el));
        });
        
        if (inReplyContext) {
          addButton();
        } else if (buttonAdded) {
          removeButton();
        }
      }, 100));
      
      observer.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Monitor view transitions and scrolling
      window.addEventListener('scroll', debounce(() => {
        if (!buttonAdded) {
          const inReplyContext = REPLY_SELECTORS.some(selector => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).some(el => isElementVisible(el));
          });
          
          if (inReplyContext) {
            addButton();
          }
        }
      }, 200));
      
      // Monitor history/navigation changes
      let lastUrl = location.href;
      const navigationObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          
          // Clear state on navigation
          removeButton();
          hidePopup();
          buttonAdded = false;
          currentViewMode = null;
          
          // Re-check after navigation settles
          setTimeout(() => {
            const inReplyContext = REPLY_SELECTORS.some(selector => {
              const elements = document.querySelectorAll(selector);
              return Array.from(elements).some(el => isElementVisible(el));
            });
            
            if (inReplyContext) {
              addButton();
            }
          }, 1000);
        }
      });
      
      navigationObserver.observe(document, {
        subtree: true, 
        childList: true
      });
    }
    
    // Utility function to limit frequency of function calls
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
    
    // Global event listeners
    function setupGlobalListeners() {
      // Use capture phase for more reliable click handling
      document.addEventListener('click', (e) => {
        if (popupVisible && 
            !e.target.closest('.tca-popup') && 
            !e.target.classList.contains('tca-button')) {
          hidePopup();
        }
      }, true);
      
      // Debounced scroll handler
      window.addEventListener('scroll', debounce(() => {
        if (popupVisible) {
          hidePopup();
        }
      }, 150));
      
      // Handle focus changes
      document.addEventListener('focusin', debounce(() => {
        const inReplyContext = REPLY_SELECTORS.some(selector => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).some(el => isElementVisible(el));
        });
        
        if (inReplyContext && !buttonAdded) {
          addButton();
        }
      }, 200));
    }
    
    // Error-resilient initialization
    function init() {
      try {
        injectStyles();
        setupGlobalListeners();
        observeTwitterChanges();
        
        // Initial check with progressive retry
        const checkContext = (attempt = 1) => {
          const inReplyContext = REPLY_SELECTORS.some(selector => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).some(el => isElementVisible(el));
          });
          
          if (inReplyContext) {
            addButton();
          } else if (attempt < 5) {
            setTimeout(() => checkContext(attempt + 1), attempt * 300);
          }
        };
        
        checkContext();
        
        // Health monitoring
        setInterval(() => {
          const inReplyContext = REPLY_SELECTORS.some(selector => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).some(el => isElementVisible(el));
          });
          
          if (inReplyContext && !document.querySelector('.tca-button')) {
            buttonAdded = false;
            addButton();
          }
        }, 2000);
        
        console.log('Twitter Comment Assistant initialized');
      } catch (error) {
        console.error('Error initializing Twitter Comment Assistant:', error);
      }
    }
    
    // Bootstrap the extension
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();