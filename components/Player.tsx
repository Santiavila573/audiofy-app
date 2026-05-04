import React, { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import SeekBar from './SeekBar';
import { toggleFavorite, isFavorite } from '../services/storageService';
import { PlayIcon, PauseIcon, NextIcon, PreviousIcon, FullScreenEnterIcon, VolumeIcon, VolumeMuteIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon, SpeedIcon, LyricsIcon, HeartIcon } from './Icons';

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
    next,
    prev,
    toggleFullScreen,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
    showLyrics,
    toggleLyrics
  } = usePlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Update liked status when currentTrack changes or storage updates
  React.useEffect(() => {
    if (currentTrack) {
      setIsLiked(isFavorite(currentTrack.id));
    }
    
    const handleStorageChange = () => {
      if (currentTrack) setIsLiked(isFavorite(currentTrack.id));
    };

    window.addEventListener('storageUpdated', handleStorageChange);
    return () => window.removeEventListener('storageUpdated', handleStorageChange);
  }, [currentTrack]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack) {
      toggleFavorite(currentTrack.id);
    }
  };

  // Close speed menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedMenu && !(event.target as Element).closest('.speed-menu')) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedMenu]);

  if (!currentTrack) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black/90 backdrop-blur-2xl border-t border-white/5 text-white px-4 py-3 lg:px-8 mobile-stack flex flex-col md:grid md:grid-cols-3 md:items-center md:gap-8 transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Track Info */}
      <div className="flex items-center gap-4 min-w-0">
        <div 
          onClick={toggleFullScreen}
          className="relative flex-shrink-0 group cursor-pointer"
        >
          <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-12 h-12 md:w-16 md:h-16 rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
             <FullScreenEnterIcon size={20} className="text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 
            onClick={toggleFullScreen}
            className="font-black text-sm md:text-base truncate tracking-tight hover:text-brand-green cursor-pointer transition-colors"
          >
            {currentTrack.title}
          </h3>
          <p className="text-[10px] md:text-xs font-bold text-brand-gray-200 truncate uppercase tracking-widest opacity-60">{currentTrack.author}</p>
        </div>
        <button 
          onClick={handleFavoriteClick}
          className={`transition-all duration-300 hover:scale-125 active:scale-75 ${isLiked ? 'text-brand-green' : 'text-brand-gray-100 hover:text-white'}`}
          aria-label={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
           <HeartIcon size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Player Controls & Seek Bar */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-4 md:gap-6 mb-2">
          <button onClick={toggleShuffle} className={`hidden sm:block text-brand-gray-200 hover:text-white transition-all duration-300 hover:scale-110 focus-visible ${shuffle ? 'text-brand-green' : 'opacity-40'}`}>
            <ShuffleIcon size={18} />
          </button>
          <button onClick={prev} className="text-brand-gray-100 hover:text-white transition-all duration-300 hover:scale-110 focus-visible">
            <PreviousIcon size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="bg-white text-black rounded-full p-3.5 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-white/5 flex items-center justify-center focus-visible"
          >
            {isPlaying ? <PauseIcon size={24} fill="currentColor" /> : <PlayIcon size={24} fill="currentColor" />}
          </button>
          <button onClick={next} className="text-brand-gray-100 hover:text-white transition-all duration-300 hover:scale-110 focus-visible">
            <NextIcon size={20} />
          </button>
          <button onClick={toggleRepeat} className={`hidden sm:block text-brand-gray-200 hover:text-white transition-all duration-300 hover:scale-110 focus-visible ${repeat !== 'off' ? 'text-brand-green' : 'opacity-40'}`}>
            {repeat === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
          </button>
        </div>
        <SeekBar duration={duration} progress={progress} onSeek={seek} className="w-full" />
      </div>

      {/* Extra Controls */}
      <div className="hidden md:flex items-center justify-end gap-3 lg:gap-5">
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-full hover:bg-white/5 transition-all duration-300 ${showLyrics ? 'text-brand-green bg-brand-green/5' : 'text-brand-gray-200 hover:text-white'}`}
          title={showLyrics ? 'Ocultar letras' : 'Mostrar letras'}
        >
          <LyricsIcon size={20} />
        </button>

        {/* Volume Control - Hidden on mobile, shown on tablet/desktop */}
        <div className="hidden lg:flex items-center gap-3 group">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)} className="text-brand-gray-200 hover:text-white transition-colors">
            {volume === 0 ? <VolumeMuteIcon size={20} /> : <VolumeIcon size={20} />}
          </button>
          <div className="w-24 h-1.5 bg-white/10 rounded-full relative overflow-hidden group-hover:h-2 transition-all">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-brand-green transition-all duration-100" 
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Speed Control */}
        <div className="relative speed-menu">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-gray-200 hover:text-white transition-all flex items-center gap-2 border border-white/5"
          >
            <SpeedIcon size={14} />
            <span className="text-[10px] font-black">{playbackRate}x</span>
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-4 bg-brand-black-soft border border-white/10 rounded-2xl p-2 shadow-2xl z-[60] animate-slideUp min-w-[120px] glass">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackRate(speed);
                    setShowSpeedMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    playbackRate === speed ? 'bg-brand-green text-black' : 'text-brand-gray-100 hover:bg-white/5'
                  }`}
                >
                  {speed}x Velocidad
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggleFullScreen} className="p-2 rounded-full hover:bg-white/5 text-brand-gray-200 hover:text-white transition-all duration-300">
          <FullScreenEnterIcon size={20} />
        </button>
      </div>
    </footer>
  );
};

export default Player;
