import React, { useState, useEffect, useCallback } from 'react';
import { AudioContent } from '../types';
import { getAllContent, getFavorites } from '../services/storageService';
import AudioCard from '../components/AudioCard';
import { HeartIcon } from '../components/Icons';

const Favorites: React.FC = () => {
  const [favoriteItems, setFavoriteItems] = useState<AudioContent[]>([]);

  const fetchFavorites = useCallback(() => {
    const allContent = getAllContent();
    const favoritesIds = getFavorites();
    const filtered = allContent.filter(item => favoritesIds.includes(item.id));
    setFavoriteItems(filtered);
  }, []);

  useEffect(() => {
    fetchFavorites();
    window.addEventListener('storageUpdated', fetchFavorites);
    return () => {
      window.removeEventListener('storageUpdated', fetchFavorites);
    };
  }, [fetchFavorites]);

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12 p-8 md:p-12 bg-gradient-to-br from-red-500/20 via-brand-black-soft to-brand-black-soft rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-red-500 to-red-900 flex items-center justify-center">
           <HeartIcon size={100} fill="white" />
        </div>
        <div className="text-center md:text-left space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">Colección Privada</span>
          <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none">Mis Favoritos</h1>
          <p className="text-brand-gray-200 text-lg font-medium max-w-xl">Todo el contenido que te ha encantado, en un solo lugar.</p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold text-brand-gray-300">
             <span>{favoriteItems.length} pistas guardadas</span>
          </div>
        </div>
      </div>
      
      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8 animate-fadeIn">
          {favoriteItems.map(item => (
            <AudioCard key={item.id} item={item} queue={favoriteItems} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-40">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <HeartIcon size={40} className="text-white" />
           </div>
           <div className="space-y-2">
             <p className="text-2xl font-black text-white tracking-tighter">Tu lista está vacía</p>
             <p className="text-brand-gray-200 max-w-xs mx-auto">
               Dale a me gusta a tus audiolibros favoritos para que aparezcan aquí.
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
