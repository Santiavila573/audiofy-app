import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Playlist } from '../types';
import { getAllPlaylists } from '../services/storageService';

const Library: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const fetchPlaylists = useCallback(() => {
    setPlaylists(getAllPlaylists());
  }, []);

  useEffect(() => {
    fetchPlaylists();
    window.addEventListener('storageUpdated', fetchPlaylists);
    return () => {
      window.removeEventListener('storageUpdated', fetchPlaylists);
    };
  }, [fetchPlaylists]);

  return (
    <div className="animate-fadeIn">
      <div className="flex items-end justify-between border-b border-white/5 pb-6 mb-10">
        <h1 className="text-5xl font-black text-white tracking-tighter">Tu Biblioteca</h1>
        <span className="text-brand-gray-200 font-medium">{playlists.length} Listas</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8">
        {playlists.map(playlist => (
          <Link 
            to={`/playlist/${playlist.id}`} 
            key={playlist.id} 
            className="bg-white/5 p-5 rounded-2xl hover:bg-white/10 transition-all duration-500 group border border-white/5 hover:border-white/10 shadow-xl"
          >
            <div className="relative mb-5 overflow-hidden rounded-xl shadow-2xl">
              <img 
                src={playlist.coverArt} 
                alt={playlist.name} 
                className="w-full h-auto aspect-square object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white truncate group-hover:text-brand-green transition-colors duration-300 tracking-tight">{playlist.name}</h3>
              <p className="text-sm font-medium text-brand-gray-200 truncate group-hover:text-white transition-colors duration-300">{playlist.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Library;