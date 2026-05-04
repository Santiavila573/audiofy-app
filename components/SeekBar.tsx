import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SeekBarProps {
  duration: number;
  progress: number;
  onSeek: (time: number) => void;
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const flooredSeconds = Math.floor(seconds);
  const min = Math.floor(flooredSeconds / 60);
  const sec = flooredSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const SeekBar: React.FC<SeekBarProps> = ({ duration, progress, onSeek, className }) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !duration) return;

    const bar = progressBarRef.current;
    const { left, width } = bar.getBoundingClientRect();
    
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const newProgress = Math.min(1, Math.max(0, (clientX - left) / width));
    const seekTime = newProgress * duration;
    onSeek(seekTime);
  }, [duration, onSeek]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita la selección de texto al arrastrar
    setIsSeeking(true);
    handleSeek(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSeeking(true);
    handleSeek(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleSeek(e);
    const handleMouseUp = () => setIsSeeking(false);
    
    const handleTouchMove = (e: TouchEvent) => handleSeek(e);
    const handleTouchEnd = () => setIsSeeking(false);

    if (isSeeking) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSeeking, handleSeek]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-[10px] font-medium text-brand-gray-200 w-10 text-right tabular-nums">{formatTime(progress)}</span>
      <div
        ref={progressBarRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="group relative w-full h-1.5 cursor-pointer flex items-center slider-container"
      >
        <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-green transition-all duration-100 ease-out shadow-[0_0_10px_rgba(30,215,96,0.3)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div
          className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-white/20 transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 pointer-events-none`}
          style={{
            left: `${progressPercentage}%`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <span className="text-[10px] font-medium text-brand-gray-200 w-10 tabular-nums">{formatTime(duration)}</span>
    </div>
  );
};

export default SeekBar;