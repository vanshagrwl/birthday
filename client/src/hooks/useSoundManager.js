import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const SOUNDS = {
  // Magical chimes for interactions
  chime: '/sounds/chime.mp3',
  sparkle: '/sounds/sparkle.mp3',
  heart: '/sounds/heart.mp3',
  unlock: '/sounds/unlock.mp3',
  celebration: '/sounds/celebration.mp3',
  // Background music
  background: '/sounds/background.mp3',
  // UI sounds
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  transition: '/sounds/transition.mp3'
};

export function useSoundManager() {
  const soundsRef = useRef(new Map());
  const backgroundMusicRef = useRef(null);

  // Initialize sounds
  useEffect(() => {
    // Create sound instances
    Object.entries(SOUNDS).forEach(([key, src]) => {
      try {
        const sound = new Howl({
          src: [src],
          volume: key === 'background' ? 0.3 : 0.6,
          preload: true,
          html5: true // Better for mobile
        });
        soundsRef.current.set(key, sound);
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
      }
    });

    return () => {
      // Cleanup
      soundsRef.current.forEach(sound => sound.unload());
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.unload();
      }
    };
  }, []);

  const playSound = useCallback((soundName, options = {}) => {
    const sound = soundsRef.current.get(soundName);
    if (!sound) return null;

    return sound.play();
  }, []);

  const stopSound = useCallback((soundName) => {
    const sound = soundsRef.current.get(soundName);
    if (sound) {
      sound.stop();
    }
  }, []);

  const playBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play();
    } else {
      const bgMusic = soundsRef.current.get('background');
      if (bgMusic) {
        backgroundMusicRef.current = bgMusic;
        bgMusic.loop(true);
        bgMusic.volume(0.2);
        bgMusic.play();
      }
    }
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
    }
  }, []);

  const setMasterVolume = useCallback((volume) => {
    Howler.volume(volume);
  }, []);

  return {
    playSound,
    stopSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    setMasterVolume
  };
}