import React, { useState, useEffect, useCallback } from 'react';
import { AudioContent, ContentType } from '../types';
import { getAllContent } from '../services/storageService';
import AudioCard from '../components/AudioCard';
import { usePlayer } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12 animate-slide-up">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-black text-white tracking-tighter tablet-text">{title}</h2>
      <button className="text-brand-gray-200 hover:text-brand-green text-xs font-black transition-all uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">Ver todo</button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 laptop-grid gap-4 md:gap-6 lg:gap-8">
      {children}
    </div>
  </section>
);

interface HeroProps {
  onPlayFeatured: () => void;
  onMoreInfo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPlayFeatured, onMoreInfo }) => (
  <section className="relative rounded-[2.5rem] p-10 md:p-16 lg:p-20 mb-16 text-white overflow-hidden group shadow-2xl border border-white/5">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-black opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-in-out"></div>
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
    
    <div className="relative z-10 max-w-4xl">
      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10">Contenido Destacado</span>
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl laptop-text-lg font-black mb-6 leading-[1] tracking-tighter animate-fadeIn">
        Tu mundo, <br/><span className="text-brand-black">tus historias.</span>
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/80 font-medium leading-relaxed max-w-2xl opacity-90">
        La plataforma definitiva para audiolibros y podcasts con calidad premium y una interfaz diseñada para el futuro.
      </p>
      <div className="flex flex-wrap gap-5">
        <button
          onClick={onPlayFeatured}
          className="flex-1 sm:flex-none bg-white text-brand-black font-black py-5 px-12 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.2)] text-base md:text-lg flex items-center justify-center gap-3"
        >
          <div className="w-6 h-6 bg-brand-black rounded-full flex items-center justify-center">
             <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
          </div>
          Reproducir Ahora
        </button>
        <button 
          onClick={onMoreInfo}
          className="flex-1 sm:flex-none bg-transparent border-2 border-white/20 text-white font-black py-5 px-12 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-base md:text-lg"
        >
          Mi Biblioteca
        </button>
      </div>
    </div>

    {/* Abstract shapes for visual flair */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] -mb-32"></div>
  </section>
);

const Home: React.FC = () => {
  const [audiobooks, setAudiobooks] = useState<AudioContent[]>([]);
  const [podcasts, setPodcasts] = useState<AudioContent[]>([]);
  const [sciFi, setSciFi] = useState<AudioContent[]>([]);
  const { play } = usePlayer();
  const navigate = useNavigate();

  const fetchContent = useCallback(() => {
    const allContent = getAllContent();
    const books = allContent.filter(item => item.type === ContentType.Audiobook);
    const pods = allContent.filter(item => item.type === ContentType.Podcast);
    setAudiobooks(books);
    setPodcasts(pods);
    setSciFi(books.filter(b => b.genre.includes('Ciencia Ficción')));
  }, []);

  useEffect(() => {
    fetchContent();
    window.addEventListener('storageUpdated', fetchContent);
    return () => {
      window.removeEventListener('storageUpdated', fetchContent);
    };
  }, [fetchContent]);

  const handlePlayFeatured = () => {
    if (audiobooks.length > 0) {
      play(audiobooks[0], audiobooks);
    }
  };

  const handleMoreInfo = () => {
    navigate('/library');
  };

  return (
    <div className="space-y-16">
      <Hero onPlayFeatured={handlePlayFeatured} onMoreInfo={handleMoreInfo} />
      
      <div className="flex items-end justify-between mb-2">
         <div>
            <span className="text-brand-green text-[10px] font-black uppercase tracking-widest">Panel Principal</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Bienvenido de Nuevo</h1>
         </div>
      </div>

      <Section title="Audiolibros Populares">
        {audiobooks.slice(0,6).map(item => (
          <AudioCard key={item.id} item={item} queue={audiobooks.slice(0,6)} />
        ))}
      </Section>

      <Section title="Podcasts en Tendencia">
        {podcasts.slice(0,6).map(item => (
          <AudioCard key={item.id} item={item} queue={podcasts.slice(0,6)} />
        ))}
      </Section>

      <Section title="Selección de Ciencia Ficción">
        {sciFi.slice(0,6).map(item => (
          <AudioCard key={item.id} item={item} queue={sciFi} />
        ))}
      </Section>
    </div>
  );
};

export default Home;