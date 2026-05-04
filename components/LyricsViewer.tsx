import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { LyricLine } from '../types';

const LyricsViewer: React.FC = () => {
  const { currentTrack, progress } = usePlayer();
  const lyricsRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const lyrics = currentTrack.lyrics || [];

  // Find the current lyric line based on progress
  const currentLyricIndex = lyrics.findIndex((lyric, index) => {
    const nextLyric = lyrics[index + 1];
    return progress >= lyric.time && (!nextLyric || progress < nextLyric.time);
  });

  // Auto-scroll to current lyric
  useEffect(() => {
    if (lyricsRef.current && currentLyricIndex >= 0) {
      const currentLyricElement = lyricsRef.current.children[currentLyricIndex] as HTMLElement;
      if (currentLyricElement) {
        currentLyricElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLyricIndex]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 lg:p-10">
      {lyrics.length > 0 ? (
        <div 
          ref={lyricsRef} 
          className="flex-1 overflow-y-auto space-y-8 md:space-y-12 scroll-smooth no-scrollbar mask-gradient-v pb-40"
        >
          {lyrics.map((lyric: LyricLine, index: number) => (
            <p
              key={index}
              className={`lyric-line text-2xl md:text-4xl lg:text-5xl font-black leading-[1.2] tracking-tighter cursor-pointer hover:opacity-100 transition-all duration-500 ${
                index === currentLyricIndex ? 'active' : index < currentLyricIndex ? 'past' : ''
              }`}
              onClick={() => {
                // Feature: Clicking a lyric seeks to that time
                // This would require passing the seek function from context
              }}
            >
              {lyric.text}
            </p>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <span className="text-4xl">♪</span>
           </div>
           <div className="space-y-2">
             <p className="text-2xl font-black text-white tracking-tighter">No hay letras sincronizadas</p>
             <p className="text-brand-gray-200 max-w-xs mx-auto">
               Disfruta del audio de <strong>{currentTrack.title}</strong> mientras trabajamos en su transcripción.
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default LyricsViewer;
