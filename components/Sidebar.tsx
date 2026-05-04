import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Playlist } from '../types';
import { getAllPlaylists } from '../services/storageService';
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon, CloseIcon, HeartIcon } from './Icons';

interface SidebarProps {
  onAddClick: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddClick, onClose, isMobile = false }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchPlaylists = () => setPlaylists(getAllPlaylists());
    fetchPlaylists();

    window.addEventListener('storageUpdated', fetchPlaylists);
    return () => {
      window.removeEventListener('storageUpdated', fetchPlaylists);
    };
  }, []);

  const navItemClasses = "flex items-center gap-4 px-6 py-2 text-brand-gray-100 font-bold hover:text-white transition-colors duration-200";
  const activeNavItemClasses = "text-white";

  return (
    <aside className={`bg-brand-black text-white flex-shrink-0 flex flex-col gap-2 p-3 ${isMobile ? 'w-full h-full sidebar-enter' : 'w-72'}`}>
      {isMobile && (
        <div className="flex justify-between items-center px-4 py-3 mb-2">
          <Link 
            to="/" 
            onClick={onClose}
            className="text-2xl font-black text-brand-green tracking-tighter"
          >
            Audiofy
          </Link>
          <button
            onClick={onClose}
            className="text-brand-gray-100 hover:text-white transition-colors focus-visible p-2 rounded-full hover:bg-white/5"
            aria-label="Cerrar menú"
          >
            <CloseIcon size={24} />
          </button>
        </div>
      )}
      <nav className="bg-brand-gray-500/30 rounded-xl overflow-hidden glass">
        <NavLink to="/" className={({ isActive }) => `${navItemClasses} ${isActive ? 'bg-white/5 text-white' : ''}`}>
          <HomeIcon size={22} /> <span className="mt-1">Descubrir</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `${navItemClasses} ${isActive ? 'bg-white/5 text-white' : ''}`}>
          <SearchIcon size={22} /> <span className="mt-1">Buscar</span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `${navItemClasses} ${isActive ? 'bg-white/5 text-white' : ''}`}>
          <HeartIcon size={22} /> <span className="mt-1">Favoritos</span>
        </NavLink>
      </nav>
      <div className="bg-brand-gray-500/30 rounded-xl flex-1 flex flex-col glass overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 text-brand-gray-100 font-bold border-b border-white/5">
          <NavLink to="/library" className="flex items-center gap-4 hover:text-white transition-all duration-300 hover:scale-105">
            <LibraryIcon size={22} /> Tu Biblioteca
          </NavLink>
          <button
            onClick={onAddClick}
            className="text-brand-gray-100 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-300 focus-visible"
            aria-label="Añadir contenido"
            >
            <PlusIcon size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {playlists.map(playlist => (
            <NavLink
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className={({ isActive }) => `block px-4 py-2.5 text-sm rounded-lg transition-all duration-300 focus-visible ${isActive ? 'bg-white/10 text-white shadow-lg' : 'text-brand-gray-200 hover:text-white hover:bg-white/5'}`}
            >
              {playlist.name}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;