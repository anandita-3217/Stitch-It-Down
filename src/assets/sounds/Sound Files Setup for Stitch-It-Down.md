# Sound Files Setup for Stitch-It-Down Timer

## Directory Structure
Create the following sound files in your `src/assets/sounds/` directory:

```
src/assets/sounds/
├── bell.wav          # Classic bell sound
├── chime.wav         # Soft chime sound
├── tweet.wav         # Bird tweet sound
├── gong.wav          # Deep gong sound
└── custom/           # Directory for user-added custom sounds
```

## Sound File Requirements

### Format Specifications
- **Supported formats**: WAV, MP3, OGG, AAC
- **Recommended format**: WAV (for best compatibility)
- **Sample rate**: 44.1 kHz or 48 kHz
- **Bit depth**: 16-bit or 24-bit
- **Duration**: 2-5 seconds optimal
- **File size**: Keep under 1MB per file

### Built-in Sound Descriptions

1. **bell.wav** - Traditional bell chime, clear and attention-getting
2. **chime.wav** - Soft, pleasant chime sound, less jarring
3. **tweet.wav** - Gentle bird chirp, nature-inspired
4. **gong.wav** - Deep, resonant gong sound for longer sessions

## Installation Instructions

### Option 1: Download Free Sounds
You can find royalty-free sounds from:
- [Freesound.org](https://freesound.org)
- [Zapsplat](https://www.zapsplat.com)
- [Adobe Stock Audio](https://stock.adobe.com/audio) (with subscription)

### Option 2: Create Your Own
Use audio editing software like:
- **Audacity** (free) - Generate tones and edit audio
- **GarageBand** (Mac) - Create custom notification sounds
- **FL Studio** or **Ableton Live** (professional)

### Sample Audacity Recipe for Bell Sound:
1. Generate → Tone → Sine wave, 800Hz, 2 seconds
2. Effect → Fade Out (last 0.5 seconds)
3. Effect → Amplify (adjust volume to -6dB)
4. Export as WAV file

## Implementation Notes

The sound system in your app will:
- Load all sounds from the assets/sounds directory
- Allow users to test sounds before selecting
- Support custom sound file imports
- Remember user preferences in settings
- Respect system volume controls

## File Naming Convention
- Use lowercase letters
- Separate words with hyphens
- Include file extension
- Keep names descriptive but short

Examples:
- `soft-chime.wav`
- `ocean-wave.mp3`
- `digital-beep.wav`

## Adding New Built-in Sounds

To add new built-in sounds to your app:

1. Add the sound file to `src/assets/sounds/`
2. Update the `builtInSounds` object in `main.js`:

```javascript
this.builtInSounds = {
  'bell': 'bell.wav',
  'chime': 'chime.wav',  
  'tweet': 'tweet.wav',
  'gong': 'gong.wav',
  'ocean': 'ocean-wave.wav',  // New sound
  'digital': 'digital-beep.wav' // New sound
};
```

3. The sound will automatically appear in the settings dropdown

## Testing Your Sounds

Use the test button in the timer settings to:
- Verify sound files load correctly
- Check volume levels
- Ensure sounds aren't too jarring or too quiet
- Test with different system volume levels

## Troubleshooting

### Common Issues:
- **Sound doesn't play**: Check file path and format
- **Volume too low/high**: Adjust audio file levels in editor
- **Crackling/distortion**: Use higher quality source files
- **Long delay**: Optimize file size and format

### Debug Tips:
- Check browser console for audio loading errors
- Verify file permissions in the assets directory
- Test sounds individually before integrating
- Use WAV format for most reliable playback