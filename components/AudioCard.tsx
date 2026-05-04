
import React from 'react';
import { AudioContent } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { PlayIcon, PauseIcon, HeartIcon } from './Icons';
import { isFavorite, toggleFavorite } from '../services/storageService';

interface AudioCardProps {
  item: AudioContent;
  queue: AudioContent[];
}

const AudioCard: React.FC<AudioCardProps> = ({ item, queue }) => {
  const { play, currentTrack, isPlaying, pause } = usePlayer();
  const isCurrentlyPlaying = currentTrack?.id === item.id && isPlaying;
  const [favorite, setFavorite] = React.useState(isFavorite(item.id));

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCurrentlyPlaying) {
      pause();
    } else {
      play(item, queue);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(item.id);
    setFavorite(!favorite);
  };

  return (
    <div className="audio-card bg-white/5 hover:bg-white/10 p-5 rounded-2xl cursor-pointer relative group transition-all duration-500 border border-white/5 hover:border-white/10 focus-visible">
      <div className="relative mb-5 overflow-hidden rounded-xl shadow-2xl">
        <img
          src={item.coverArt}
          alt={item.title}
          className="w-full h-auto aspect-square object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl ${favorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
        >
          <HeartIcon size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={handlePlayClick}
          className="absolute bottom-4 right-4 bg-brand-green text-black rounded-full p-4 shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 focus-visible"
        >
          {isCurrentlyPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </button>

        {isCurrentlyPlaying && (
          <div className="absolute top-4 left-4 flex gap-1 items-end h-4">
            <div className="w-1 bg-brand-green animate-[bounce_1s_infinite_0s]" style={{height: '60%'}}></div>
            <div className="w-1 bg-brand-green animate-[bounce_1s_infinite_0.2s]" style={{height: '100%'}}></div>
            <div className="w-1 bg-brand-green animate-[bounce_1s_infinite_0.4s]" style={{height: '80%'}}></div>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-white truncate group-hover:text-brand-green transition-colors duration-300 tracking-tight">{item.title}</h3>
        <p className="text-sm font-medium text-brand-gray-200 truncate group-hover:text-white transition-colors duration-300">{item.author}</p>
      </div>
    </div>
  );
};

export default AudioCard;