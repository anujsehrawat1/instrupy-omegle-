import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import LegalView from './components/LegalView';

export default function App() {
  const [view, setView] = useState<AppView>('HOME');
  const [interests, setInterests] = useState<string[]>([]);

  // Ensure dark mode class is completely removed so standard light background is active
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleStartChat = (mode: AppView) => {
    setView(mode);
  };

  const handleBackToHome = () => {
    setView('HOME');
  };

  const isLegalView = view === 'TERMS' || view === 'PRIVACY' || view === 'GUIDELINES';
  const isScrollable = view === 'HOME' || isLegalView;

  return (
    <div className={`bg-white text-slate-900 flex flex-col selection:bg-blue-500/20 selection:text-blue-900 ${isScrollable ? 'min-h-[100dvh]' : 'h-[100dvh] overflow-hidden'}`}>
      
      {/* Main content wrapper */}
      <main className={isScrollable ? "flex-1 w-full max-w-6xl mx-auto px-4 py-6 flex flex-col justify-center relative" : "flex-1 w-full flex flex-col relative min-h-0"}>
        {view === 'HOME' ? (
          <HomeView
            interests={interests}
            setInterests={setInterests}
            onStartChat={handleStartChat}
          />
        ) : isLegalView ? (
          <LegalView
            view={view as 'TERMS' | 'PRIVACY' | 'GUIDELINES'}
            onBack={handleBackToHome}
          />
        ) : (
          <ChatView
            mode={view}
            interests={interests}
            onBackToHome={handleBackToHome}
          />
        )}
      </main>

      {/* Retro Simple Footer */}
      {(view === 'HOME' || isLegalView) && (
        <footer className="py-4 border-t border-slate-300 text-center text-xs text-slate-500 font-sans">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 instrupy. All rights reserved. Talk to strangers.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setView('TERMS')}
                className="hover:underline cursor-pointer hover:text-[#1a0dab] font-semibold text-slate-500"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setView('PRIVACY')}
                className="hover:underline cursor-pointer hover:text-[#1a0dab] font-semibold text-slate-500"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setView('GUIDELINES')}
                className="hover:underline cursor-pointer hover:text-[#1a0dab] font-semibold text-slate-500"
              >
                Community Guidelines
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
