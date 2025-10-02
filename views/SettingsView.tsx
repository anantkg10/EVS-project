import React, { useState, useEffect } from 'react';
import HolographicButton from '../components/HolographicButton';
import { getApiKeyStatus, setSessionApiKey } from '../services/geminiService';

interface SettingsViewProps {
    onApiKeyUpdate: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onApiKeyUpdate }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState(getApiKeyStatus());
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        // If a session key exists, pre-fill the input for easier editing
        const sessionKey = sessionStorage.getItem('userApiKey');
        if (sessionKey) {
            setApiKey(sessionKey);
        }
    }, []);

    const handleSave = () => {
        const success = setSessionApiKey(apiKey);
        const newStatus = getApiKeyStatus();
        setStatus(newStatus);
        onApiKeyUpdate();

        if (success) {
            setMessage({ text: `API Key is now active from ${newStatus.source}.`, type: 'success' });
        } else if (apiKey) {
             setMessage({ text: 'The provided API key appears to be invalid. Please check and try again.', type: 'error' });
        } else {
            setMessage({ text: 'API Key has been cleared.', type: 'success' });
        }
    };
    
    const handleClear = () => {
        setApiKey('');
        setSessionApiKey('');
        const newStatus = getApiKeyStatus();
        setStatus(newStatus);
        onApiKeyUpdate();
        setMessage({ text: 'Session API Key has been cleared.', type: 'success' });
    };

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-green-300">Settings</h2>
                <p className="text-gray-400 mt-4">
                    Manage your application configuration and API keys here.
                </p>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl holographic-border">
                <h3 className="text-2xl font-bold text-white mb-4">Gemini API Key</h3>
                
                <div className={`p-4 rounded-lg mb-6 border ${status.configured ? 'bg-green-500/10 border-green-400/30' : 'bg-yellow-500/10 border-yellow-400/30'}`}>
                    <p className="font-bold text-lg">{`Status: ${status.source}`}</p>
                    <p className="text-sm text-gray-300">
                        {status.configured 
                            ? "AI features are active. The application is using the key from the specified source."
                            : "AI features are disabled. Please provide an API key below."
                        }
                    </p>
                </div>

                <p className="text-gray-400 mb-4">
                    For deployed applications, it is highly recommended to set the <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded text-xs">API_KEY</code> environment variable. For local development or testing, you can provide an API key below. This will store it in your browser's session storage and it will be cleared when you close the tab.
                </p>

                <div className="space-y-4">
                    <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-300">
                        Session API Key Override
                    </label>
                    <input
                        id="apiKeyInput"
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setMessage(null);
                        }}
                        placeholder="Enter your Google Gemini API Key"
                        className="w-full bg-black/40 holographic-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                        disabled={!!process.env.API_KEY}
                    />
                     {!!process.env.API_KEY && (
                        <p className="text-sm text-green-300">The API key is already configured via an environment variable and cannot be overridden.</p>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex items-center justify-end space-x-4 mt-6">
                    <HolographicButton 
                        onClick={handleClear} 
                        className="py-2 px-6 text-base bg-gray-500/20 border-gray-400/50 hover:bg-gray-500/40"
                        disabled={!sessionStorage.getItem('userApiKey') || !!process.env.API_KEY}
                    >
                       Clear Session Key
                    </HolographicButton>
                    <HolographicButton 
                        onClick={handleSave} 
                        className="py-2 px-6 text-base"
                        disabled={!!process.env.API_KEY}
                    >
                       Save & Activate
                    </HolographicButton>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;