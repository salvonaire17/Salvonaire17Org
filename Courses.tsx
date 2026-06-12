
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogoutIcon } from './icons/LogoutIcon';
import { Menu, Bell, CheckCircle2, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, logout, setView, students = [] } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const confirmedCount = React.useMemo(() => {
    return students.filter((s: any) => 
      s.registrationStatus === 'Registered'
    ).length;
  }, [students]);

  return (
    <header className="z-[90] sticky top-4 mx-4 md:mx-8 mb-4">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-[2rem] shadow-sm flex items-center justify-between px-4 md:px-6 h-16 relative">
        {/* Left: Menu */}
        <div className="z-10">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100/50 rounded-xl transition-colors text-slate-600"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex items-center justify-center px-2 min-w-0">
          <h2 className="text-xs font-black text-slate-900 truncate tracking-widest uppercase md:text-sm lg:text-base">
            {title}
          </h2>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center space-x-1 md:space-x-3 z-10 shrink-0">
            {user && ['Admin', 'Admission Officer'].includes(user.role) && (
              <div 
                onClick={() => setView('registration')}
                className="hidden md:flex items-center gap-1.5 md:gap-2 px-3 py-1.5 bg-emerald-50/90 border border-emerald-150 hover:border-emerald-200 rounded-full text-emerald-700 font-black text-[9px] md:text-[10px] shadow-sm hover:shadow-sm hover:bg-emerald-100/50 transition-all cursor-pointer select-none active:scale-95 duration-200"
                title="Total students who completed registration & confirmed"
              >
                <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5] animate-pulse" />
                <span className="tracking-widest uppercase">
                  Registered: <span className="text-emerald-900 font-black">{confirmedCount}</span>
                </span>
              </div>
            )}

            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-cyan-600 transition-colors relative"
              title="Toggle Theme"
            >
                {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>

            <button 
              onClick={() => setView('notifications')}
              className="p-2 text-slate-400 hover:text-cyan-600 transition-colors relative"
            >
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            
            <button 
                onClick={() => setView('profile')}
                className="ml-2"
            >
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`} alt={user?.name} className="w-8 h-8 rounded-xl border border-slate-100 shadow-sm object-cover" />
            </button>
        </div>
      </div>
    </header>
  );
};

