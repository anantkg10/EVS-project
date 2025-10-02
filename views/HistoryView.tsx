
import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { HistoryItem, Severity, View } from '../types';
import Gauge from '../components/Gauge';
import HolographicButton from '../components/HolographicButton';

interface HistoryDetailModalProps {
    scan: HistoryItem;
    onClose: () => void;
    setView: (view: View, state?: any) => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ scan, onClose, setView }) => {
    
    const handleShareToCommunity = () => {
        setView(View.COMMUNITY, { action: 'CREATE_POST_FROM_SCAN', data: scan });
        onClose(); // Close modal after initiating navigation
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-black/50 holographic-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl">&times;</button>
                <h2 className="text-3xl font-bold text-center mb-8 text-green-300">Scan Details</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 space-y-8">
                        <img src={scan.imagePreview} alt="Analyzed plant" className="rounded-lg w-full h-auto object-cover" />
                        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border text-center">
                            <h3 className="text-xl font-bold text-green-300 mb-4">Severity Assessment</h3>
                            <div className="flex justify-center"><Gauge severity={scan.severity} /></div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                            <h3 className="text-2xl font-bold text-green-300">{scan.diseaseName}</h3>
                            <p className="text-gray-400">Confidence: {scan.confidence.toFixed(1)}%</p>
                            <p className="mt-4 text-gray-300">{scan.summary}</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                             <h3 className="text-xl font-bold text-green-300 mb-4">Treatment Recommendations</h3>
                             <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {scan.treatments.map((t, i) => <li key={i}><span className="font-semibold text-white">{t.name}:</span> {t.description}</li>)}
                            </ul>
                        </div>
                        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                             <h3 className="text-xl font-bold text-green-300 mb-4">Prevention Tips</h3>
                             <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {scan.preventionTips.map((p, i) => <li key={i}><span className="font-semibold text-white">{p.name}:</span> {p.description}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <HolographicButton 
                        onClick={handleShareToCommunity} 
                        className="py-2 px-6 text-base bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/40 hover:shadow-[0_0_25px_rgba(96,165,250,0.6)]"
                        icon={<Icon name="community" className="w-6 h-6"/>}
                    >
                        Share to Community
                    </HolographicButton>
                </div>
            </div>
        </div>
    );
};

interface HistoryViewProps {
  setView: (view: View, state?: any) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ setView }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedScan, setSelectedScan] = useState<HistoryItem | null>(null);

    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        setHistory(storedHistory);
    }, []);

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear your entire scan history? This action cannot be undone.")) {
            localStorage.removeItem('scanHistory');
            setHistory([]);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-green-300">Scan History</h2>
                {history.length > 0 && (
                    <HolographicButton onClick={handleClearHistory} className="py-2 px-4 text-sm bg-red-500/20 border-red-400/50 hover:bg-red-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                        Clear History
                    </HolographicButton>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-black/20 rounded-xl holographic-border">
                    <Icon name="history" className="w-20 h-20 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">No Scans Yet</h3>
                    <p className="text-gray-400">Your past plant scans will appear here.</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="relative border-l-2 border-green-500/30 pl-8 space-y-12">
                        <div className="absolute top-0 left-[-11px] w-6 h-6 bg-green-500 rounded-full animate-glowing"></div>
                        {history.map((item) => (
                            <div key={item.id} className="relative">
                                <div className="absolute top-3 left-[-42px] w-4 h-4 bg-green-400 rounded-full border-4 border-gray-900"></div>
                                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border hover:border-green-400 transition-colors duration-300 flex items-center space-x-6 cursor-pointer" onClick={() => setSelectedScan(item)}>
                                    <img src={item.imagePreview} alt={item.diseaseName} className="w-24 h-24 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">{new Date(item.date).toLocaleString()}</p>
                                        <h3 className="text-xl font-bold text-white">{item.diseaseName}</h3>
                                        <p className={`text-sm font-semibold ${
                                            item.severity === Severity.SEVERE ? 'text-red-400' :
                                            item.severity === Severity.MODERATE ? 'text-orange-400' :
                                            item.severity === Severity.MILD ? 'text-yellow-400' : 'text-green-400'
                                        }`}>Severity: {item.severity}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-green-500/20">
                                        <Icon name="arrowRight" className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedScan && <HistoryDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} setView={setView} />}
        </div>
    );
};

export default HistoryView;