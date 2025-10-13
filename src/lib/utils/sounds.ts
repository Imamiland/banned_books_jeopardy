// Sound utilities for the Banned Books Jeopardy game
// This module provides caching and playback functions for game sound effects

const soundCache = new Map<string, HTMLAudioElement>();

/**
 * Play a sound effect with optional looping
 * @param soundName - Name of the sound file (without .mp3 extension)
 * @param loop - Whether to loop the sound (default: false)
 * @returns The HTMLAudioElement instance for further control
 *
 * @example
 * // Play a one-time sound
 * playSound('tile-click');
 *
 * @example
 * // Play a looping sound
 * const tickAudio = playSound('timer-tick', true);
 * // Later, stop it:
 * stopSound('timer-tick');
 */
export function playSound(soundName: string, loop = false): HTMLAudioElement {
  if (!soundCache.has(soundName)) {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    soundCache.set(soundName, audio);
  }

  const audio = soundCache.get(soundName)!;
  audio.loop = loop;
  audio.currentTime = 0;

  audio.play().catch((err) => {
    console.error(`Failed to play sound: ${soundName}`, err);
  });

  return audio;
}

/**
 * Stop a playing sound effect
 * @param soundName - Name of the sound file (without .mp3 extension)
 *
 * @example
 * stopSound('timer-tick');
 */
export function stopSound(soundName: string): void {
  const audio = soundCache.get(soundName);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Preload a sound effect into the cache
 * This is useful for ensuring sounds are ready before the user needs them
 * @param soundName - Name of the sound file (without .mp3 extension)
 *
 * @example
 * // Preload all sounds on app initialization
 * preloadSound('tile-click');
 * preloadSound('tile-flip');
 * preloadSound('timer-tick');
 */
export function preloadSound(soundName: string): void {
  if (!soundCache.has(soundName)) {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    soundCache.set(soundName, audio);
  }
}

/**
 * Preload all game sounds
 * Call this on app initialization to ensure all sounds are cached
 *
 * @example
 * // In your +layout.svelte or app initialization
 * import { onMount } from 'svelte';
 * import { preloadAllSounds } from '$lib/utils/sounds';
 *
 * onMount(() => {
 *   preloadAllSounds();
 * });
 */
export function preloadAllSounds(): void {
  const sounds = [
    'tile-click',
    'tile-flip',
    'timer-tick',
    'timer-expire',
    'answer-reveal',
    'board-complete'
  ];

  sounds.forEach(preloadSound);
}

/**
 * Clear the sound cache
 * Useful for cleaning up resources
 */
export function clearSoundCache(): void {
  soundCache.forEach((audio) => {
    audio.pause();
    audio.src = '';
  });
  soundCache.clear();
}
