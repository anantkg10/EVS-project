import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { analyzePlantImage, findRelatedArticles, apiKeyMissingError } from '../services/geminiService';
import { ScanResult, Severity, HistoryItem, ChatMessage, View, Article } from '../types';
import HolographicButton from '../components/HolographicButton';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import Gauge from '../components/Gauge';
import { ai } from '../services/geminiService';
import { articles as allArticles } from './KnowledgeHubView';


interface ScanViewProps {
  setView: (view: View, state?: any) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ setView }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for related articles
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  // State for the follow-up chat
  const [followUpChat, setFollowUpChat] = useState<Chat | null>(null);
  const [followUpMessages, setFollowUpMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scanResult && !followUpChat && ai) {
      try {
        const initialContext = `CONTEXT: The user has just scanned a plant image. The analysis is as follows: ${JSON.stringify(scanResult)}. You are AgriBot, an expert plant pathologist. Your task is to answer the user's follow-up questions based ONLY on this context. Be helpful, concise, and stay on topic. Do not mention the context itself unless asked. Start the conversation by inviting the user to ask a question.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: initialContext,
            },
        });
        setFollowUpChat(newChat);

        // Send an empty message to get the initial greeting
        const getInitialMessage = async () => {
            setIsReplying(true);
            try {
                const result: AsyncGenerator<GenerateContentResponse> = await newChat.sendMessageStream({ message: "" });
                let modelResponse = '';
                // Use a functional update to ensure we have the latest state
                setFollowUpMessages(prev => [...prev, { role: 'model', text: '...' }]);

                for await (const chunk of result) {
                    modelResponse += chunk.text;
                    setFollowUpMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0) {
                            newMessages[newMessages.length - 1].text = modelResponse + '...';
                        }
                        return newMessages;
                    });
                }
                
                setFollowUpMessages(prev => {
                     const newMessages = [...prev];
                     if (newMessages.length > 0) {
                        newMessages[newMessages.length - 1].text = modelResponse;
                     }
                    return newMessages;
                });
            } catch (error) {
                console.error('Initial greeting fetch error:', error);
                setFollowUpMessages(prev => [...prev, { role: 'model', text: 'I had an issue starting our chat. How can I help?' }]);
            } finally {
                setIsReplying(false);
            }
        };
        getInitialMessage();

      } catch (error) {
        console.error("Failed to initialize follow-up chat:", error);
        setFollowUpMessages([{ role: 'model', text: 'Sorry, I am unable to start a follow-up chat right now.' }]);
      }
    }
  }, [scanResult, followUpChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [followUpMessages]);

  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || isReplying || !followUpChat) return;

    const userMessage: ChatMessage = { role: 'user', text: followUpInput };
    setFollowUpMessages(prev => [...prev, userMessage]);
    const currentInput = followUpInput;
    setFollowUpInput('');
    setIsReplying(true);

    try {
        const result: AsyncGenerator<GenerateContentResponse> = await followUpChat.sendMessageStream({ message: currentInput });
        let modelResponse = '';
        setFollowUpMessages(prev => [...prev, { role: 'model', text: '...' }]);

        for await (const chunk of result) {
            modelResponse += chunk.text;
            setFollowUpMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse + '...';
                return newMessages;
            });
        }
        
        setFollowUpMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = modelResponse;
            return newMessages;
        });

    } catch (error) {
        console.error('Follow-up chat error:', error);
        setFollowUpMessages(prev => [...prev, { role: 'model', text: 'Oops! I ran into an issue. Please try again.' }]);
    } finally {
        setIsReplying(false);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !imagePreview) return;

    if (apiKeyMissingError) {
        // Fix: Updated environment variable name in error message for consistency.
        setError("Cannot analyze plant. The application's API_KEY is not configured.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setScanResult(null);
    setRelatedArticles([]);
    try {
      const result = await analyzePlantImage(imageFile);
      setScanResult(result);

      // Save to history
      const newHistoryItem: HistoryItem = {
          ...result,
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          imagePreview: imagePreview,
      };
      const existingHistory: HistoryItem[] = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      const updatedHistory = [newHistoryItem, ...existingHistory].slice(0, 50); // Keep last 50 scans
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

      // Find related articles
      if (!apiKeyMissingError) {
        const relatedArticleIds = await findRelatedArticles(result.diseaseName, allArticles);
        const foundArticles = allArticles.filter(a => relatedArticleIds.includes(a.id));
        setRelatedArticles(foundArticles);
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToCommunity = () => {
    if (!scanResult || !imagePreview) return;
    const postData = {
      ...scanResult,
      imagePreview,
    };
    setView(View.COMMUNITY, { action: 'CREATE_POST_FROM_SCAN', data: postData });
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setIsLoading(false);
    setFollowUpChat(null);
    setFollowUpMessages([]);
    setFollowUpInput('');
    setRelatedArticles([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const getSeverityIcon = (severity: Severity) => {
    switch(severity) {
        case Severity.HEALTHY: return <Icon name="healthy" className="w-6 h-6 text-green-400" />;
        case Severity.MILD: return <Icon name="warning" className="w-6 h-6 text-yellow-400" />;
        case Severity.MODERATE: return <Icon name="warning" className="w-6 h-6 text-orange-400" />;
        case Severity.SEVERE: return <Icon name="warning" className="w-6 h-6 text-red-500" />;
        default: return null;
    }
  }

  const getTreatmentIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spray') || lowerName.includes('fungicide')) return <Icon name="spray" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('fertilize') || lowerName.includes('nutrient')) return <Icon name="fertilizer" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('prun') || lowerName.includes('remove')) return <Icon name="scissors" className="w-8 h-8 text-green-300" />;
    return <Icon name="leaf" className="w-8 h-8 text-green-300" />;
  }

  const getPreventionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rotat')) return <Icon name="rotate" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('variety') || lowerName.includes('resistant')) return <Icon name="shield" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('irrigat') || lowerName.includes('water')) return <Icon name="water" className="w-8 h-8 text-green-300" />;
    return <Icon name="leaf" className="w-8 h-8 text-green-300" />;
  }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <LoadingSpinner text="ANALYZING IMAGE..." />
        {imagePreview && <img src={imagePreview} alt="Scanning plant" className="mt-8 rounded-lg max-w-sm w-full h-auto object-cover opacity-30" />}
      </div>
    );
  }

  if (scanResult) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-green-300">Analysis Complete</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <img src={imagePreview!} alt="Analyzed plant" className="rounded-lg w-full h-auto object-cover mb-4" />
                    <HolographicButton onClick={resetState} className="w-full">Scan Another Plant</HolographicButton>
                    <HolographicButton 
                        onClick={handleShareToCommunity} 
                        className="w-full mt-4 bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/40 hover:shadow-[0_0_25px_rgba(96,165,250,0.6)]"
                        icon={<Icon name="community" className="w-6 h-6"/>}
                    >
                        Share to Community
                    </HolographicButton>
                </div>
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border text-center">
                    <h3 className="text-xl font-bold text-green-300 mb-4">Severity Assessment</h3>
                    <div className="flex justify-center">
                        <Gauge severity={scanResult.severity} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-bold text-green-300">{scanResult.diseaseName}</h3>
                            <p className="text-gray-400">Confidence: {scanResult.confidence.toFixed(1)}%</p>
                        </div>
                        {getSeverityIcon(scanResult.severity)}
                    </div>
                    <p className="mt-4 text-gray-300">{scanResult.summary}</p>
                </div>

                {/* Follow-up Chat Section */}
                <div className="bg-black/30 backdrop-blur-md rounded-xl holographic-border flex flex-col h-[400px]">
                    <h3 className="text-2xl font-bold text-green-300 p-4 border-b border-green-400/30">Ask a Follow-up Question</h3>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {followUpMessages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-600/50 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isReplying && followUpMessages[followUpMessages.length -1]?.role === 'user' && (
                             <div className="flex justify-start">
                                <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700/50 text-gray-200 rounded-bl-none animate-pulse">...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                     <div className="p-4 border-t border-green-400/30">
                        <div className="flex items-center space-x-2 bg-black/30 rounded-full holographic-border p-1">
                             <input
                                type="text"
                                value={followUpInput}
                                onChange={(e) => setFollowUpInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendFollowUp()}
                                placeholder="Ask about this diagnosis..."
                                className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                                disabled={isReplying}
                            />
                            <button onClick={handleSendFollowUp} disabled={isReplying || !followUpInput.trim()} className="bg-green-500/80 text-white p-2 rounded-full hover:bg-green-500 disabled:opacity-50">
                                <Icon name="arrowRight" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {relatedArticles.length > 0 && (
                    <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                        <h3 className="text-2xl font-bold text-green-300 mb-4">Related Knowledge Hub Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relatedArticles.map((article) => (
                                <div 
                                    key={article.id} 
                                    className="bg-black/30 p-4 rounded-lg holographic-border cursor-pointer hover:border-green-400 transition-colors"
                                    onClick={() => setView(View.KNOWLEDGE_HUB, { selectedArticleId: article.id })}
                                >
                                    <h4 className="font-bold text-lg text-white">{article.title}</h4>
                                    <p className="text-sm text-gray-400 line-clamp-2">{article.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <h3 className="text-2xl font-bold text-green-300 mb-4">Treatment Recommendations</h3>
                    <div className="space-y-4">
                        {scanResult.treatments.map((item, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <div className="p-3 bg-green-500/10 rounded-full">{getTreatmentIcon(item.name)}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <h3 className="text-2xl font-bold text-green-300 mb-4">Prevention Tips</h3>
                     <div className="space-y-4">
                        {scanResult.preventionTips.map((item, index) => (
                           <div key={index} className="flex items-start space-x-4">
                                <div className="p-3 bg-green-500/10 rounded-full">{getPreventionIcon(item.name)}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <h2 className="text-4xl font-bold mb-4 text-green-300">Upload Plant Image</h2>
      <p className="text-gray-400 mb-8 max-w-lg">Choose a clear photo of the affected plant part (leaf, stem, or fruit) for the most accurate diagnosis.</p>

      <div
        className="w-full max-w-2xl h-80 border-2 border-dashed border-green-400/50 rounded-2xl flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm cursor-pointer hover:border-green-400 hover:bg-black/40 transition-all duration-300"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        {imagePreview ? (
          <img src={imagePreview} alt="Plant preview" className="max-h-full rounded-lg" />
        ) : (
          <div className="text-center">
            <Icon name="upload" className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl font-semibold">Drag & Drop or Click to Upload</p>
            <p className="text-gray-500">PNG, JPG, or WEBP supported</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 mt-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
      
      {imageFile && (
        <HolographicButton
            onClick={handleAnalyze}
            disabled={isLoading}
            className="mt-8 animate-glowing"
        >
            Analyze Plant
        </HolographicButton>
      )}
    </div>
  );
};

export default ScanView;