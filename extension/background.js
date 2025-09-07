// Background script
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube AI Chatbot extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    backendUrl: 'http://localhost:5000',
    chatPosition: { bottom: 20, right: 20 }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('youtube.com')) {
    chrome.tabs.sendMessage(tab.id, {action: 'toggle-chat'});
  }
});