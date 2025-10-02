
import React, { useState, useCallback } from 'react';
import { View } from './types';
import Header from './components/Header';
import HomeView from './views/HomeView';
import ScanView from './views/ScanView';
import HistoryView from './views/HistoryView';
import KnowledgeHubView from './views/KnowledgeHubView';
import CommunityView from './views/CommunityView';
import Chatbot from './components/Chatbot';
import { apiKeyMissingError } from './services/geminiService';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [navigationState, setNavigationState] = useState<any>(null);
  const [showApiBanner, setShowApiBanner] = useState(apiKeyMissingError);


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
        return <KnowledgeHubView navigationState={navigationState} clearNavigationState={clearNavigationState} />;
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
        
        {showApiBanner && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl z-40 p-4 animate-subtle-float">
            <div className="bg-red-900/50 backdrop-blur-md border border-red-500/50 rounded-xl p-4 flex items-start space-x-4">
              <Icon name="warning" className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-300">Configuration Required</h3>
                {/* Fix: Updated environment variable name to API_KEY for consistency. */}
                <p className="text-sm text-gray-300">
                  AI features are disabled. The <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded text-xs">API_KEY</code> environment variable is not set. Please refer to your deployment instructions to enable AI functionality.
                </p>
              </div>
              <button onClick={() => setShowApiBanner(false)} className="text-red-300 hover:text-white text-2xl font-bold p-1">&times;</button>
            </div>
          </div>
        )}

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