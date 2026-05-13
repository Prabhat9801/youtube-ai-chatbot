// Background script
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube AI Chatbot extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    backendUrl: 'http://localhost:5000',
    chatPosition: { bottom: 20, right: 20 }
  });
});

// Proxy API requests through the extension to avoid page CORS/PNA limits
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'api-request') return;

  const { url, options } = request.payload || {};
  if (!url) {
    sendResponse({ ok: false, error: 'Missing URL' });
    return;
  }

  console.log('[yt-ai-chatbot] Proxy request:', url);

  fetch(url, options)
    .then(async (res) => {
      const text = await res.text();
      console.log('[yt-ai-chatbot] Proxy response:', res.status);
      sendResponse({ ok: res.ok, status: res.status, text });
    })
    .catch((err) => {
      console.error('[yt-ai-chatbot] Proxy error:', err);
      sendResponse({ ok: false, error: String(err) });
    });

  return true; // Keep the message channel open for async response
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('youtube.com')) {
    chrome.tabs.sendMessage(tab.id, {action: 'toggle-chat'});
  }
});