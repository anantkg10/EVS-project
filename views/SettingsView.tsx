
import React from 'react';
// Fix: Import apiKeyMissingError to determine the API key status, instead of non-existent functions.
import { apiKeyMissingError } from '../services/geminiService';
import { useLocalization } from '../contexts/LocalizationContext';
import Icon from '../components/Icon';

// The SettingsView component is now read-only to reflect that API keys
// must be managed via environment variables as per security best practices.
// All UI for setting the key has been removed to fix errors from missing
// service functions and align with guidelines.
const SettingsView: React.FC = () => {
    const { t } = useLocalization();

    const isConfigured = !apiKeyMissingError;

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-green-300">{t('settings')}</h2>
                <p className="text-gray-400 mt-4">
                    {t('settingsSubtitle')}
                </p>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl holographic-border">
                <h3 className="text-2xl font-bold text-white mb-4">{t('settingsApiKeyTitle')}</h3>
                
                <div className={`p-4 rounded-lg mb-6 border ${isConfigured ? 'bg-green-500/10 border-green-400/30' : 'bg-yellow-500/10 border-yellow-400/30'}`}>
                    <div className="flex items-start space-x-3">
                        <Icon name={isConfigured ? 'shield' : 'warning'} className={`w-6 h-6 mt-1 flex-shrink-0 ${isConfigured ? 'text-green-400' : 'text-yellow-400'}`} />
                        <div>
                             <p className="font-bold text-lg">{`${t('settingsStatus')}: ${isConfigured ? t('settingsStatusConfigured') : t('settingsStatusNotConfigured')}`}</p>
                            <p className="text-sm text-gray-300">
                                {isConfigured
                                    ? t('settingsStatusConfiguredDesc')
                                    : t('settingsStatusNotConfiguredDesc')
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-gray-400">
                    {t('settingsApiDescReadOnly1')} <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded text-xs">API_KEY</code> {t('settingsApiDescReadOnly2')}
                </p>
            </div>
        </div>
    );
};

export default SettingsView;
