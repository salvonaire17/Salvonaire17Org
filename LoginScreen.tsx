
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createChatInstance } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { Paperclip, Image as ImageIcon, Globe, ArrowUp } from 'lucide-react';

interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: number;
}

const ActionButton: React.FC<{ 
    label: string; 
    icon: React.ReactNode; 
    color: string; 
    onClick: () => void 
}> = ({ label, icon, color, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-[2.5rem] border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all group w-32 h-32 md:w-44 md:h-44"
    >
        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
            {icon}
        </div>
        <span className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors text-center leading-tight px-2">
            {label}
        </span>
    </button>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`whitespace-pre-wrap break-words max-w-[80%] md:max-w-[70%]`}>
                {message.text && (
                    <div className={`px-4 py-2.5 ${
                        isModel 
                        ? 'text-slate-100' 
                        : 'bg-emerald-600 text-white rounded-[1.25rem] shadow-sm'
                    }`}>
                        <div className="text-sm md:text-base font-medium leading-relaxed">
                            {isModel ? (
                                <div className="prose prose-sm prose-invert prose-p:my-1.5 prose-p:leading-snug prose-headings:my-2 prose-headings:leading-tight prose-ul:my-1 prose-li:my-0 gap-y-2 max-w-none text-inherit overflow-x-auto [&_table]:border-collapse [&_table]:w-full [&_table]:my-2 [&_table]:border [&_table]:border-slate-700 [&_th]:border [&_th]:border-slate-700 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-800/50 [&_td]:border [&_td]:border-slate-700 [&_td]:px-3 [&_td]:py-2 focus:outline-none">
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap m-0">{message.text}</p>
                            )}
                        </div>
                    </div>
                )}
                {message.image && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-white/5 p-1">
                        <img src={message.image} alt="AI Generated content" className="w-full h-auto object-cover max-h-[400px] rounded-xl" />
                    </div>
                )}
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            Sources & Links
                        </p>
                        <ul className="space-y-1.5">
                            {message.sources.map((source, idx) => (
                                <li key={idx} className="truncate">
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors truncate block"
                                    >
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AiAssistant: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id || 'anonymous';
    const storageKey = `salvochat_sessions_${userId}`;

    const [isOpen, setIsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [webSearchEnabled, setWebSearchEnabled] = useState(true);

    const [loadedKey, setLoadedKey] = useState<string | null>(null);

    const isConversationStarted = messages.length > 0;

    // Load sessions on mount or user change
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSessions(parsed);
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].id);
                    setMessages(parsed[0].messages);
                    const history = parsed[0].messages.map((m: ChatMessage) => ({
                        role: m.role,
                        parts: [{ text: m.text }]
                    }));
                    chatRef.current = createChatInstance(history);
                } else {
                    setCurrentSessionId(null);
                    setMessages([]);
                    chatRef.current = createChatInstance([]);
                }
            } catch (e) {
                console.error("Failed to parse sessions", e);
                setSessions([]);
                setCurrentSessionId(null);
                setMessages([]);
                chatRef.current = createChatInstance([]);
            }
        } else {
            setSessions([]);
            setCurrentSessionId(null);
            setMessages([]);
            chatRef.current = createChatInstance([]);
        }
        setLoadedKey(storageKey);
    }, [storageKey]);

    // Save sessions whenever they change
    useEffect(() => {
        if (loadedKey === storageKey) {
            if (sessions.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(sessions));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [sessions, storageKey, loadedKey]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            toast('Document analysis is currently in development.', {
                icon: '📄',
                style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            toast('Image analysis is currently in development.', {
                icon: '🖼️',
                style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
            });
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (text: string = input) => {
        const query = text.trim();
        if (!query || isLoading) return;
        
        let sessionId = currentSessionId;
        let isNewSession = false;

        if (!sessionId) {
            sessionId = Date.now().toString();
            isNewSession = true;
            setCurrentSessionId(sessionId);
            chatRef.current = createChatInstance([]);
        }

        const userMessage: ChatMessage = { role: 'user', text: query };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
        }

        setSessions(prev => {
            if (isNewSession) {
                return [{ id: sessionId!, title: query.substring(0, 30) + '...', messages: updatedMessages, updatedAt: Date.now() }, ...prev];
            }
            return prev.map(s => s.id === sessionId ? { ...s, messages: updatedMessages, updatedAt: Date.now() } : s);
        });

        try {
            const stream = await chatRef.current.sendMessageStream({ message: query });
            let currentModelMessage = '';
            let currentSources: { uri: string; title: string }[] = [];
            
            setMessages(prev => [...prev, { role: 'model', text: '...' }]);
            
            for await (const chunk of stream) {
                 const genResponse = chunk as GenerateContentResponse;
                 const chunkText = genResponse.text || '';
                 currentModelMessage += chunkText;
                 
                 const groundingChunks = genResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
                 if (groundingChunks) {
                     groundingChunks.forEach(gc => {
                         if (gc.web?.uri && gc.web?.title) {
                             if (!currentSources.some(s => s.uri === gc.web?.uri)) {
                                 currentSources.push({ uri: gc.web.uri, title: gc.web.title });
                             }
                         }
                     });
                 }

                 const finalModelMessage = { 
                     role: 'model' as const, 
                     text: currentModelMessage,
                     sources: currentSources.length > 0 ? currentSources : undefined
                 };

                 setMessages(prev => {
                     const newMessages = [...prev];
                     newMessages[newMessages.length - 1] = finalModelMessage;
                     return newMessages;
                 });

                 setSessions(prev => 
                     prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedMessages, finalModelMessage], updatedAt: Date.now() } : s)
                 );
            }
        } catch (error: any) {
            console.error("AI chat error:", error);
            let errorText = 'I encountered an error while processing your request. Please try again.';
            
            if (error?.status === 'PERMISSION_DENIED' || error?.message?.includes('permission')) {
                errorText = 'Permission denied. Please make sure you have a valid Gemini API key.';
            }

            const errorMessage = { role: 'model' as const, text: errorText };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
            setSessions(prev => 
                prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedMessages, errorMessage], updatedAt: Date.now() } : s)
            );
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOpen = () => setIsOpen(prev => !prev);

    const startNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setIsSidebarOpen(false);
        chatRef.current = createChatInstance([]);
    };

    const loadSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(session.id);
            setMessages(session.messages);
            const history = session.messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            chatRef.current = createChatInstance(history);
        }
        setIsSidebarOpen(false);
    };

    return (
        <>
            {/* Prominent Floating Trigger Button */}
            {!isOpen && (
                <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-[9999]">
                    <button
                        onClick={toggleOpen}
                        className="bg-emerald-600 text-white rounded-full p-0 shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center border-[3px] border-white h-12 w-12 md:h-14 md:w-14"
                        aria-label="Open Salvochat"
                    >
                        <div className="flex items-center justify-center font-black text-xl md:text-2xl tracking-tighter">
                            S
                        </div>
                    </button>
                </div>
            )}

            {/* Redesigned Pro Chat Interface */}
            <div 
                className={`fixed inset-0 z-[150] bg-black text-white flex flex-col transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                    isOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95 translate-y-10'
                }`}
            >
                {/* Subtle SALVO¹⁷ Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <span className="text-[20vw] font-black tracking-tighter">SALVO¹⁷</span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center p-6 z-10">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 transition-colors"
                            title="View Chat History"
                        >
                            S
                        </button>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Salvochat</span>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Medical AI Assistant</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={toggleOpen} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex overflow-hidden z-10">
                    {/* Sidebar for Chat History */}
                    <div className={`absolute inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-20 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest text-slate-400">Chat History</span>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <button 
                                onClick={startNewChat}
                                className="w-full py-2.5 px-4 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-emerald-500/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                <span>New Chat</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                            {sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => loadSession(session.id)}
                                    className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-colors truncate ${currentSessionId === session.id ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                                >
                                    {session.title}
                                </button>
                            ))}
                            {sessions.length === 0 && (
                                <div className="text-center text-slate-500 text-xs py-8">
                                    No previous conversations
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 relative flex flex-col overflow-hidden">
                        {!isConversationStarted ? (
                        /* Central Greeting & Quick Actions */
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in duration-1000">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-center mb-16 max-w-2xl leading-tight">
                                How can I assist your learning or health task today?
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl">
                                <ActionButton 
                                    label="View Lab Results" 
                                    color="bg-emerald-500" 
                                    onClick={() => handleSendMessage("Show me how to interpret clinical laboratory results for a patient with jaundice")}
                                    icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l2.387-2.387a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 00-.547-1.022L2.45 2.45a2 2 0 00-2.828 2.828l2.387 2.387a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387.477a2 2 0 001.022-.547l2.387-2.387a2 2 0 10-2.828-2.828l-2.387 2.387z" /></svg>}
                                />
                                <ActionButton 
                                    label="Generate Study Plan" 
                                    color="bg-amber-500" 
                                    onClick={() => handleSendMessage("Create a 7-day study plan for my Pharmacology and Therapeutics module")}
                                    icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                />
                                <ActionButton 
                                    label="Analyze Patient Data" 
                                    color="bg-cyan-600" 
                                    onClick={() => handleSendMessage("Let's analyze clinical case study data to practice diagnostic reasoning")}
                                    icon={<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Chat Log */
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-8 scroll-smooth scrollbar-hide">
                            <div className="max-w-4xl mx-auto">
                                {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                                {isLoading && (
                                    <div className="flex items-center space-x-2 text-slate-500 mb-8">
                                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </div>
                </div>

                {/* Bottom Input */}
                <div className="px-4 sm:px-6 pb-6 pt-2 z-10 w-full relative">
                    <div className="w-full max-w-3xl mx-auto flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 pl-5 transition-all duration-300 shadow-lg focus-within:shadow-[0_0_20px_rgba(56,189,248,0.15)] focus-within:border-slate-700/60">
                        {/* Text Area */}
                        <div className="w-full">
                            <textarea 
                                ref={textareaRef}
                                rows={1}
                                placeholder="Message Salvo..."
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="w-full bg-transparent border-none outline-none resize-none text-slate-100 placeholder-slate-400 text-[15px] focus:ring-0 p-0 mb-1 max-h-[200px] min-h-[24px] scrollbar-hide whitespace-pre-wrap overflow-y-auto leading-relaxed"
                                style={{ height: '24px' }}
                            />
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between mt-1 border-t border-white/5 pt-2">
                            {/* Left Side Utilities */}
                            <div className="flex items-center gap-1 text-slate-400">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageUpload} />
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors group relative" title="Attach file">
                                    <Paperclip size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2}/>
                                </button>
                                <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors group relative" title="Upload image">
                                    <ImageIcon size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2}/>
                                </button>
                                <button onClick={() => {
                                    const next = !webSearchEnabled;
                                    setWebSearchEnabled(next);
                                    toast.success(next ? 'Web search enabled.' : 'Web search disabled.', {
                                        icon: next ? '🌐' : '🚫',
                                        style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
                                    });
                                }} className={`p-2 rounded-full transition-colors group relative ${webSearchEnabled ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/10 hover:text-white'}`} title="Web search">
                                    <Globe size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2}/>
                                </button>
                            </div>

                            {/* Right Side Send Button */}
                            <button 
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 rounded-full flex items-center justify-center transition-all duration-200 transform ${
                                    input.trim() && !isLoading
                                    ? 'bg-transparent text-emerald-500 scale-100 hover:text-emerald-400' 
                                    : 'bg-transparent text-white/30 cursor-not-allowed'
                                }`}
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};
