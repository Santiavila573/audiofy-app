import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Player from './Player';
import FullScreenPlayer from './FullScreenPlayer';
import UploadModal from './UploadModal';
import { MenuIcon, CloseIcon } from './Icons';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-brand-black font-sans selection:bg-brand-green selection:text-black">
      {/* Mobile Header */}
      <header className="lg:hidden mobile-header p-5 flex items-center justify-between z-40">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="mobile-header-button text-white focus-visible"
          aria-label="Abrir menú"
        >
          <MenuIcon size={24} />
        </button>
        <Link to="/" className="mobile-header-title text-2xl tracking-tighter">Audiofy</Link>
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 xl:w-72 laptop-sidebar flex-shrink-0 border-r border-white/5">
          <Sidebar onAddClick={() => setIsUploadModalOpen(true)} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 mobile-overlay transition-opacity duration-300"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative h-full w-[280px] sm:w-[320px]">
              <Sidebar
                onAddClick={() => setIsUploadModalOpen(true)}
                onClose={() => setIsMobileSidebarOpen(false)}
                isMobile={true}
              />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-brand-black-soft mobile-padding laptop-padding p-4 md:p-8 lg:p-10 pb-32">
          <div className="animate-fadeIn max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Player />
      <FullScreenPlayer />
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} />}
    </div>
  );
};

export default Layout;
