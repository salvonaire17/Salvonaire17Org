
import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';
import { motion, AnimatePresence, MotionValue } from 'motion/react';
import { 
    LayoutDashboard, 
    Bell, 
    CreditCard,
    Settings, 
    LogOut, 
    Play, 
    Calendar,
    X,
    Zap,
    Trophy,
    Target,
    ClipboardCheck,
    Users,
    ShieldCheck,
    History,
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Monitor
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    dragX?: MotionValue<number>;
}

interface NavItemProps {
  viewName: View;
  label: string;
  icon: React.ReactNode;
  onClose: () => void;
  badge?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ viewName, label, icon, onClose, badge }) => {
  const { view, setView } = useAuth();
  const isActive = view === viewName;

  return (
    <motion.li 
        className="list-none"
        whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={() => {
          setView(viewName);
          onClose();
        }}
        className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? 'bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-sm text-white'
            : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        {/* Active Indicator Line */}
        {isActive && (
            <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-2/3 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            />
        )}

        <div className={`flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-110 group-hover:text-white'}`}>
          {icon}
        </div>
        <span className={`ml-4 text-sm tracking-[0.03em] transition-all duration-300 flex-1 text-left ${isActive ? 'font-semibold' : 'font-normal'}`}>
          {label}
        </span>
        {badge}
      </button>
    </motion.li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, dragX }) => {
  const { user, logout, setView, students = [], grades = [], registrationData } = useAuth();

  const confirmedCount = useMemo(() => {
    return students.filter((s: any) => 
      s.registrationStatus === 'Registered'
    ).length;
  }, [students]);

  const waitingVerificationCount = useMemo(() => {
    return grades.filter(g => (g as any).status === 'pending_verification' || g.status === 'pending_hod_review').length;
  }, [grades]);

  const menuGroups = useMemo(() => {
    if (!user) return [];

    const groups = [
        {
            title: "Main",
            items: [
                { id: 'dashboard' as View, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { id: 'announcements' as View, label: 'Announcements', icon: <Bell size={20} /> },
                { id: 'about' as View, label: 'About College', icon: <BookOpen size={20} /> }
            ]
        }
    ];
    
    if (user.role === 'Parent') {
        groups.push({
            title: "Parent Portal",
            items: [
                { id: 'admissions' as View, label: 'Student Status', icon: <ClipboardCheck size={20} /> },
                { id: 'bursary' as View, label: 'Fee Status', icon: <CreditCard size={20} /> }
            ]
        });
    }

    const academicItems = [];
    const academicRoles = ['Student', 'Lecturer', 'HOD', 'Principal', 'Admin', 'Academic Officer', 'System Administrator'];
    
    if (academicRoles.includes(user.role)) {
        academicItems.push({ id: 'courses' as View, label: 'Courses', icon: <BookOpen size={20} /> });
    }

    const registrationRoles = [
        'Student', 'Lecturer', 'HOD', 'Principal', 'Admin', 'Academic Officer', 'System Administrator',
        'Admission Officer', 'Admission', 'Bursar', 'NHIF', 'NHIF Officer', 'Supplies Officer', 'Warden', 'Secretary', 'Vice Principal'
    ];

    if (registrationRoles.includes(user.role)) {
        academicItems.push({ id: 'registration' as View, label: 'Registration', icon: <ClipboardCheck size={20} /> });
    }

    if (['HOD', 'Lecturer', 'Principal', 'Vice Principal', 'Admin', 'Academic Officer', 'System Administrator'].includes(user.role)) {
         // previously results was here
    }

    if (academicItems.length > 0) {
        groups.push({ title: "Academics", items: academicItems });
    }

    const adminItems = [];
    if (['Admin', 'Principal', 'Vice Principal', 'HOD', 'Admission Officer', 'System Administrator'].includes(user.role)) {
        adminItems.push(
            { id: 'leadership' as View, label: 'Leadership', icon: <ShieldCheck size={20} /> },
            { id: 'complaints' as View, label: 'Complaints', icon: <AlertTriangle size={20} /> }
        );
    }
    
    if (['Admin', 'Principal', 'Vice Principal', 'System Administrator', 'Admission Officer'].includes(user.role)) {
        adminItems.push({ id: 'lecturers' as View, label: 'Staff Directory', icon: <Users size={20} /> });
    }

    if (adminItems.length > 0) {
        groups.push({ title: "Admin", items: adminItems });
    }

    const operationsItems = [];
    if (['Admin', 'Principal', 'Vice Principal', 'Admission Officer', 'Lecturer', 'HOD', 'Academic Officer'].includes(user.role)) {
        operationsItems.push({ id: 'admissions' as View, label: 'Admissions Office', icon: <Target size={20} /> });
        operationsItems.push({ 
            id: 'registered' as View, 
            label: 'Registered', 
            icon: <CheckCircle2 size={20} />,
            badge: (
                <span className={`${confirmedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'} font-bold text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm shrink-0 transition-all`}>
                    {confirmedCount}
                </span>
            )
        });
    }
    if (['Admin', 'Principal', 'Vice Principal'].includes(user.role)) {
        operationsItems.push({ id: 'bursary' as View, label: 'Fee Management', icon: <CreditCard size={20} /> });
    }
    if (['Admin', 'Principal', 'Vice Principal', 'Warden'].includes(user.role)) {
        operationsItems.push({ id: 'hostels' as View, label: 'Hostel Management', icon: <BookOpen size={20} /> });
    }

    if (['Admin', 'Principal', 'Vice Principal', 'Admission Officer', 'Bursar', 'Warden'].includes(user.role)) {
        operationsItems.push({ id: 'session-watcher' as View, label: 'Session Watcher', icon: <Monitor size={20} /> });
    }

    if (operationsItems.length > 0) {
        groups.push({ title: "Operations", items: operationsItems });
    }

    groups.push({
        title: "Preferences",
        items: [
            { id: 'settings' as View, label: 'Settings', icon: <Settings size={20} /> }
        ]
    });

    return groups;
  }, [user, confirmedCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 left-0 bottom-0 w-[260px] bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#020617] text-white z-[101] shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col border-r border-white/5 rounded-r-[2.5rem]"
            >
                {/* Header */}
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(6,182,212,0.5)] relative group">
                            <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                            <Zap size={24} className="text-white fill-white/20 relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic tracking-tighter leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">MCHAS</h1>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1.5">Portal 2.0</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 hover:rotate-90">
                        <X size={20} className="text-white/40 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-2 scrollbar-hide">
                    {menuGroups.map((group, gIdx) => (
                        <div key={group.title} className={gIdx > 0 ? "mt-10" : ""}>
                            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-4">
                                {group.title}
                            </p>
                            <ul className="space-y-1.5">
                                {group.items.map(item => (
                                    <NavItem 
                                        key={item.id} 
                                        viewName={item.id} 
                                        label={item.label} 
                                        icon={item.icon} 
                                        badge={(item as any).badge}
                                        onClose={onClose} 
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* User Profile Area */}
                <div className="p-6">
                    <div 
                        className="p-4 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 flex items-center gap-4 shadow-sm relative group overflow-hidden cursor-pointer"
                        onClick={() => {
                            setView('profile');
                            onClose();
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`} className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-sm" alt="Profile" />
                            {registrationData?.phase2?.vicePrincipal?.status === 'APPROVED' ? (
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-500 border-2 border-[#0f172a] rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-50 duration-500">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 relative">
                            <p className="text-sm font-semibold truncate text-white/90 tracking-tight group-hover:text-white transition-colors">{user?.name}</p>
                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5">
                                {user?.role === 'HOD' ? `HOD - ${user?.departmentId || user?.courseId || 'DEPARTMENT'}` : (user?.title || user?.role)}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                logout();
                            }} 
                            className="p-2.5 text-white/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-300 relative z-10"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
