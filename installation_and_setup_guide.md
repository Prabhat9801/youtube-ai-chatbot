# YouTube AI Chatbot - Complete Installation Guide

## Step-by-Step Installation Process

### Step 1: Get Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the generated API key
5. Keep this key secure - you'll need it for the backend

### Step 2: Download and Setup Project Files

#### Option A: Manual Setup
1. Create a new folder: `youtube-ai-chatbot`
2. Create the following directory structure:
```
youtube-ai-chatbot/
├── extension/
│   └── icons/
└── backend/
```
3. Copy all the files from the project structure above into their respective folders

#### Option B: Quick Setup Script
Create a setup script to automate folder creation:

```bash
#!/bin/bash
# Create project structure
mkdir -p youtube-ai-chatbot/{extension/icons,backend}
cd youtube-ai-chatbot
echo "Project structure created!"
```

### Step 3: Backend Installation

1. Open terminal/command prompt
2. Navigate to the project directory:
```bash
cd youtube-ai-chatbot/backend
```

3. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

4. Install required packages:
```bash
pip install flask==2.3.3 flask-cors==4.0.0 youtube-transcript-api==0.6.1 langchain==0.0.335 langchain-google-genai==0.0.6 langchain-community==0.0.10 faiss-cpu==1.7.4 python-dotenv==1.0.0 requests==2.31.0
```

5. Create environment file (.env):
```bash
# Windows
echo GOOGLE_API_KEY=your_actual_api_key_here > .env

# macOS/Linux  
echo "GOOGLE_API_KEY=your_actual_api_key_here" > .env
```

6. Test the backend:
```bash
python app.py
```
You should see: `Running on http://0.0.0.0:5000`

### Step 4: Extension Installation

#### For Google Chrome:
1. Open Chrome browser
2. Type `chrome://extensions/` in address bar
3. Turn on "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Navigate to and select the `extension` folder
6. The extension should now appear in your extensions list

#### For Microsoft Edge:
1. Open Edge browser  
2. Type `edge://extensions/` in address bar
3. Turn on "Developer mode" (left sidebar)
4. Click "Load unpacked"
5. Navigate to and select the `extension` folder
6. The extension should now appear in your extensions list

### Step 5: Create Extension Icons

You need to add icon files to the `extension/icons/` folder:

1. Download or create three icon sizes:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels) 
   - `icon128.png` (128x128 pixels)

2. Use any image editing software or online tool to create simple chat/bot icons

### Step 6: Testing the Installation

1. **Start the backend:**
```bash
cd youtube-ai-chatbot/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. **Open YouTube:**
   - Go to any YouTube video with captions
   - You should see a floating purple chat button in bottom-right corner

3. **Test the chatbot:**
   - Click the floating button
   - Type a question about the video
   - Wait for AI response

### Step 7: Troubleshooting Common Issues

#### Backend Issues:
```bash
# If you get import errors:
pip install --upgrade pip
pip install -r requirements.txt

# If FAISS installation fails on Windows:
pip install faiss-cpu --no-cache

# If Google API errors:
# Check your .env file has correct API key
# Verify API key has Gemini API access enabled
```

#### Extension Issues:
```bash
# If extension doesn't load:
1. Check all files are in correct folders
2. Verify manifest.json syntax
3. Check browser console for errors (F12)

# If chatbot doesn't appear on YouTube:
1. Refresh the YouTube page
2. Check extension is enabled
3. Look for errors in browser console
```

#### Connection Issues:
```bash
# If chatbot can't connect to backend:
1. Ensure backend is running on localhost:5000
2. Check firewall settings
3. Verify CORS is enabled in backend
```

### Step 8: Usage Instructions

1. **Starting the System:**
   - Always start backend server first
   - Then open YouTube in browser
   - Extension automatically activates on YouTube pages

2. **Using the Chatbot:**
   - Click floating chat button to open interface
   - Drag the button or chat window to reposition
   - Type questions about the current video
   - Chat interface remembers context within the video

3. **Managing the Extension:**
   - Click extension icon in browser toolbar for settings
   - Disable/enable through browser extension settings
   - Chat data is temporary and resets when changing videos

### Step 9: Advanced Configuration

#### Backend Customization:
Edit `backend/config.py`:
```python
# Adjust RAG parameters
CHUNK_SIZE = 1500  # Larger chunks for more context
SIMILARITY_TOP_K = 6  # More retrieved documents
LLM_TEMPERATURE = 0.1  # More focused responses
```

#### Extension Customization:
Edit `extension/content.js`:
```javascript
// Change default position
this.backendUrl = 'http://localhost:5000';  // Backend URL
// Modify chat interface size, colors, etc. in styles.css
```

### Step 10: Deployment (Optional)

#### For Backend:
```bash
# Using Heroku, Railway, or similar service
# Update backend URL in extension/content.js
# this.backendUrl = 'https://your-backend-url.com';
```

#### For Extension:
```bash
# Package for Chrome Web Store:
# Zip the extension folder
# Submit to Chrome Web Store for review
```

## File Checklist

Before running, ensure you have:
- [ ] All Python dependencies installed
- [ ] Google API key in .env file  
- [ ] Extension loaded in browser
- [ ] Icon files in extension/icons/
- [ ] Backend server running
- [ ] YouTube page open with video

## Support & Maintenance

### Regular Updates:
- Update Python packages: `pip install -r requirements.txt --upgrade`
- Check for extension manifest updates
- Monitor Google API changes

### Performance Tips:
- Backend caches processed videos automatically
- Restart backend periodically to clear memory
- Use videos with good quality captions for best results

### Security Notes:
- Keep your Google API key secure
- Don't commit .env file to version control
- Backend runs locally for privacy

The system is now ready to use! The chatbot will provide intelligent responses based on the YouTube video content using your RAG implementation.