// Popup functionality
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-chat');
  const settingsBtn = document.getElementById('open-settings');
  const statusDiv = document.getElementById('status');
  
  // Check backend status
  checkBackendStatus();
  
  toggleBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle-chat'});
        window.close();
      } else {
        alert('Please navigate to YouTube first!');
      }
    });
  });
  
  settingsBtn.addEventListener('click', function() {
    // Open settings page or show settings popup
    alert('Settings coming soon!');
  });
  
  async function checkBackendStatus() {
    try {
      const response = await fetch('http://localhost:5000/status');
      if (response.ok) {
        statusDiv.textContent = 'Backend Status: Connected';
        statusDiv.className = 'status active';
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      statusDiv.textContent = 'Backend Status: Disconnected';
      statusDiv.className = 'status inactive';
    }
  }
});