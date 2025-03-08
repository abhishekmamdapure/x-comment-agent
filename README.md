# Twitter Comment Assistant

A Chrome extension that helps users quickly reply to Twitter posts with suggested comments.

## Features

- 🟩 Adds a green square button next to the Reply button on Twitter
- 💬 Provides three quick reply suggestions:
  1. "Thank you"
  2. "Contact Us via email"
  3. "Have a great day"
- 🎯 Dynamically positions the button for any comment section
- 📱 Works with scrolling and dynamic page updates
- ✨ Seamlessly integrates with Twitter's UI

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to Twitter (twitter.com)
2. Find any post you want to reply to
3. Click the reply button or start writing a comment
4. Look for the green square button (➕) next to the Reply button
5. Click the green button to see quick reply suggestions
6. Select a suggestion to automatically insert it into your reply
7. Click the Reply button to post your comment

## Development

### Project Structure
```
twitter-comment-assistant/
├── manifest.json           # Extension configuration
├── src/
│   ├── content.js         # Main functionality
│   └── background.js      # Background script
├── images/                # Extension icons
├── README.md             # Documentation
└── package.json          # Project dependencies
```

### Local Development

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on Twitter

## Requirements

- Google Chrome browser
- Twitter account
- Developer mode enabled in Chrome extensions

## License

MIT License - See LICENSE file for details