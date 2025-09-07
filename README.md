# YouTube AI Chatbot Extension

A powerful browser extension that adds an AI chatbot to YouTube, allowing users to have intelligent conversations about video content using RAG (Retrieval-Augmented Generation) technology.

## Features

- **Floating Chat Interface**: Draggable chat button and window that doesn't interfere with video watching
- **Real-time AI Responses**: Ask questions about any YouTube video with captions
- **Smart Context Understanding**: Uses RAG technology to provide accurate answers based on video transcripts
- **Cross-platform Support**: Works on Chrome, Edge, and other Chromium-based browsers
- **Responsive Design**: Adapts to desktop, tablet, and mobile screens
- **Privacy-focused**: Processes data locally on your machine

## Prerequisites

- Python 3.8 or higher
- Google Gemini API key ([Get one here](https://aistudio.google.com/))
- Chrome, Edge, or Chromium-based browser

## Quick Installation

### 1. Backend Setup

```bash
# Clone or download the project
cd youtube-ai-chatbot/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Google API key
echo "GOOGLE_API_KEY=your_api_key_here" > .env

# Start the server
python app.py
```

### 2. Browser Extension Installation

**Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

**Edge:**
1. Open `edge://extensions/`
2. Enable "Developer mode" 
3. Click "Load unpacked"
4. Select the `extension` folder

## Usage

1. **Start the backend server** (must be running for the extension to work)
2. **Navigate to YouTube** and open any video with captions
3. **Click the purple floating button** in the bottom-right corner
4. **Start chatting** about the video content!

## How It Works

1. **Transcript Extraction**: Automatically fetches YouTube video transcripts
2. **Text Chunking**: Splits transcripts into manageable pieces for processing
3. **Vector Embeddings**: Creates searchable embeddings using Google's models
4. **Similarity Search**: Finds relevant content chunks for user queries
5. **AI Response**: Generates contextual answers using Gemini AI

## Project Structure

```
youtube-ai-chatbot/
├── extension/                 # Browser extension files
│   ├── manifest.json         # Extension configuration
│   ├── content.js           # Main extension logic
│   ├── popup.html           # Extension popup interface
│   ├── popup.js             # Popup functionality
│   ├── background.js        # Background processes
│   ├── styles.css           # Extension styling
│   └── icons/               # Extension icons
├── backend/                  # Python backend server
│   ├── app.py               # Flask web server
│   ├── rag_system.py        # RAG implementation
│   ├── config.py            # Configuration settings
│   └── requirements.txt     # Python dependencies
└── README.md               # This file
```

## Configuration

### Backend Configuration (`backend/config.py`)
- Adjust chunk sizes for transcript processing
- Modify similarity search parameters
- Change AI model temperature settings

### Extension Configuration (`extension/content.js`)
- Change backend URL for deployment
- Modify chat interface positioning
- Customize appearance and behavior

## Troubleshooting

### Common Issues

**Extension not appearing:**
- Refresh the YouTube page
- Check that the extension is enabled
- Verify all files are in the correct folders

**Backend connection errors:**
- Ensure the backend server is running on port 5000
- Check your Google API key is valid
- Verify firewall settings aren't blocking connections

**No responses from AI:**
- Confirm the video has available captions
- Check the browser console for error messages
- Restart the backend server

### API Key Issues
- Make sure you have a valid Google Gemini API key
- Verify the API key has access to the Gemini models
- Check your API usage limits

## Development

### Running in Development Mode
```bash
# Backend with auto-reload
cd backend
export FLASK_ENV=development
python app.py

# Extension development
# Load the unpacked extension and refresh after changes
```

### Testing
- Test with various YouTube videos
- Try different question types
- Verify responsive design on mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify your setup matches the installation guide
3. Check browser console for error messages
4. Ensure all dependencies are properly installed

## Privacy & Security

- All video processing happens locally on your machine
- No video data is sent to external servers (except Google's API for AI responses)
- Your Google API key is stored locally in your .env file
- The extension only activates on YouTube pages

## Limitations

- Requires videos to have captions/transcripts available
- Responses are based only on transcript content, not visual elements
- Backend must be running locally for the extension to function
- Some videos may not have machine-readable transcripts

---

**Enjoy chatting with your favorite YouTube videos!** 🎥🤖