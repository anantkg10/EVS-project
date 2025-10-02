
import React from 'react';

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-green-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-green-400 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg text-green-300 tracking-widest animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
