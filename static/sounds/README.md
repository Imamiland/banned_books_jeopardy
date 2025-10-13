# Sound Effects

This directory contains sound effects for the Banned Books Jeopardy game.

## Required Sound Files

| File Name            | Purpose                              | Duration | Notes                     |
| -------------------- | ------------------------------------ | -------- | ------------------------- |
| `tile-click.mp3`     | Quick click/pop when tile is clicked | 0.1-0.3s | Sharp, immediate feedback |
| `tile-flip.mp3`      | Whoosh/swoosh during flip animation  | 0.5-0.8s | Smooth transition sound   |
| `timer-tick.mp3`     | Clock ticking during countdown       | 1s       | Must loop seamlessly      |
| `timer-expire.mp3`   | Buzzer/bell when time runs out       | 1-2s     | Classic Jeopardy buzzer   |
| `answer-reveal.mp3`  | Dramatic reveal of answer            | 1-3s     | Jeopardy-style reveal     |
| `board-complete.mp3` | Victory when all tiles answered      | 3-5s     | Celebratory sound         |

## Audio Specifications

- **Format**: MP3
- **Bitrate**: 128-192 kbps (balance quality and file size)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Mono or Stereo

## Sourcing Sound Effects

### Free Resources (Royalty-Free)

- [Freesound.org](https://freesound.org/) - Creative Commons licensed sounds
- [Zapsplat](https://www.zapsplat.com/) - Free sound effects for projects
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) - 16,000+ BBC sound effects

### Paid Resources

- [AudioJungle](https://audiojungle.net/) - Professional sound effects
- [Epidemic Sound](https://www.epidemicsound.com/) - Subscription-based library

### Custom Creation

- Use [Audacity](https://www.audacityteam.org/) (free, open-source) to:
  - Record custom sounds
  - Edit and trim audio
  - Export as MP3
  - Normalize volume levels

## Implementation

Sound effects are played using the utility in `src/lib/utils/sounds.ts`:

```typescript
import { playSound, stopSound } from '$lib/utils/sounds';

// Play a sound
playSound('tile-click');

// Play a looping sound
const audio = playSound('timer-tick', true);

// Stop a looping sound
stopSound('timer-tick');
```

## Browser Compatibility

**Important**: Modern browsers have autoplay policies that prevent sounds from playing until the user interacts with the page. The first sound should only play after a user action (click, tap, etc.).

## Testing

Test sounds in different browsers and volumes:

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

Ensure:

1. All sounds play correctly
2. Looping sounds have no gaps
3. Volume levels are consistent
4. No distortion at higher volumes
