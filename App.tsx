import React, { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import PlaylistDetail from './pages/PlaylistDetail';
import { PlayerProvider } from './contexts/PlayerContext';
import { initializeMockData, initializeLocalAudios } from './services/storageService';
import { initDB } from './services/dbService';

function App() {
  useEffect(() => {
    const initApp = async () => {
      await initDB(); // Asegura que la BD esté lista al iniciar
      await initializeMockData();
      await initializeLocalAudios();
    };
    initApp();
  }, []);

  return (
    <PlayerProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
          </Routes>
        </Layout>
      </HashRouter>
    </PlayerProvider>
  );
}

export default App;