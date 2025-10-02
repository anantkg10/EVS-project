
import React from 'react';
import { View } from '../types';
import HolographicButton from '../components/HolographicButton';
import Icon from '../components/Icon';

interface HomeViewProps {
  setView: (view: View, state?: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  return (
    <div className="container mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="p-8 bg-black/30 backdrop-blur-md rounded-2xl holographic-border animate-subtle-float">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          Welcome to <span className="text-green-400">Agri-AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Revolutionizing agriculture with advanced AI. Instantly detect plant diseases, get expert advice, and secure your harvest's future.
        </p>
        <HolographicButton
          onClick={() => setView(View.SCAN)}
          className="animate-glowing"
          icon={<Icon name="scan" className="w-8 h-8" />}
        >
          Scan Your Plant Now
        </HolographicButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
        <FeatureCard
          icon={<Icon name="shield" className="w-10 h-10 text-green-400" />}
          title="Instant Diagnosis"
          description="Upload an image and get an AI-powered diagnosis in seconds."
        />
        <FeatureCard
          icon={<Icon name="book" className="w-10 h-10 text-green-400" />}
          title="Actionable Insights"
          description="Receive detailed treatment and prevention strategies."
        />
        <FeatureCard
          icon={<Icon name="community" className="w-10 h-10 text-green-400" />}
          title="Community Powered"
          description="Connect with fellow farmers and experts for support."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border text-center transform hover:scale-105 transition-transform duration-300">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-green-300 mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);


export default HomeView;