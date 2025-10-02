import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';
import Icon from './Icon';
import { ai } from '../services/geminiService';

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chat) {
            if (!ai) {
                setMessages([{ role: 'model', text: 'Hello! I am AgriBot, but I am currently offline. Please configure the API key in the Settings page to enable my features. 🤖' }]);
                return;
            }
            try {
                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                      systemInstruction: 'You are AgriBot, a helpful AI assistant for farmers. You provide expert advice on plant diseases, farming techniques, and crop management. Keep your answers concise, friendly, and easy to understand. Use emojis where appropriate to be more engaging.',
                    },
                });
                setChat(newChat);
                setMessages([{ role: 'model', text: 'Hello! I am AgriBot. How can I help you with your farm today? 🌱' }]);
            } catch (error) {
                console.error("Failed to initialize chatbot:", error);
                setMessages([{ role: 'model', text: 'Sorry, I am unable to connect right now.' }]);
            }
        }
    }, [isOpen, chat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chat || !ai) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result: AsyncGenerator<GenerateContentResponse> = await chat.sendMessageStream({ message: input });
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
            console.error('Gemini chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Oops! Something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-green-500/80 backdrop-blur-md text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 animate-glowing"
                aria-label="Open Chatbot"
            >
                <Icon name="chatbot" className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-black/50 backdrop-blur-lg rounded-2xl holographic-border flex flex-col shadow-2xl z-50">
            <header className="flex items-center justify-between p-4 border-b border-green-400/30">
                <h3 className="text-lg font-bold text-green-300">AgriBot Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-600/50 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
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
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={ai ? "Ask me anything..." : "Chatbot is offline"}
                        className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                        disabled={isLoading || !ai}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim() || !ai} className="bg-green-500/80 text-white p-2 rounded-full hover:bg-green-500 disabled:opacity-50">
                        <Icon name="arrowRight" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;