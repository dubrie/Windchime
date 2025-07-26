// Content script for playing audio tones
class AudioToneGenerator {
  constructor() {
    this.audioContext = null;
    this.initAudioContext();
  }
  
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  
  // Map file size to frequency (Hz)
  sizeToFrequency(sizeBytes) {
    // Define size ranges and corresponding frequencies
    // Tiny files (0-5KB): 5000-1000 Hz (high pitch)
    // Small files (5Kb-10KB): 1000-500 Hz (higher pitch)
    // Medium files (10KB-100KB): 500-300 Hz (medium pitch)  
    // Large files (100-1000KB): 300-200 Hz (lower pitch)
    // Extra Large files (1000KB+): 200-100 Hz (low pitch)
    
    const minFreq = 100;  // Lowest frequency for very large files
    const maxFreq = 5000;  // Highest frequency for very small files
    
    // Use logarithmic scale for better distribution
    const logSize = Math.log(Math.max(sizeBytes, 1));
    const maxLogSize = Math.log(3000000); // 3MB as reference point
    
    // Invert the relationship: smaller files = higher frequency
    const normalizedSize = Math.min(logSize / maxLogSize, 1);
    const frequency = maxFreq - (normalizedSize * (maxFreq - minFreq));
    
    return Math.max(frequency, minFreq);
  }
  
  // Map file size to duration (ms)
  sizeToDuration(sizeBytes) {
    // Smaller files = shorter duration, larger files = longer duration
    const minDuration = 40;   // 50ms for very small files
    const maxDuration = 500;  // 300ms for very large files
    
    const logSize = Math.log(Math.max(sizeBytes, 1));
    const maxLogSize = Math.log(3000000); // 3MB as reference
    
    const normalizedSize = Math.min(logSize / maxLogSize, 1);
    const duration = minDuration + (normalizedSize * (maxDuration - minDuration));
    
    return duration;
  }
  
  playTone(frequency, duration, volume = 0.1) {
    if (!this.audioContext) {
      this.initAudioContext();
      if (!this.audioContext) return;
    }
    
    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Configure oscillator
    oscillator.type = 'sine'; // Smooth sine wave
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Configure volume envelope (fade in/out to avoid clicks)
    const now = this.audioContext.currentTime;
    const fadeTime = 0.01; // 10ms fade
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + fadeTime);
    gainNode.gain.linearRampToValueAtTime(volume, now + duration/1000 - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration/1000);
    
    // Play the tone
    oscillator.start(now);
    oscillator.stop(now + duration/1000);
  }
  
  playRequestTone(sizeBytes) {
    const frequency = this.sizeToFrequency(sizeBytes);
    const duration = this.sizeToDuration(sizeBytes);
    
    // Adjust volume based on size (smaller files = quieter)
    const logSize = Math.log(Math.max(sizeBytes, 1));
    const maxLogSize = Math.log(1000000);
    const normalizedSize = Math.min(logSize / maxLogSize, 1);
    const volume = 0.05 + (normalizedSize * 0.15); // 0.05 to 0.2 volume range
    
    this.playTone(frequency, duration, volume);
    
    // Log for debugging
    console.log(`Playing tone: ${Math.round(frequency)}Hz, ${Math.round(duration)}ms, size: ${this.formatBytes(sizeBytes)}`);
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// Initialize audio generator
const audioGenerator = new AudioToneGenerator();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_AUDIO') {
    // Play audio tone based on request size
    audioGenerator.playRequestTone(message.size);
    sendResponse({ success: true });
  }
});

// Test tone on page load (optional - can be removed)
window.addEventListener('load', () => {
  // Small delay to ensure audio context is ready
  setTimeout(() => {
    console.log('Windchime extension loaded');
  }, 1000);
});
