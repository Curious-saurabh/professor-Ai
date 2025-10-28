import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createProfessorChat } from '../services/geminiService';
import { ChatMessage, ChatSession } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { BotIcon } from './icons/BotIcon';

interface ProfessorBotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    contextualQuestion: string | null;
    clearContextualQuestion: () => void;
}

export const ProfessorBot: React.FC<ProfessorBotProps> = ({ isOpen, setIsOpen, contextualQuestion, clearContextualQuestion }) => {
    const [showGreeting, setShowGreeting] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);

    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('professorAiChatHistory');
            if (savedHistory) {
                setChatHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load or parse chat history:", error);
            localStorage.removeItem('professorAiChatHistory');
        }

        const timer = setTimeout(() => {
            setShowGreeting(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShowGreeting(false);
            if (!chatSession.current) {
                chatSession.current = createProfessorChat();
            }
            if (contextualQuestion) {
                setInput(contextualQuestion);
                clearContextualQuestion();
            }
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, contextualQuestion, clearContextualQuestion]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, viewMode]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession.current) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatSession.current.sendMessageStream({ message: input });
            let botResponse = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = botResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat API call failed:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (messages.length > 0) {
            const newSession: ChatSession = {
                timestamp: Date.now(),
                messages: messages,
            };
            const updatedHistory = [newSession, ...chatHistory];
            setChatHistory(updatedHistory);
            localStorage.setItem('professorAiChatHistory', JSON.stringify(updatedHistory));
        }
        setMessages([]);
        chatSession.current = null;
        setViewMode('chat');
        setIsOpen(false);
    };
    
    return (
        <>
            <div className={`fixed bottom-24 right-4 sm:right-8 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/20 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        {viewMode === 'history' && (
                            <button onClick={() => setViewMode('chat')} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Back to chat">
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                        )}
                        <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            {viewMode === 'chat' ? 'Professor AI' : 'Chat History'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {viewMode === 'chat' && (
                            <button onClick={() => setViewMode('history')} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="View chat history">
                                <HistoryIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Close chat">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {viewMode === 'chat' ? (
                        <div className="p-4 space-y-4">
                            <div className="p-3 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                                Hello! I am Professor AI. How can I help you clear your concepts?
                            </div>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                        <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] p-3 rounded-lg bg-slate-700 text-slate-200 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {chatHistory.length > 0 ? (
                                chatHistory.map((session, index) => (
                                    <div key={session.timestamp} className="bg-slate-700/50 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setActiveHistoryIndex(activeHistoryIndex === index ? null : index)}
                                            className="w-full text-left p-3 flex justify-between items-center hover:bg-slate-700 transition-colors"
                                        >
                                            <span className="font-semibold text-sm text-slate-300">
                                                {new Date(session.timestamp).toLocaleString()}
                                            </span>
                                            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${activeHistoryIndex === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        {activeHistoryIndex === index && (
                                            <div className="p-3 border-t border-slate-600/50 bg-slate-900/20 max-h-60 overflow-y-auto space-y-2">
                                                {session.messages.map((msg, msgIndex) => (
                                                    <div key={msgIndex} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-2 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-purple-700 text-white' : 'bg-slate-600 text-slate-200'}`}>
                                                            <div className="prose prose-invert prose-xs" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center p-8">No chat history found.</p>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {viewMode === 'chat' && (
                    <div className="p-4 border-t border-slate-700">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                className="flex-1 w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-300 placeholder-slate-500 disabled:opacity-50"
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                               <SendIcon className="w-6 h-6"/>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="fixed bottom-4 right-4 sm:right-8 z-20">
                 {showGreeting && !isOpen && (
                    <div className="absolute bottom-full right-0 mb-3 w-max max-w-xs p-3 bg-purple-600 text-white rounded-lg rounded-br-none shadow-lg transition-all animate-fade-in-up">
                        <p className="text-sm">Hello! I'm Professor AI. Click me if you have any questions!</p>
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300 border-2 border-slate-700 hover:border-cyan-500"
                    aria-label="Open chat with Professor AI"
                >
                    <BotIcon className="w-12 h-12" />
                </button>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </>
    );
};