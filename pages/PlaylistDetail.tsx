
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Playlist, AudioContent } from '../types';
import { getPlaylistById, getAllContent } from '../services/storageService';
import { PlayIcon, PauseIcon, ArrowLeftIcon } from '../components/Icons';
import { usePlayer } from '../contexts/PlayerContext';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<AudioContent[]>([]);
  const { play, pause, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    if (id) {
      const foundPlaylist = getPlaylistById(id);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        const allContent = getAllContent();
        const playlistItems = allContent.filter(item => foundPlaylist.items.includes(item.id));
        setItems(playlistItems);
      }
    }
  }, [id]);

  if (!playlist) {
    return <div className="text-center p-10">Lista de reproducción no encontrada.</div>;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-gray-200 hover:text-white transition-all duration-300 group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeftIcon size={20} />
          </div>
          <span className="font-bold text-sm">Volver</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8 md:mb-12 p-6 md:p-12 bg-gradient-to-br from-brand-green/20 via-brand-black-soft to-brand-black-soft rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-2xl">
        <img src={playlist.coverArt} alt={playlist.name} className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover" />
        <div className="text-center md:text-left space-y-3 md:space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest border border-brand-green/20">Lista de reproducción</span>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl laptop-text-lg font-black text-white tracking-tighter leading-none">{playlist.name}</h1>
          <p className="text-brand-gray-200 text-sm md:text-lg font-medium max-w-xl opacity-80">{playlist.description}</p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs md:text-sm font-bold text-brand-gray-300">
             <span>Audiofy</span>
             <span className="w-1 h-1 bg-white/20 rounded-full"></span>
             <span>{items.length} pistas</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 md:space-y-2 px-0 md:px-2">
        <div className="grid grid-cols-[30px_1fr_auto] md:grid-cols-[40px_1fr_auto] items-center gap-4 md:gap-6 px-4 md:px-6 py-3 border-b border-white/5 text-[10px] md:text-xs font-black text-brand-gray-300 uppercase tracking-widest">
          <div className="text-center">#</div>
          <div>Título</div>
          <div className="pr-2 md:pr-4 text-right">Duración</div>
        </div>

        {items.map((item, index) => {
          const isCurrentlyPlaying = currentTrack?.id === item.id && isPlaying;
          return (
            <div 
              key={item.id} 
              className={`grid grid-cols-[30px_1fr_auto] md:grid-cols-[40px_1fr_auto] items-center gap-4 md:gap-6 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 group hover:bg-white/5 ${currentTrack?.id === item.id ? 'bg-white/5' : ''}`}
            >
              <div className="text-center">
                <span className={`text-xs md:text-sm font-bold tabular-nums transition-colors duration-300 ${currentTrack?.id === item.id ? 'text-brand-green' : 'text-brand-gray-300 group-hover:hidden'}`}>
                  {index + 1}
                </span>
                <button 
                  onClick={() => isCurrentlyPlaying ? pause() : play(item, items)}
                  className={`hidden group-hover:inline-block transition-transform active:scale-90 ${currentTrack?.id === item.id ? 'text-brand-green' : 'text-white'}`}
                >
                  {isCurrentlyPlaying ? <PauseIcon size={16} fill="currentColor" /> : <PlayIcon size={16} fill="currentColor" />}
                </button>
              </div>
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <img src={item.coverArt} alt={item.title} className="w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-lg flex-shrink-0" />
                <div className="truncate">
                  <p className={`font-black text-sm md:text-lg tracking-tight truncate ${currentTrack?.id === item.id ? 'text-brand-green' : 'text-white'}`}>{item.title}</p>
                  <p className="text-[10px] md:text-sm font-medium text-brand-gray-200 truncate opacity-60">{item.author}</p>
                </div>
              </div>
              <div className="text-right text-xs md:text-sm font-medium text-brand-gray-200 tabular-nums pr-2 md:pr-4">
                {formatDuration(item.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistDetail;