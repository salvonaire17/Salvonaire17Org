
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    LayoutDashboard, 
    Bell, 
    Calendar,
    Play,
    User
} from 'lucide-react';
import { motion } from 'motion/react';
import type { View } from '../types';

export const MobileBottomNav: React.FC = () => {
    const { view, setView } = useAuth();

    const navItems = [
        { id: 'dashboard' as View, icon: <LayoutDashboard size={20} />, label: 'Home' },
        { id: 'announcements' as View, icon: <Bell size={20} />, label: 'Alerts' },
        { id: 'media' as View, icon: <Play size={20} />, label: 'Media' },
        { id: 'profile' as View, icon: <User size={20} />, label: 'Profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-[80] pb-safe">
            <div className="bg-white/90 backdrop-blur-lg border border-slate-200 rounded-[2rem] shadow-md flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = view === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
                        >
                            <div className={`transition-all duration-300 ${isActive ? 'text-cyan-700 scale-110' : 'text-slate-400'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest transition-all duration-300 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div 
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-px left-1/4 right-1/4 h-0.5 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
