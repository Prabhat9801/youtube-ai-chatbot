// YouTube AI Chatbot Content Script
class YouTubeChatbot {
  constructor() {
    this.isActive = false;
    this.currentVideoId = null;
    this.chatContainer = null;
    this.backendUrl = 'http://localhost:5000';
    this.conversationHistory = [];
    this.init();
  }

  init() {
    this.createChatButton();
    this.observeVideoChanges();
    this.setupEventListeners();
  }

  createChatButton() {
    // Create floating chat button
    const chatButton = document.createElement('div');
    chatButton.id = 'yt-ai-chat-button';
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    `;
    chatButton.title = 'AI Chat Assistant';
    
    document.body.appendChild(chatButton);
    
    // Make it draggable
    this.makeDraggable(chatButton);
    
    chatButton.addEventListener('click', () => this.toggleChat());
  }

  createChatInterface() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'yt-ai-chat-container';
    chatContainer.innerHTML = `
      <div class="chat-header">
        <span>AI Assistant</span>
        <button class="close-btn" id="close-chat">×</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="message bot-message">
          Hello! I can help you understand this YouTube video. Ask me anything!
        </div>
      </div>
      <div class="chat-input-container">
        <input type="text" id="chat-input" placeholder="Ask about the video...">
        <button id="send-btn">Send</button>
      </div>
    `;
    
    document.body.appendChild(chatContainer);
    this.chatContainer = chatContainer;
    
    // Setup chat functionality
    this.setupChatFunctionality();
    
    // Make it draggable
    this.makeDraggable(chatContainer.querySelector('.chat-header'));
  }

  setupChatFunctionality() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.getElementById('close-chat');
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    closeBtn.addEventListener('click', () => this.toggleChat());
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat and history
    this.addMessageToChat(message, 'user');
    this.conversationHistory.push({ sender: 'user', message });
    input.value = '';
    
    // Get current video ID
    const videoId = this.getCurrentVideoId();
    
    try {
      // Show loading
      const loadingId = this.addMessageToChat('Thinking...', 'bot', true);
      
      // Send to backend
      const response = await fetch(`${this.backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          video_id: videoId,
          history: this.conversationHistory
        })
      });
      
      const data = await response.json();
      
      // Remove loading message
      document.getElementById(loadingId).remove();
      
      // Add bot response to chat and history
      this.addMessageToChat(data.response, 'bot');
      this.conversationHistory.push({ sender: 'bot', message: data.response });
      
    } catch (error) {
      console.error('Error:', error);
      document.getElementById(loadingId).remove();
      this.addMessageToChat('Sorry, there was an error processing your request.', 'bot');
    }
  }

  addMessageToChat(message, sender, isLoading = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const messageId = isLoading ? `loading-${Date.now()}` : `msg-${Date.now()}`;
    
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
  }

  getCurrentVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('v');
  }

  observeVideoChanges() {
    // Watch for URL changes (YouTube SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.currentVideoId = this.getCurrentVideoId();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  toggleChat() {
    if (this.isActive) {
      if (this.chatContainer) {
        this.chatContainer.style.display = 'none';
      }
      this.isActive = false;
    } else {
      if (!this.chatContainer) {
        this.createChatInterface();
      }
      this.chatContainer.style.display = 'block';
      this.isActive = true;
    }
  }

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      const targetElement = element.id === 'yt-ai-chat-button' ? element : element.parentElement;
      targetElement.style.top = (targetElement.offsetTop - pos2) + "px";
      targetElement.style.left = (targetElement.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  setupEventListeners() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggle-chat') {
        this.toggleChat();
      }
    });
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubeChatbot();
  });
} else {
  new YouTubeChatbot();
}