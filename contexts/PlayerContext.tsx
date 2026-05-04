import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AudioContent } from '../types';
import { getAudio } from '../services/dbService';
import { getListeningProgress, saveListeningProgress, getPlayerSettings, savePlayerSettings, PlayerSettings } from '../services/storageService';

interface PlayerContextType {
  currentTrack: AudioContent | null;
  queue: AudioContent[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  isFullScreen: boolean;
  isAudioLoading: boolean;
  // Configuraciones
  volume: number;
  playbackRate: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  quality: 'low' | 'medium' | 'high';
  // Sleep Timer
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  // Funciones
  play: (track: AudioContent, queue?: AudioContent[]) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  next: () => void;
  prev: () => void;
  toggleFullScreen: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  // Lyrics
  showLyrics: boolean;
  toggleLyrics: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioContent | null>(null);
  const [queue, setQueue] = useState<AudioContent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // Configuraciones del reproductor
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const isPlayingRef = useRef(isPlaying);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sleep Timer logic
  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    setSleepTimerState(minutes);

    if (minutes !== null) {
      sleepTimerRef.current = setTimeout(() => {
        pause();
        setSleepTimerState(null);
        sleepTimerRef.current = null;
      }, minutes * 60 * 1000);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Cargar configuraciones al iniciar
  useEffect(() => {
    const settings = getPlayerSettings();
    setVolumeState(settings.volume);
    setPlaybackRateState(settings.playbackRate);
    setShuffle(settings.shuffle);
    setRepeat(settings.repeat);
    setQuality(settings.quality);
  }, []);

  // Aplicar configuraciones al audio
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
  }, [volume, playbackRate]);

  // Effect to handle event listeners for the audio element
  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => next();
    const handleCanPlay = () => {
      setIsAudioLoading(false);
      if (isPlayingRef.current) {
        audio.play().catch(e => console.error("Error de reproducción post-carga:", e));
      }
    };
    const handleWaiting = () => setIsAudioLoading(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', () => setIsAudioLoading(false));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', () => setIsAudioLoading(false));
    };
  }, []);

  const saveProgress = useCallback(() => {
    if (currentTrack && progress > 1) {
      saveListeningProgress(currentTrack.id, progress);
    }
  }, [currentTrack, progress]);

  // Effect for auto-saving progress
  useEffect(() => {
    const interval = setInterval(() => {
        if(isPlaying) saveProgress();
    }, 5000);

    window.addEventListener('beforeunload', saveProgress);

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', saveProgress);
        saveProgress();
    };
  }, [saveProgress, isPlaying]);

  const play = useCallback((track: AudioContent, newQueue: AudioContent[] = []) => {
    saveProgress();

    if (currentTrack?.id !== track.id) {
        setIsAudioLoading(true);
        setCurrentTrack(track);
        setQueue(newQueue.length > 0 ? newQueue : [track]);
        setProgress(0);
        setDuration(0);

        // This logic will be handled by the useEffect [currentTrack]
    }

    setIsPlaying(true);
  }, [currentTrack, saveProgress]);

  // Effect to manage the audio source based on currentTrack
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack) {
        audio.src = '';
        return;
    }

    const setupAudioSource = async () => {
        setIsAudioLoading(true);
        if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
        }

        try {
            let audioSrc = '';
            const audioFile = await getAudio(currentTrack.id);

            if (audioFile) {
                audioSrc = URL.createObjectURL(audioFile);
            } else if (currentTrack.audioUrl) {
                audioSrc = currentTrack.audioUrl;
            } else {
                console.warn(`No se encontró fuente de audio para '${currentTrack.title}'.`);
                setIsAudioLoading(false);
                return;
            }

            const savedProgress = getListeningProgress()[currentTrack.id]?.progress || 0;

            audio.src = audioSrc;
            audio.currentTime = savedProgress;
            setProgress(savedProgress);
            // No need to call .play() here, the 'canplay' event listener will handle it.

        } catch (error) {
            console.error("Error al configurar la fuente de audio:", error);
            setIsAudioLoading(false);
        }
    };

    setupAudioSource();

  }, [currentTrack]);

  // This effect now only manages pausing. Playback is handled by the `canplay` event.
  useEffect(() => {
    console.log("Player State Change - isPlaying:", isPlaying, "isAudioLoading:", isAudioLoading);
    if (!isPlaying) {
      audioRef.current.pause();
    } else if (!isAudioLoading) {
      console.log("Attempting to play audio...");
      audioRef.current.play().catch(e => {
        console.error("Error al reanudar la reproducción:", e);
        // If it failed because of loading, it will try again via handleCanPlay
      });
    }
  }, [isPlaying, isAudioLoading]);


  const pause = useCallback(() => {
    setIsPlaying(false);
    saveProgress();
  }, [saveProgress]);

  const togglePlay = useCallback(() => {
    console.log("togglePlay called. Current state:", isPlaying, "Track:", currentTrack?.title);
    if (!currentTrack) return;
    setIsPlaying(prev => !prev);
  }, [currentTrack, isPlaying]);

  const seek = (time: number) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const findCurrentIndex = useCallback(() => queue.findIndex(item => item.id === currentTrack?.id), [queue, currentTrack]);

  const next = useCallback(() => {
    const currentIndex = findCurrentIndex();
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      play(queue[currentIndex + 1], queue);
    } else {
      setIsPlaying(false); // Stop playing at the end of the queue
    }
  }, [findCurrentIndex, queue, play]);

  const prev = useCallback(() => {
    const currentIndex = findCurrentIndex();
    if (currentIndex > 0) {
      play(queue[currentIndex - 1], queue);
    }
  }, [findCurrentIndex, queue, play]);

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    savePlayerSettings({ volume: clampedVolume });
  };

  const setPlaybackRate = (rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    setPlaybackRateState(clampedRate);
    savePlayerSettings({ playbackRate: clampedRate });
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    savePlayerSettings({ shuffle: newShuffle });
  };

  const toggleRepeat = () => {
    const newRepeat = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    setRepeat(newRepeat);
    savePlayerSettings({ repeat: newRepeat });
  };

  const setQualityValue = (newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    savePlayerSettings({ quality: newQuality });
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const toggleLyrics = () => setShowLyrics(!showLyrics);

  const value = React.useMemo(() => ({
    currentTrack,
    queue,
    isPlaying,
    progress,
    duration,
    isFullScreen,
    isAudioLoading,
    // Configuraciones
    volume,
    playbackRate,
    shuffle,
    repeat,
    quality,
    // Sleep Timer
    sleepTimer,
    setSleepTimer,
    // Funciones
    play,
    pause,
    togglePlay,
    seek,
    skip,
    next,
    prev,
    toggleFullScreen,
    setVolume,
    setPlaybackRate,
    toggleShuffle,
    toggleRepeat,
    setQuality: setQualityValue,
    // Lyrics
    showLyrics,
    toggleLyrics,
  }), [
    currentTrack, queue, isPlaying, progress, duration, isFullScreen, 
    isAudioLoading, volume, playbackRate, shuffle, repeat, quality,
    sleepTimer, setSleepTimer, play, pause, togglePlay, seek, skip,
    next, prev, toggleFullScreen, setVolume, setPlaybackRate,
    toggleShuffle, toggleRepeat, setQualityValue, showLyrics, toggleLyrics
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
