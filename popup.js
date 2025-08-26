// Popup script for controlling the extension
document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusElement = document.getElementById('status');
  const testTinyBtn = document.getElementById('testTiny');
  const testSmallBtn = document.getElementById('testSmall');
  const testMediumBtn = document.getElementById('testMedium');
  const testLargeBtn = document.getElementById('testLarge');
  const testXLargeBtn = document.getElementById('testXLarge');
  
  // Audio context for test tones
  let audioContext;
  
  function initAudioContext() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  
  // Initialize audio context
  initAudioContext();
  
  // Load current status
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response && response.enabled !== undefined) {
      updateToggleState(response.enabled);
      updateStatus(response.enabled);
    }
  });
  
  // Toggle switch functionality
  toggleSwitch.addEventListener('click', function() {
    const isCurrentlyEnabled = toggleSwitch.classList.contains('active');
    const newState = !isCurrentlyEnabled;
    
    chrome.runtime.sendMessage({ 
      type: 'TOGGLE_ENABLED', 
      enabled: newState 
    }, (response) => {
      if (response && response.success) {
        updateToggleState(newState);
        updateStatus(newState);
      }
    });
  });
  
  function updateToggleState(enabled) {
    if (enabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
  }
  
  function updateStatus(enabled) {
    statusElement.textContent = enabled ? 
      'Extension is active - listening for requests' : 
      'Extension is disabled';
  }
  
  // Test tone functions
  function playTestTone(frequency, duration, volume = 0.1) {
    if (!audioContext) {
      initAudioContext();
      if (!audioContext) return;
    }
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Volume envelope
    const now = audioContext.currentTime;
    const fadeTime = 0.01;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + fadeTime);
    gainNode.gain.linearRampToValueAtTime(volume, now + duration/1000 - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration/1000);
    
    oscillator.start(now);
    oscillator.stop(now + duration/1000);
  }
  
  // Test button event listeners
  testTinyBtn.addEventListener('click', function() {
    // Simulate tiny file (1KB) - high pitch, short duration
    playTestTone(1500, 40, 0.05);
    this.style.transform = 'scale(0.95)';
    setTimeout(() => this.style.transform = '', 60);
    console.log(`Playing Tiny test tone: 1500Hz, 40ms`);

  });
  
  // Test button event listeners
  testSmallBtn.addEventListener('click', function() {
    // Simulate small file (5KB) - high pitch, short duration
    playTestTone(700, 80, 0.08);
    this.style.transform = 'scale(0.95)';
    setTimeout(() => this.style.transform = '', 100);
    console.log(`Playing Small test tone: 700Hz, 80ms`);
  });
  
  testMediumBtn.addEventListener('click', function() {
    // Simulate medium file (50KB) - medium pitch, medium duration  
    playTestTone(350, 150, 0.12);
    this.style.transform = 'scale(0.95)';
    setTimeout(() => this.style.transform = '', 150);
    console.log(`Playing Medium test tone: 350Hz, 150ms`);
  });
  
  testLargeBtn.addEventListener('click', function() {
    // Simulate large file (500KB) - low pitch, long duration
    playTestTone(150, 250, 0.15);
    this.style.transform = 'scale(0.95)';
    setTimeout(() => this.style.transform = '', 250);
    console.log(`Playing Large test tone: 150Hz, 250ms`);
  });
  
  testXLargeBtn.addEventListener('click', function() {
    // Simulate Xlarge file (1500KB) - low pitch, long duration
    playTestTone(100, 400, 0.18);
    this.style.transform = 'scale(0.95)';
    setTimeout(() => this.style.transform = '', 400);
    console.log(`Playing X-Large test tone: 100Hz, 400ms`);
  });
  
  // Handle user gesture requirement for audio
  document.addEventListener('click', function() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }, { once: true });
});
