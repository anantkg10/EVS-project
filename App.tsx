import React, { useState, useCallback, useEffect } from 'react';
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

  if (apiKeyMissingError) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 text-gray-300">
            <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 max-w-3xl w-full">
                <Icon name="warning" className="w-20 h-20 text-red-400 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-red-300 mb-4">Configuration Error</h1>
                <p className="text-lg max-w-2xl mx-auto">
                    The <code className="bg-gray-800 text-yellow-300 px-2 py-1 rounded">API_KEY</code> environment variable is missing.
                </p>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
                    This application cannot connect to the AI service without a valid Google Gemini API key.
                </p>
                <div className="text-left bg-gray-900/50 p-6 rounded-lg mt-8">
                    <h2 className="text-xl font-semibold text-green-300 mb-3">How to fix this:</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>Go to your project's dashboard on Vercel.</li>
                        <li>Click on the <span className="font-semibold text-white">Settings</span> tab, then <span className="font-semibold text-white">Environment Variables</span>.</li>
                        <li>Create a new variable with the name <code className="bg-gray-800 text-yellow-300 px-2 py-1 rounded">API_KEY</code>.</li>
                        <li>Paste your Google Gemini API key into the value field.</li>
                        <li>Save the variable and redeploy the application.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
  }

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