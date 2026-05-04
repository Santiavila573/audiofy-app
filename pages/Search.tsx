import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AudioContent } from '../types';
import { getAllContent } from '../services/storageService';
import AudioCard from '../components/AudioCard';
import { SearchIcon } from '../components/Icons';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allContent, setAllContent] = useState<AudioContent[]>([]);

  const fetchContent = useCallback(() => {
    setAllContent(getAllContent());
  }, []);

  useEffect(() => {
    fetchContent();
    window.addEventListener('storageUpdated', fetchContent);
    return () => {
      window.removeEventListener('storageUpdated', fetchContent);
    };
  }, [fetchContent]);

  const filteredContent = useMemo(() => {
    if (!searchTerm) {
      return allContent;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allContent.filter(
      item =>
        item.title.toLowerCase().includes(lowercasedTerm) ||
        item.author.toLowerCase().includes(lowercasedTerm) ||
        (item.narrator && item.narrator.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, allContent]);

  return (
    <div className="animate-fadeIn">
      <div className="relative mb-8 md:mb-12 group max-w-2xl">
        <input
          type="text"
          placeholder="¿Qué quieres escuchar hoy?"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 hover:bg-white/10 text-white placeholder-brand-gray-200 rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all duration-300 border border-white/5 glass text-base md:text-lg font-medium"
        />
        <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-brand-green">
          <SearchIcon size={20} className="md:w-6 md:h-6 text-brand-gray-200" />
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">
            {searchTerm ? 'Resultados' : 'Explorar Todo'}
          </h2>
          {searchTerm && (
            <span className="text-brand-gray-200 text-xs md:text-sm font-medium mb-1">{filteredContent.length} encontrados</span>
          )}
        </div>

        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 laptop-grid gap-4 md:gap-8 animate-fadeIn">
            {filteredContent.map(item => (
              <AudioCard key={item.id} item={item} queue={filteredContent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 bg-white/5 rounded-full">
               <SearchIcon size={48} className="text-brand-gray-300 opacity-20" />
            </div>
            <p className="text-brand-gray-200 text-xl font-medium">
              {searchTerm ? `Vaya, no encontramos nada para "${searchTerm}"` : 'Parece que la biblioteca está vacía.'}
            </p>
            <p className="text-brand-gray-300 max-w-sm">
              Intenta buscar con otros términos o explora por categorías en la página de inicio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;