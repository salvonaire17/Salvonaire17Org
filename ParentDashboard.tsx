
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardCheck, Info, Users, Settings, Bell, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminStaffDashboard: React.FC = () => {
    const { user, setView, students } = useAuth();
    
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.registrationStatus === 'Registered').length;
    const pendingStudents = totalStudents - activeStudents;
    
    const isAdmin = user?.role === 'Admin' || user?.role === 'System Administrator';
    
    const cards = [
        { 
            id: 'registration', 
            title: 'Registration', 
            desc: 'Access the student information and processing area for registration workflows.', 
            icon: <ClipboardCheck className="w-10 h-10 text-cyan-700" />,
            color: 'bg-cyan-50',
            roles: ['Admission Officer', 'Admission', 'Bursar', 'NHIF', 'NHIF Officer', 'Supplies Officer', 'Warden', 'Secretary', 'Vice Principal', 'Admin']
        },
        { 
            id: 'announcements', 
            title: 'Announcements', 
            desc: 'Institutional bulletins and campus-wide notifications.', 
            icon: <Bell className="w-10 h-10 text-amber-600" />,
            color: 'bg-amber-50',
            roles: ['*']
        },
        { 
            id: 'profile', 
            title: 'My Profile', 
            desc: 'Manage your administration account details and security.', 
            icon: <Users className="w-10 h-10 text-purple-600" />,
            color: 'bg-purple-50',
            roles: ['*']
        }
    ];

    if (isAdmin) {
        cards.push({
            id: 'management',
            title: 'Registry Control',
            desc: 'Master list management and system-wide data controls.',
            icon: <Settings className="w-10 h-10 text-slate-600" />,
            color: 'bg-slate-100',
            roles: ['Admin']
        });
    }

    const filteredCards = cards.filter(c => c.roles.includes('*') || c.roles.includes(user?.role || ''));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden isolate shadow-sm">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Administrative Terminal</h1>
                    <p className="text-slate-400 font-medium mt-4 text-lg max-w-2xl">
                        Welcome, <span className="text-white font-bold">{user?.name}</span>. You are logged in as <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">{user?.role}</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Accounts</p>
                        <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                        <ClipboardCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fully Registered</p>
                        <p className="text-2xl font-black text-slate-900">{activeStudents}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Actions</p>
                        <p className="text-2xl font-black text-slate-900">{pendingStudents}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCards.map((card, idx) => (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        key={card.id}
                        onClick={() => setView(card.id as any)}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-start gap-8 text-left group transition-all"
                    >
                        <div className={`p-6 rounded-[1.8rem] ${card.color} group-hover:scale-110 transition-transform`}>
                            {card.icon}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 tracking-tight">{card.title}</h3>
                            <p className="text-slate-500 font-medium mt-3 text-sm leading-relaxed">{card.desc}</p>
                        </div>
                        <div className="mt-auto w-full flex justify-end">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <FileText size={18} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
