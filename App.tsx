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
                className="bg-blue-500/80 backdrop-blur-md text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition-transform hover:scale-110 animate-glowing"
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
