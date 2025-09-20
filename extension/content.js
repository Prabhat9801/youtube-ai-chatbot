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

  formatMessage(message) {
    // First, escape any HTML to prevent XSS
    message = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert markdown to HTML
    
    // Headers
    message = message.replace(/^# (.*?)$/gm, '<h2 class="chat-h2">$1</h2>');
    message = message.replace(/^## (.*?)$/gm, '<h3 class="chat-h3">$1</h3>');
    message = message.replace(/^### (.*?)$/gm, '<h4 class="chat-h4">$1</h4>');
    
    // Code blocks
    message = message.replace(/```(\w*)\n([\s\S]*?)\n```/g, 
      '<pre class="chat-code-block"><code class="language-$1">$2</code></pre>');
    
    // Inline code
    message = message.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
    
    // Timeline
    message = message.replace(/^\[(.*?)\](.*?)$/gm, 
      '<div class="chat-timeline-item"><span class="timeline-date">[$1]</span>$2</div>');
    message = message.replace(/│/g, '<div class="timeline-connector"></div>');
    
    // Definition lists
    message = message.replace(/^(.*?)\n:(.*?)$/gm, 
      '<dl class="chat-definition"><dt>$1</dt><dd>$2</dd></dl>');
    
    // Blockquotes
    message = message.replace(/^> (.*?)$/gm, '<blockquote class="chat-quote">$1</blockquote>');
    
    // Horizontal rules
    message = message.replace(/^---$/gm, '<hr class="chat-hr">');
    
    // Lists
    message = message.replace(/^\d+\.\s+(.*?)$/gm, '<div class="chat-list-item numbered">$&</div>');
    message = message.replace(/^-\s+(.*?)$/gm, '<div class="chat-list-item bullet">$1</div>');
    message = message.replace(/^\s\s-\s+(.*?)$/gm, '<div class="chat-list-item sub-bullet">$1</div>');
    
    // Bold text
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Tables
    message = message.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim());
      return `<div class="table-row">${cells.map(cell => 
        `<div class="table-cell">${cell}</div>`).join('')}</div>`;
    });
    message = message.replace(/<div class="table-row">(<div class="table-cell">-+<\/div>)+<\/div>/g, '');
    message = message.replace(
      /(<div class="table-row">.*?<\/div>)\s*(<div class="table-row">)/g, 
      '<div class="chat-table">$1$2'
    );
    message = message.replace(
      /(<div class="table-row">.*?<\/div>)(?!\s*<div class="table-row">)/g,
      '$1</div>'
    );
    
    // Line breaks and spacing
    message = message.replace(/\n\n/g, '<div class="chat-section-break"></div>');
    message = message.replace(/\n/g, '<br>');
    
    return message;
  }

  addMessageToChat(message, sender, isLoading = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const messageId = isLoading ? `loading-${Date.now()}` : `msg-${Date.now()}`;
    
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}-message`;
    
    // Use innerHTML for formatted messages from bot, textContent for user messages
    if (sender === 'bot' && !isLoading) {
      messageDiv.innerHTML = this.formatMessage(message);
    } else {
      messageDiv.textContent = message;
    }
    
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