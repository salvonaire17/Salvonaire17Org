
import React, { useState, useMemo } from 'react';
import { 
    Clock, 
    CheckCircle2, 
    ChevronRight, 
    GraduationCap,
    Users,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { StudentDetails, Course } from '../types';

interface StaffWorkflowLayoutProps {
    title: string;
    officeRole: string;
    students: StudentDetails[];
    courses: Course[];
    waitingFilter: (student: StudentDetails) => boolean;
    solvedFilter: (student: StudentDetails) => boolean;
    onProcessStudent: (student: StudentDetails) => void;
    onViewDetails: (student: StudentDetails) => void;
}

export const StaffWorkflowLayout: React.FC<StaffWorkflowLayoutProps> = ({
    title,
    officeRole,
    students,
    courses,
    waitingFilter,
    solvedFilter,
    onProcessStudent,
    onViewDetails
}) => {
    const [activeWorkflow, setActiveWorkflow] = useState<'waiting' | 'solved'>('waiting');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

    // 1. Optimized Client-Side Logic: Grouping and Counting
    const workflowData = useMemo(() => {
        const items = students.filter(activeWorkflow === 'waiting' ? waitingFilter : solvedFilter);

        // Parse unique courses available in the CURRENT list
        const courseIdsInList = Array.from(new Set(items.map(s => s.courseId)));
        const availableCourses = courses.filter(c => courseIdsInList.includes(c.id));

        // Global Counts
        const totalPendingCount = students.filter(waitingFilter).length;
        const totalSolvedCount = students.filter(solvedFilter).length;

        // Final filtered and searched list
        const filteredList = items.filter(s => {
            const matchesCourse = selectedCourseId === 'all' || s.courseId === selectedCourseId;
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (s.admissionNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (s.nactvetRegNo || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCourse && matchesSearch;
        });

        return {
            filteredList,
            availableCourses,
            totalPendingCount,
            totalSolvedCount: students.filter(s => s.reportingStatus === 'Reported').length
        };
    }, [students, courses, activeWorkflow, selectedCourseId, searchQuery]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* 1. Sidebar/Workflow Navigation */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-2">
                <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm">
                    <button
                        onClick={() => { setActiveWorkflow('waiting'); setSelectedCourseId('all'); }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                            activeWorkflow === 'waiting' 
                                ? 'bg-cyan-600 text-white shadow-sm shadow-blue-100' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Clock size={18} className={activeWorkflow === 'waiting' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest">Waiting Tasks</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors ${
                            activeWorkflow === 'waiting' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700 font-bold'
                        }`}>
                            {workflowData.totalPendingCount}
                        </span>
                    </button>

                    <button
                        onClick={() => { setActiveWorkflow('solved'); setSelectedCourseId('all'); }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all mt-2 ${
                            activeWorkflow === 'solved' 
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest">Solved Tasks</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            activeWorkflow === 'solved' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'
                        }`}>
                            {workflowData.totalSolvedCount}
                        </span>
                    </button>
                </div>

                <div className="bg-blue-900 rounded-[2.5rem] p-6 text-white hidden lg:block">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">{officeRole}</h4>
                    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Operating Environment</p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
                            <Users size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Total Handled</p>
                            <p className="text-lg font-bold">{students.length}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Pane */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-full">
                    {/* Header with Search and Course Tabs */}
                    <div className="p-4 sm:p-8 border-b border-slate-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div>
                                <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                                <p className="text-[10px] sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">Manage institutional and academic clearance workflows.</p>
                            </div>
                            
                            <div className="relative group max-w-sm w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-700 transition-colors" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Search by name, reg number or admission..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3 sm:py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-cyan-100 focus:bg-white transition-all text-xs sm:text-sm font-bold"
                                />
                            </div>
                        </div>

                        {/* 2. In-View Course Categorization (Horizontal Tabs) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            <button
                                onClick={() => setSelectedCourseId('all')}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-[0.9rem] sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                    selectedCourseId === 'all'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                All Departments
                            </button>
                            {workflowData.availableCourses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-[0.9rem] sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                        selectedCourseId === course.id
                                            ? 'bg-cyan-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                    }`}
                                >
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Data Grid / Responsive Cards */}
                    <div className="p-4 sm:p-8 pt-0">
                        {workflowData.filteredList.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                    <Filter size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Queue is empty</h3>
                                <p className="text-sm text-slate-400 font-medium">No results match your current search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {workflowData.filteredList.map((student, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={student.id} 
                                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-cyan-200 transition-all group flex flex-col justify-between"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <img 
                                                src={student.avatar} 
                                                className="w-12 h-12 rounded-xl bg-slate-100 object-cover shadow-sm group-hover:scale-105 transition-transform" 
                                                alt="" 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 leading-tight truncate">{student.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-black text-cyan-700 shadow-sm truncate">
                                                        {student.admissionNumber || student.nactvetRegNo || 'PENDING'}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded truncate">
                                                        {student.nactvetRegNo && student.admissionNumber ? student.nactvetRegNo : `Level ${student.level}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                                            <span className="text-[10px] text-slate-400 font-bold truncate pr-3">{student.email}</span>
                                            {activeWorkflow === 'waiting' ? (
                                                <button 
                                                    onClick={() => onProcessStudent(student)}
                                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 duration-200 shrink-0"
                                                >
                                                    Process
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                                                        Completed
                                                    </span>
                                                    <button 
                                                        onClick={() => onViewDetails(student)}
                                                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-cyan-700 rounded-lg transition-colors"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
