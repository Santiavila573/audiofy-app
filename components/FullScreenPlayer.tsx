import React, { useState, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { toggleFavorite, isFavorite } from '../services/storageService';
import SeekBar from './SeekBar';
import LyricsViewer from './LyricsViewer';
import { 
  PlayIcon, PauseIcon, NextIcon, PreviousIcon, ChevronDownIcon, 
  VolumeIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon, SpeedIcon, 
  HeartIcon, SkipBack30Icon, SkipForward30Icon, TimerIcon, 
  BookmarkIcon, ListIcon 
} from './Icons';

const FullScreenPlayer: React.FC = () => {
  const {
    isFullScreen,
    toggleFullScreen,
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
    next,
    prev,
    volume,
    playbackRate,
    setPlaybackRate,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
    showLyrics,
    skip,
    sleepTimer,
    setSleepTimer
   } = usePlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Sync liked status
  useEffect(() => {
    if (currentTrack) {
      setIsLiked(isFavorite(currentTrack.id));
    }
    
    const handleStorageChange = () => {
      if (currentTrack) setIsLiked(isFavorite(currentTrack.id));
    };

    window.addEventListener('storageUpdated', handleStorageChange);
    return () => window.removeEventListener('storageUpdated', handleStorageChange);
  }, [currentTrack]);

  const handleFavoriteClick = () => {
    if (currentTrack) {
      toggleFavorite(currentTrack.id);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showSpeedMenu && !target.closest('.speed-menu-fullscreen')) {
        setShowSpeedMenu(false);
      }
      if (showTimerMenu && !target.closest('.timer-menu-fullscreen')) {
        setShowTimerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedMenu, showTimerMenu]);

  if (!isFullScreen || !currentTrack) {
    return null;
  }

  const timerOptions = [
    { label: 'Off', value: null },
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hora', value: 60 }
  ];

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col text-white animate-slide-up overflow-hidden font-sans">
      {/* Header - Ultra Compact */}
      <div className="flex justify-between items-center px-6 md:px-10 py-3 md:py-4 z-10 border-b border-white/5">
        <button 
          onClick={toggleFullScreen} 
          className="p-1.5 rounded-full hover:bg-white/10 transition-all active:scale-90"
        >
          <ChevronDownIcon size={18} />
        </button>
        
        <div className="flex items-center gap-6 md:gap-8 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
           <button className="text-white/30 hover:text-white transition-colors flex items-center gap-2">
              <ListIcon size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Capítulos</span>
           </button>
           <button className="text-white/30 hover:text-white transition-colors flex items-center gap-2">
              <BookmarkIcon size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Notas</span>
           </button>
        </div>

        <button 
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-all ${isLiked ? 'text-brand-green' : 'text-white/20'}`}
        >
          <HeartIcon size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Main Content Area - Split layout on large screens, scrollable on small */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
          
          {/* Side A: Visuals */}
          <div className="flex flex-col items-center lg:items-end lg:pt-10">
            <div className="w-full max-w-[140px] sm:max-w-[200px] lg:max-w-[260px] aspect-square relative mb-3 lg:mb-4">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full rounded-xl md:rounded-[1.5rem] object-cover shadow-2xl ring-1 ring-white/5"
              />
            </div>
            
            <div className="text-center lg:text-right space-y-1">
               <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-tight max-w-[280px] lg:max-w-[320px]">
                 {currentTrack.title}
               </h3>
               <p className="text-brand-green font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] opacity-50">
                 {currentTrack.author}
               </p>
            </div>
          </div>

          {/* Side B: Compact Lyrics View */}
          <div className="h-[220px] sm:h-[280px] lg:h-[360px] w-full flex flex-col">
            <div className="flex-1 bg-white/[0.01] rounded-2xl md:rounded-[2rem] border border-white/5 overflow-hidden glass relative">
               <LyricsViewer />
               {!showLyrics && !currentTrack.lyrics?.length && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-10">En Reproducción</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls - Compact & Professional */}
      <div className="bg-black/80 backdrop-blur-md pt-4 pb-8 px-6 md:px-12 z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <SeekBar duration={duration} progress={progress} onSeek={seek} className="h-1 opacity-80 hover:opacity-100 transition-opacity" />

          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Speed */}
            <div className="flex-1 flex items-center justify-start">
               <div className="relative speed-menu-fullscreen">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  <SpeedIcon size={18} className="text-white/40" />
                  <span className="text-[9px] font-bold opacity-30">{playbackRate}x</span>
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full left-0 mb-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 shadow-2xl z-[110] glass min-w-[120px]">
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackRate(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-[10px] font-black rounded-lg ${
                          playbackRate === speed ? 'bg-brand-green text-black' : 'text-white/40 hover:bg-white/5'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Playback Navigation (Compact) */}
            <div className="flex-[4] flex items-center justify-center gap-4 sm:gap-8">
              <button onClick={prev} className="text-white/20 hover:text-white transition-all">
                <PreviousIcon size={20} />
              </button>
              
              <button onClick={() => skip(-30)} className="group flex items-center gap-1.5 transition-all">
                <SkipBack30Icon size={22} className="text-white/30 group-hover:text-white" />
                <span className="hidden sm:inline text-[8px] font-black opacity-20">30S</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {isPlaying ? <PauseIcon size={26} fill="currentColor" /> : <PlayIcon size={26} fill="currentColor" className="ml-0.5" />}
              </button>

              <button onClick={() => skip(30)} className="group flex items-center gap-1.5 transition-all">
                <span className="hidden sm:inline text-[8px] font-black opacity-20">30S</span>
                <SkipForward30Icon size={22} className="text-white/30 group-hover:text-white" />
              </button>

              <button onClick={next} className="text-white/20 hover:text-white transition-all">
                <NextIcon size={20} />
              </button>
            </div>

            {/* Right: Timer */}
            <div className="flex-1 flex items-center justify-end">
               <div className="relative timer-menu-fullscreen">
                <button
                  onClick={() => setShowTimerMenu(!showTimerMenu)}
                  className={`flex flex-col items-center p-2 rounded-xl hover:bg-white/5 transition-all ${sleepTimer ? 'text-brand-green' : ''}`}
                >
                  <TimerIcon size={18} className={sleepTimer ? 'text-brand-green' : 'text-white/40'} />
                  <span className="text-[9px] font-bold opacity-30">{sleepTimer ? `${sleepTimer}m` : 'Timer'}</span>
                </button>
                {showTimerMenu && (
                  <div className="absolute bottom-full right-0 mb-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 shadow-2xl z-[110] glass min-w-[120px]">
                    {timerOptions.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setSleepTimer(opt.value);
                          setShowTimerMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-[10px] font-black text-white/40 hover:bg-white/5"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Utility Bar (Super Compact) */}
          <div className="flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
             <button onClick={toggleShuffle} className={`transition-all ${shuffle ? 'text-brand-green' : 'text-white hover:text-brand-green'}`}>
                <ShuffleIcon size={14} />
             </button>
             <div className="flex items-center gap-3 w-24">
                <VolumeIcon size={14} className="text-white/40" />
                <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-white/40" style={{ width: `${volume * 100}%` }}></div>
                </div>
             </div>
             <button onClick={toggleRepeat} className={`transition-all ${repeat !== 'off' ? 'text-brand-green' : 'text-white hover:text-brand-green'}`}>
                {repeat === 'one' ? <RepeatOneIcon size={14} /> : <RepeatIcon size={14} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
