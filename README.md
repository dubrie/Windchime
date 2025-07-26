# Windchime - A Network Request Audio Feedback Chrome Extension

Windchime is a proof of concept Chrome extension that plays audio tones for every network request loaded on the current page. The audio tone frequency and duration correspond to the size of the request body - small files play high-pitched short tones, while large files play low-pitched longer tones. My hope here was to better understand what pages I visit are doing behind the scenes while I'm not actively watching the network traffic.

## Features

- 🎵 **Audio feedback** for network requests based on file size
- 🔊 **Dynamic tone mapping**: Small files = high pitch, large files = low pitch
- ⏱️ **Duration scaling**: Larger files play longer tones
- 🎛️ **Toggle control** via popup interface
- 🧪 **Test buttons** to preview different tone types
- 📊 **Real-time monitoring** of network activity

## How It Works

The extension monitors network requests using Chrome's `webRequest` API and maps file sizes to audio properties:

### Tone Mapping
- **Small files (0-10KB)**: 800-400 Hz, 50-100ms duration
- **Medium files (10KB-100KB)**: 400-200 Hz, 100-200ms duration  
- **Large files (100KB+)**: 200-100 Hz, 200-300ms duration

### Volume Scaling
- Smaller files play at lower volume (quieter)
- Larger files play at higher volume (louder)
- All tones use smooth fade-in/fade-out to prevent audio clicks

## Installation

### From Source (Developer Mode)

1. **Clone or download** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension directory
5. **Pin the extension** to your toolbar for easy access

### Files Structure
```
network-audio-extension/
├── manifest.json          # Extension configuration
├── background.js          # Network request monitoring
├── content.js            # Audio tone generation
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── icon16.png            # 16x16 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
└── README.md             # This file
```

## Usage

1. **Install the extension** following the steps above
2. **Navigate to any website** (e.g., news sites, social media, web apps)
3. **Listen for audio tones** as the page loads resources
4. **Click the extension icon** to open the control popup
5. **Use the toggle** to enable/disable audio feedback
6. **Try the test buttons** to hear different tone examples

### Control Panel

The popup interface provides:
- **Enable/Disable toggle**: Turn audio feedback on/off
- **Test buttons**: Preview small, medium, and large file tones
- **Status indicator**: Shows current extension state
- **Usage guide**: Quick reference for tone meanings

## Technical Details

### Audio Generation
- Uses **Web Audio API** for precise tone generation
- **Sine wave oscillators** for smooth, pleasant tones
- **Gain node envelopes** for fade-in/fade-out effects
- **Logarithmic scaling** for natural size-to-frequency mapping

### Network Monitoring
- **Chrome webRequest API** captures all HTTP requests
- **Content-Length headers** provide accurate file sizes
- **Fallback estimation** for requests without size headers
- **Active tab filtering** ensures only current page requests trigger audio

### Performance
- **Lightweight**: Minimal CPU and memory usage
- **Non-blocking**: Audio generation doesn't affect page performance  
- **Efficient**: Only monitors active tab requests
- **Graceful fallbacks**: Works even without audio support

## Browser Compatibility

- **Chrome 88+** (Manifest V3 support required)
- **Chromium-based browsers** (Edge, Brave, Opera, etc.)
- **Web Audio API support** required for audio playback

## Privacy & Permissions

The extension requires these permissions:
- **webRequest**: Monitor network requests for size information
- **activeTab**: Only process requests from the current active tab
- **storage**: Save user preferences (enable/disable state)
- **host_permissions**: Access all URLs to monitor any website

**Privacy Note**: This extension only processes request metadata (URLs and sizes) locally. No data is transmitted to external servers.

## Troubleshooting

### No Audio Playing
- Check if audio is enabled in the popup
- Ensure your browser allows audio playback
- Try the test buttons to verify audio functionality
- Check browser console for any error messages

### Audio Not Working on Some Sites
- Some sites may block audio context creation
- Try refreshing the page after enabling the extension
- Check if the site has strict content security policies

### Performance Issues
- The extension is designed to be lightweight
- If you experience issues, try disabling and re-enabling
- Check Chrome's task manager for resource usage

## Development

To modify or extend the extension:

1. **Edit the source files** as needed
2. **Reload the extension** in `chrome://extensions/`
3. **Test changes** on various websites
4. **Check browser console** for debugging information

### Key Files to Modify
- `content.js`: Audio generation and tone mapping logic
- `background.js`: Network request monitoring and filtering
- `popup.html/js`: User interface and controls
- `manifest.json`: Permissions and extension configuration

## License

This project is open source. See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.
