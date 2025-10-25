
import React, { useState, useCallback } from 'react';
import { View } from './types';
import Header from './components/Header';
import HomeView from './views/HomeView';
import ScanView from './views/ScanView';
import HistoryView from './views/HistoryView';
import KnowledgeHubView from './views/KnowledgeHubView';
import CommunityView from './views/CommunityView';
import VoiceAssistant from './components/VoiceAssistant';
import Chatbot from './components/Chatbot';
import Icon from './components/Icon';
import { useLocalization } from './contexts/LocalizationContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [navigationState, setNavigationState] = useState<any>(null);
  const { t } = useLocalization();


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
    <div className="min-h-screen bg-cover bg-center bg-fixed text-gray-200" style={{ backgroundImage: "url('data:image/jpeg;base64,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')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 font-sans">
        <Header currentView={currentView} setView={navigate} />
        
        <main className="pt-24 pb-20 px-4 md:px-8">
            {renderView()}
        </main>
        
        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center space-y-4">
            <button
                onClick={() => setIsChatbotOpen(true)}
                className="bg-green-500/80 backdrop-blur-md text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 animate-glowing"
                style={{ animationName: 'glowing, subtle-float', animationDuration: '3s, 6s', animationDelay: '0.2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}
                aria-label={t('openChatbot')}
            >
                <Icon name="chatbot" className="w-8 h-8" />
            </button>
            <button
                onClick={() => setIsAssistantOpen(true)}
                className="bg-green-500/80 backdrop-blur-md text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 animate-glowing"
                style={{ animationName: 'glowing, subtle-float', animationDuration: '3s, 6s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}
                aria-label={t('openVoiceAssistant')}
            >
                <Icon name="microphone" className="w-8 h-8" />
            </button>
        </div>
        
        <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
        <VoiceAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
        
        <footer 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-green-300/80 font-sans z-50 tracking-wider"
          style={{ textShadow: '0 0 8px rgba(72, 187, 120, 0.7)' }}
        >
          {t('footerText', { team: 'Anant  I  Bipul  I  Abhishek  I  Harsh  I  Dhruthi  I  Siddharth' })}
        </footer>
      </div>
    </div>
  );
};

export default App;
