// Twitter Comment Assistant - Enhanced content.js implementation

(function() {
    // Configuration with improved isolation
    const SUGGESTIONS = [
      { text: 'Thank you', icon: '👍' },
      { text: 'Contact Us via email', icon: '📧' },
      { text: 'Have a great day', icon: '☀️' }
    ];
    
    // Intelligent content processing with URL filtering and hashtag preservation
    function processPostText(text) {
        if (!text) return '';
        
        // Strategy 1: Preserve meaningful content while filtering URLs
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
            // Remove URLs using pattern recognition
            return line.replace(/https?:\/\/\S+|pic\.\S+/g, '').trim();
        }).filter(line => line.length > 0); // Remove empty lines
        
        // Strategy 2: Handle vowel-word filtering on the cleaned text
        const processedText = processedLines.join('\n');
        const words = processedText.split(/\s+/);
        const filteredWords = words.filter(word => {
            // Special handling for hashtags - always preserve them
            if (word.startsWith('#')) return true;
            
            // Apply vowel filtering to non-hashtag words
            const firstChar = word.charAt(0).toLowerCase();
            return !['a', 'e', 'i', 'o', 'u'].includes(firstChar);
        });
        
        return filteredWords.join(' ');
    }

    // Twitter DOM Extraction Resilience Framework
    function extractPostText(button) {
        console.log('Beginning resilient extraction process');
        
        // Implement extraction telemetry
        const extractionStartTime = performance.now();
        let extractionMethod = 'unknown';
        
        try {
            // STAGE 1: Immediate Context Analysis
            // This aggressive approach bypasses conventional DOM hierarchy in favor of proximity detection
            let extractedText = '';
            let article = null;
            
            // Create visibility boundary for logging
            console.group('Tweet Content Extraction');
            console.log('Current URL:', window.location.href);
            console.log('Button element:', button);
            
            // STRATEGY 1: Direct DOM proximity scanning
            // Instead of relying on conventional parent-child relationships, scan the entire visible area
            // near the interaction point to identify content patterns consistent with tweet content
            const scanProximity = () => {
                console.log('Executing proximity content scan');
                
                // Identify all visible text nodes within the viewable area of the button
                const buttonRect = button.getBoundingClientRect();
                const proximityRect = {
                    top: Math.max(0, buttonRect.top - 300),
                    left: Math.max(0, buttonRect.left - 300),
                    right: Math.min(window.innerWidth, buttonRect.right + 300),
                    bottom: Math.min(window.innerHeight, buttonRect.bottom + 100)
                };
                
                // Find all elements that contain text and are within our proximity bounds
                const allTextElements = Array.from(document.querySelectorAll('div, span, p'))
                    .filter(el => {
                        // Check if element contains visible text
                        if (!el.textContent || el.textContent.trim() === '') return false;
                        
                        // Check if element is visible in viewport
                        const rect = el.getBoundingClientRect();
                        if (rect.height === 0 || rect.width === 0) return false;
                        
                        // Check if element is within our proximity search area and above the button
                        return rect.bottom < buttonRect.top && // Only consider elements above the button
                               rect.right > proximityRect.left &&
                               rect.left < proximityRect.right;
                    });
                
                console.log(`Found ${allTextElements.length} potential text elements in proximity`);
                
                // Sort elements by distance from button and vertical position
                allTextElements.sort((a, b) => {
                    const aRect = a.getBoundingClientRect();
                    const bRect = b.getBoundingClientRect();
                    
                    // Prefer elements closer to the button vertically
                    const aDistance = buttonRect.top - aRect.bottom;
                    const bDistance = buttonRect.top - bRect.bottom;
                    return aDistance - bDistance;
                });
                
                // Filter elements that have substantial content (likely to be the tweet text)
                const contentElements = allTextElements.filter(el => {
                    const text = el.textContent.trim();
                    return text.length > 20 && text.length < 1000; // Reasonable tweet length bounds
                });
                
                if (contentElements.length > 0) {
                    // Most likely tweet content is the closest substantial text element
                    extractedText = contentElements[0].textContent.trim();
                    console.log('Content extracted via proximity detection');
                    extractionMethod = 'proximity';
                    return true;
                }
                
                return false;
            };
            
            // STRATEGY 2: Analyze tweet-specific attributes in DOM
            const analyzeTweetAttributes = () => {
                console.log('Searching for tweet-specific data attributes');
                
                // Twitter often uses specific data attributes for tweet content
                const tweetSelectors = [
                    '[data-testid="tweetText"]',
                    '[data-testid="tweet"]',
                    '[data-testid="tweetDetail"]',
                    '[aria-label*="Posted"][role="article"]',
                    '[data-testid="post"]',
                    'article div[lang]',
                    'article div[dir="auto"]'
                ];
                
                for (const selector of tweetSelectors) {
                    // Start search from a higher context - the entire viewport
                    const elements = document.querySelectorAll(selector);
                    
                    for (const element of elements) {
                        // Check if element is visible and positioned above our button
                        if (!isElementVisible(element)) continue;
                        
                        const elemRect = element.getBoundingClientRect();
                        const buttonRect = button.getBoundingClientRect();
                        
                        // Ensure element is above the button (likely the content being replied to)
                        if (elemRect.bottom > buttonRect.top) continue;
                        
                        // Extract text from this element
                        const text = element.textContent.trim();
                        if (text.length > 10) { // Avoid empty or very short content
                            extractedText = text;
                            console.log(`Content extracted via selector: ${selector}`);
                            extractionMethod = 'attribute-selector';
                            return true;
                        }
                    }
                }
                
                return false;
            };
            
            // STRATEGY 3: Create a response with available context even when extraction fails
            const createFallbackResponse = () => {
                console.log('Creating contextual fallback response');
                
                // Determine what type of content we're likely responding to
                const url = window.location.href;
                let contextHint = '';
                
                if (url.includes('/status/')) {
                    contextHint = 'tweet';
                } else if (url.includes('/search')) {
                    contextHint = 'search result';
                } else {
                    contextHint = 'post';
                }
                
                // Get username if possible
                const usernameElement = document.querySelector('[data-testid="User-Name"]');
                const username = usernameElement ? usernameElement.textContent.trim() : '';
                
                extractedText = username ? 
                    `Responding to ${username}'s ${contextHint}` : 
                    `Responding to this ${contextHint}`;
                    
                console.log('Generated fallback context response');
                extractionMethod = 'fallback';
                return true;
            };
            
            // Execute strategies in sequence with performance monitoring
            console.log('Executing extraction strategies in sequence');
            
            // Progressive strategies with fallback chain
            if (!scanProximity()) {
                console.log('Proximity scan failed, trying attribute analysis');
                if (!analyzeTweetAttributes()) {
                    console.log('Attribute analysis failed, creating fallback response');
                    createFallbackResponse();
                }
            }
            
            // Post-processing to remove URLs and cleanup text
            if (extractedText) {
                // Clean up text by removing URLs
                extractedText = extractedText
                    .replace(/https?:\/\/\S+|pic\.\S+/g, '') // Remove URLs
                    .replace(/\s+/g, ' ')                     // Normalize whitespace
                    .trim();
                    
                console.log('Final extracted text:', extractedText.substring(0, 50) + '...');
            }
            
            // Calculate performance metrics
            const extractionTime = performance.now() - extractionStartTime;
            console.log(`Extraction completed in ${extractionTime.toFixed(2)}ms using ${extractionMethod} method`);
            console.groupEnd();
            
            return extractedText;
            
        } catch (error) {
            console.error('Resilient extraction framework encountered an error:', error);
            console.groupEnd();
            
            // Still attempt to provide a usable result despite the error
            return "This reply was created using Twitter Comment Assistant.";
        }
    }

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
          width: 300px;
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
        
        .tca-processed-text {
          padding: 12px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          line-height: 1.4;
          color: #2C3E50;
          max-height: 150px;
          overflow-y: auto;
          word-break: break-word;
        }
        
        .tca-insert-button {
          display: block;
          width: 100%;
          padding: 10px 15px;
          background-color: #1DA1F2;
          color: white;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .tca-insert-button:hover {
          background-color: #0c85d0;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
    
    // Create an enhanced popup system with context isolation
    function createPopup(button) {
        // Establish context identity for the current interaction
        const contextId = Date.now().toString();
        button.dataset.contextId = contextId;
        
        // Extract content with context validation
        const originalText = extractPostText(button);
        const processedText = processPostText(originalText);
        
        // Create a container with context binding
        const container = document.createElement('div');
        container.className = 'tca-popup-container';
        container.dataset.contextId = contextId; // Bind context ID to container
        
        const popup = document.createElement('div');
        popup.className = 'tca-popup';
        
        const header = document.createElement('div');
        header.className = 'tca-popup-header';
        header.textContent = 'Processed Reply Text';
        popup.appendChild(header);
        
        // Add processed text display with validation
        const textDisplay = document.createElement('div');
        textDisplay.className = 'tca-processed-text';
        textDisplay.textContent = processedText || 'No text could be processed.';
        popup.appendChild(textDisplay);
        
        // Add insert button with contextual binding
        const insertButton = document.createElement('button');
        insertButton.className = 'tca-insert-button';
        insertButton.textContent = 'Insert This Text';
        insertButton.addEventListener('click', () => {
            insertReply(processedText);
            hidePopup();
        });
        popup.appendChild(insertButton);
        
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
      const popupWidth = 300; // Width from CSS
      
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
    
    let currentPageContext = window.location.pathname;
    
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
            
            // Reset state with context validation
            console.log('Navigation detected - resetting context');
            currentPageContext = window.location.pathname;
            
            // Clear all popups to prevent stale data presentation
            hidePopup();
            const popupContainers = document.querySelectorAll('.tca-popup-container');
            popupContainers.forEach(container => container.remove());
            
            // Reset button state
            removeButton();
            buttonAdded = false;
            currentViewMode = null;
            
            // Re-check after navigation settles with context validation
            setTimeout(() => {
                // Validate new context
                if (currentPageContext === window.location.pathname) {
                    const inReplyContext = REPLY_SELECTORS.some(selector => {
                        const elements = document.querySelectorAll(selector);
                        return Array.from(elements).some(el => isElementVisible(el));
                    });
                    
                    if (inReplyContext) {
                        addButton();
                    }
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