import React, { useState, useCallback, useEffect } from 'react';
import { View } from './types';
import Header from './components/Header';
import HomeView from './views/HomeView';
import ScanView from './views/ScanView';
import HistoryView from './views/HistoryView';
import KnowledgeHubView from './views/KnowledgeHubView';
import CommunityView from './views/CommunityView';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [navigationState, setNavigationState] = useState<any>(null);

  const navigate = useCallback((view: View, state?: any) => {
    setCurrentView(view);
    setNavigationState(state);
  }, []);

  const renderView = useCallback(() => {
    const clearNavigationState = () => setNavigationState(null);

    switch (currentView) {
      case View.DASHBOARD:
        return <HomeView setView={navigate} />;
      case View.SCAN:
        return <ScanView setView={navigate} />;
      case View.HISTORY:
        return <HistoryView setView={navigate} />;
      case View.KNOWLEDGE_HUB:
        return <KnowledgeHubView />;
      case View.COMMUNITY:
        return <CommunityView navigationState={navigationState} clearNavigationState={clearNavigationState} />;
      default:
        return <HomeView setView={navigate} />;
    }
  }, [currentView, navigationState, navigate]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-gray-200" style={{ backgroundImage: "url('https://picsum.photos/seed/futurefarm/1920/1080')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 font-sans">
        <Header currentView={currentView} setView={navigate} />
        <main className="pt-24 pb-20 px-4 md:px-8">
            {renderView()}
        </main>
        <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
        <footer 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-green-300/80 font-sans z-50 tracking-wider"
          style={{ textShadow: '0 0 8px rgba(72, 187, 120, 0.7)' }}
        >
          Built by ANANT with <span className="text-green-400 animate-pulse">♥</span>™
        </footer>
      </div>
    </div>
  );
};

export default App;