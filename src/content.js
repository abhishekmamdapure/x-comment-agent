// Twitter Comment Assistant - Content Script

// Comment suggestions
const SUGGESTIONS = [
    { text: 'Thank you', icon: '👍' },
    { text: 'Contact Us via email', icon: '📧' },
    { text: 'Have a great day', icon: '☀️' }
  ];
  
  // State variables
  let suggestionBox = null;
  let isVisible = false;
  
  // Create the suggestion UI
  function createSuggestionBox() {
    const box = document.createElement('div');
    box.className = 'twitter-comment-assistant';
    box.style.display = 'none';
    
    const header = document.createElement('div');
    header.className = 'tca-header';
    header.textContent = 'Quick Replies';
    box.appendChild(header);
    
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'tca-suggestions';
    
    SUGGESTIONS.forEach(suggestion => {
      const button = document.createElement('button');
      button.className = 'tca-suggestion-btn';
      
      const icon = document.createElement('span');
      icon.className = 'tca-icon';
      icon.textContent = suggestion.icon;
      
      const text = document.createElement('span');
      text.className = 'tca-text';
      text.textContent = suggestion.text;
      
      button.appendChild(icon);
      button.appendChild(text);
      
      button.addEventListener('click', () => {
        insertSuggestion(suggestion.text);
      });
      
      suggestionsContainer.appendChild(button);
    });
    
    box.appendChild(suggestionsContainer);
    return box;
  }
  
  // Show suggestion box near button
  function showSuggestionBox(buttonElement) {
    if (!suggestionBox) {
      suggestionBox = createSuggestionBox();
      document.body.appendChild(suggestionBox);
    }
    
    if (!isVisible) {
      const rect = buttonElement.getBoundingClientRect();
      
      suggestionBox.style.position = 'absolute';
      suggestionBox.style.left = `${rect.left - (suggestionBox.offsetWidth / 2) + (buttonElement.offsetWidth / 2)}px`;
      suggestionBox.style.top = `${rect.top - suggestionBox.offsetHeight - 10}px`;
      
      suggestionBox.style.display = 'block';
      
      isVisible = true;
    }
  }
  
  // Hide suggestion box
  function hideSuggestionBox() {
    if (suggestionBox && isVisible) {
      suggestionBox.style.display = 'none';
      isVisible = false;
    }
  }
  
  // Insert text into reply field
  function insertSuggestion(text) {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"], [role="textbox"][aria-label="Post your reply"]');
    
    if (replyBox) {
      // For contenteditable divs
      if (replyBox.getAttribute('contenteditable') === 'true') {
        replyBox.textContent = text;
        
        // Dispatch events to trigger Twitter's UI updates
        ['input', 'change'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          replyBox.dispatchEvent(event);
        });
      } 
      // For regular inputs
      else if (replyBox.tagName === 'TEXTAREA' || replyBox.tagName === 'INPUT') {
        replyBox.value = text;
        
        const event = new Event('input', { bubbles: true });
        replyBox.dispatchEvent(event);
      }
      
      // Enable the reply button
      setTimeout(() => {
        const replyButton = document.querySelector('[data-testid="tweetButton"]');
        if (replyButton) {
          replyButton.removeAttribute('disabled');
        }
      }, 100);
    }
    
    hideSuggestionBox();
  }
  
  // Create our green button
  function createQuickReplyButton() {
    const button = document.createElement('div');
    button.className = 'quick-reply-button';
    button.style.width = '24px';
    button.style.height = '24px';
    button.style.backgroundColor = '#00FF00';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.margin = '0 4px';
    
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      
      if (isVisible) {
        hideSuggestionBox();
      } else {
        showSuggestionBox(button);
      }
    });
    
    return button;
  }
  
  // Insert button into toolbar
  function insertQuickReplyButton() {
    const toolbars = document.querySelectorAll('[role="toolbar"]');
    
    toolbars.forEach(toolbar => {
      if (!toolbar.querySelector('.quick-reply-button')) {
        const button = createQuickReplyButton();
        toolbar.appendChild(button);
      }
    });
  }
  
  // Handle clicks outside suggestion box
  document.addEventListener('click', function(event) {
    if (isVisible && suggestionBox) {
      if (!suggestionBox.contains(event.target) && 
          !event.target.classList.contains('quick-reply-button')) {
        hideSuggestionBox();
      }
    }
  });
  
  // Watch for new toolbars
  const observer = new MutationObserver(() => {
    setTimeout(insertQuickReplyButton, 500);
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Initialize
  window.addEventListener('load', function() {
    console.log('Twitter Comment Assistant initialized');
    setTimeout(insertQuickReplyButton, 1000);
  });
  
  // Check periodically
  setInterval(insertQuickReplyButton, 3000);