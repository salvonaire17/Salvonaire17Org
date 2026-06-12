import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Trophy, ClipboardCheck, Users, Target } from 'lucide-react';
import { motion } from 'motion/react';

export const AcademicOfficerDashboard: React.FC = () => {
    const { setView } = useAuth();

    const menuItems = [
        { id: 'registration', label: 'Registration Review', icon: <ClipboardCheck className="w-6 h-6 text-cyan-600" /> },
        { id: 'admissions', label: 'Admissions Office', icon: <Target className="w-6 h-6 text-emerald-600" /> },
        { id: 'courses', label: 'Course Catalog', icon: <BookOpen className="w-6 h-6 text-amber-600" /> },
        { id: 'lecturers', label: 'Faculty Directory', icon: <Users className="w-6 h-6 text-purple-600" /> }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h1 className="text-3xl font-black text-slate-900">Academic Officer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as any)}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-sm transition-all flex items-center gap-4 group"
                    >
                        <div className="p-4 bg-slate-50 rounded-2xlグループ-hover:bg-cyan-50 transition-colors">
                            {item.icon}
                        </div>
                        <span className="font-bold text-slate-700 text-lg">{item.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
