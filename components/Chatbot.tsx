import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { TranscriptMessage } from '../types';
import Icon from './Icon';
import { ai } from '../services/geminiService';
import { useLocalization } from '../contexts/LocalizationContext';

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen }) => {
    const { t, languageName } = useLocalization();
    const [messages, setMessages] = useState<TranscriptMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (isOpen) {
            if (!ai) {
                setMessages([{ role: 'model', text: t('chatbotOfflineMessage') }]);
                return;
            }
            try {
                const systemInstruction = t('chatbotSystemInstruction', { language: languageName });
                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction },
                });
                chatRef.current = newChat;
                setMessages([]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                setMessages([{ role: 'model', text: t('chatbotConnectionError') }]);
            }
        } else {
            setMessages([]);
            setInput('');
            setIsLoading(false);
            chatRef.current = null;
        }
    }, [isOpen, t, languageName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: TranscriptMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const result: AsyncGenerator<GenerateContentResponse> = await chatRef.current.sendMessageStream({ message: currentInput });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '...' }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse + '...';
                    return newMessages;
                });
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });

        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, { role: 'model', text: t('chatbotGenericError') }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
            <div className="bg-black/50 holographic-border rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-green-400/30">
                    <div className="flex items-center space-x-3">
                        <Icon name="chatbot" className="w-6 h-6 text-green-300" />
                        <h3 className="text-xl font-bold text-green-300">{t('chatbotTitle')}</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </header>

                <main className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-600/50 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                         <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700/50 text-gray-200 rounded-bl-none animate-pulse">...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-green-400/30">
                    <form onSubmit={handleSend} className="flex items-center space-x-2 bg-black/30 rounded-full holographic-border p-1">
                         <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chatPlaceholder')}
                            className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                            disabled={isLoading || !ai}
                        />
                        <button type="submit" disabled={isLoading || !input.trim() || !ai} className="bg-green-500/80 text-white p-2 rounded-full hover:bg-green-500 disabled:opacity-50">
                            <Icon name="arrowRight" className="w-5 h-5" />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default Chatbot;
