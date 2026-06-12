
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Course, StudentDetails, LecturerDetails, Role, ModuleNotice } from '../types';
import { LecturersView } from '../views/LecturersView';

interface CourseDetailModalProps {
    course: Course;
    onClose: () => void;
}

const ModuleItem: React.FC<{ 
    name: string; 
    lecturer?: LecturerDetails; 
    onAction: (moduleName: string) => void;
    canUpload: boolean;
    onUpload: (moduleName: string) => void;
    canAssign: boolean;
    isHod: boolean;
    onAssign: (moduleName: string) => void;
    onPostNotice: (moduleName: string) => void;
}> = ({ name, lecturer, onAction, canUpload, onUpload, canAssign, isHod, onAssign, onPostNotice }) => (
    <div className="group/item flex flex-col xl:flex-row xl:items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all gap-3">
        <div className="flex items-start xl:items-center space-x-3 flex-1 min-w-0 w-full">
            <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5 xl:mt-0 group-hover/item:scale-125 transition-transform"></div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-700 truncate group-hover/item:text-slate-900 transition-colors">{name}</p>
                {lecturer ? (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">Lec: {lecturer.title ? `${lecturer.title} ` : ''}{lecturer.name}</p>
                ) : (
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5 italic truncate">No Lecturer Assigned</p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            {canAssign && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onAssign(name); }}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex-shrink-0"
                    title="Assign Lecturer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
            )}
            {(isHod || canUpload) && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onPostNotice(name); }}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all flex-shrink-0"
                    title="Post Subject Notice"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.332 12.836 20 14.5 20 16.5a4.5 4.5 0 01-4.5 4.5H7" /></svg>
                </button>
            )}
        </div>
    </div>
);

const SemesterCard: React.FC<{
    semester: string;
    level: string;
    modules: string[];
    students: StudentDetails[];
    lecturers: LecturerDetails[];
    moduleNotices: ModuleNotice[];
    onAction: (moduleName: string) => void;
    canUpload: boolean;
    onUpload: (moduleName: string) => void;
    canAssign: boolean;
    isHod: boolean;
    onUpdateRegistry: () => void;
    onAssignLecturer: (moduleName: string) => void;
    onPostNotice: (moduleName: string) => void;
    color: 'cyan' | 'indigo';
}> = ({ semester, level, modules, students, lecturers, moduleNotices, onAction, canUpload, onUpload, canAssign, isHod, onUpdateRegistry, onAssignLecturer, onPostNotice, color }) => {
    const [view, setView] = useState<'modules' | 'registry' | 'notices'>('modules');
    
    const badgeColor = color === 'cyan' ? 'bg-cyan-600 shadow-cyan-100' : 'bg-cyan-600 shadow-indigo-100';
    const accentColor = color === 'cyan' ? 'text-cyan-600' : 'text-cyan-700';

    const currentSemesterNotices = moduleNotices.filter(n => modules.includes(n.moduleId));

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-8 flex-shrink-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                    <span className={`${badgeColor} text-white text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-[0.2em] px-5 py-2 rounded-xl shadow-sm`}>
                        {semester}
                    </span>
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setView('modules')}
                            className={`text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest px-3 py-1.5 rounded-lg transition-all ${view === 'modules' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            Modules
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
                {view === 'modules' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        {modules.map((m, i) => (
                            <ModuleItem 
                                key={i} 
                                name={m} 
                                lecturer={lecturers.find(l => (l.modules || []).includes(m))} 
                                onAction={onAction}
                                canUpload={canUpload}
                                onUpload={onUpload}
                                canAssign={canAssign}
                                isHod={isHod}
                                onAssign={onAssignLecturer}
                                onPostNotice={onPostNotice}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50 flex-shrink-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Academic Command • MCHAS {level}
                </p>
            </div>
        </div>
    );
};

const LevelSection: React.FC<{ 
    level: string; 
    sm1Modules: string[]; 
    sm2Modules: string[]; 
    lecturers: LecturerDetails[];
    students: StudentDetails[];
    moduleNotices: ModuleNotice[];
    onAction: (moduleName: string) => void;
    canUpload: boolean;
    onUpload: (moduleName: string) => void;
    canAssign: boolean;
    isHod: boolean;
    onUpdateRegistry: (level: string) => void;
    onAssignLecturer: (moduleName: string) => void;
    onPostNotice: (moduleName: string) => void;
}> = ({ level, sm1Modules, sm2Modules, lecturers, students, moduleNotices, onAction, canUpload, onUpload, canAssign, isHod, onUpdateRegistry, onAssignLecturer, onPostNotice }) => {
    const levelNum = parseInt(level.split(' ')[1]);
    const levelStudents = students.filter(s => {
        const studentLevelNum = parseInt(String(s.level).replace(/[^0-9]/g, ''));
        return (studentLevelNum) === levelNum;
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-6">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200"></div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                    Year {levelNum - 3} (NTA {level.split(' ')[1]})
                </h4>
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SemesterCard 
                    semester="Semester 01"
                    level={level.split(' ')[1]}
                    modules={sm1Modules}
                    students={levelStudents}
                    lecturers={lecturers}
                    moduleNotices={moduleNotices}
                    onAction={onAction}
                    canUpload={canUpload}
                    onUpload={onUpload}
                    canAssign={canAssign}
                    isHod={isHod}
                    onUpdateRegistry={() => onUpdateRegistry(level)}
                    onAssignLecturer={onAssignLecturer}
                    onPostNotice={onPostNotice}
                    color="cyan"
                />
                <SemesterCard 
                    semester="Semester 02"
                    level={level.split(' ')[1]}
                    modules={sm2Modules}
                    students={levelStudents}
                    lecturers={lecturers}
                    moduleNotices={moduleNotices}
                    onAction={onAction}
                    canUpload={canUpload}
                    onUpload={onUpload}
                    canAssign={canAssign}
                    isHod={isHod}
                    onUpdateRegistry={() => onUpdateRegistry(level)}
                    onAssignLecturer={onAssignLecturer}
                    onPostNotice={onPostNotice}
                    color="indigo"
                />
            </div>
        </div>
    );
};

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose }) => {
    const { students, lecturers, departments, user, setView, moduleNotices, addModuleNotice } = useAuth();
    const [activeTab, setActiveTab] = useState<'curriculum' | 'roster' | 'faculty'>('curriculum');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [updatingLevel, setUpdatingLevel] = useState<string | null>(null);

    // New Notice State
    const [noticingModule, setNoticingModule] = useState<string | null>(null);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');

    const courseStudents = students.filter(s => s.courseId === course.id);
    const department = departments.find(d => d.id === course.departmentId);
    const courseLecturers = lecturers; // Show all lecturers as requested
    
    const canSeeRoster = user?.role === 'Principal' || user?.role === 'Admission Officer' || (user?.role === 'HOD' && user?.departmentId === course.departmentId);
    const canUpload = user?.role === 'Lecturer' || user?.role === 'HOD' || user?.role === 'Principal';
    const isHod = user?.role === 'HOD' && user?.departmentId === course.departmentId;
    const canAssign = user?.role === 'Principal' || user?.role === 'Vice Principal' || user?.role === 'Academic Officer';

    const handleAction = (moduleName: string) => {
        setSelectedModule(moduleName);
    };

    const handleUpload = (moduleName: string) => {
        setIsUploading(true);
        setSelectedModule(moduleName);
    };

    const handleAssignLecturer = (moduleName: string) => {
        // Redirection as placeholder for complex assignment
        setView('admissions');
        onClose();
    };

    const handleUpdateRegistry = (level: string) => {
        // For HODs, this triggers the bulk upload view shortcut
        setView('admissions');
        onClose();
    };

    const handlePostNotice = (moduleName: string) => {
        setNoticingModule(moduleName);
    };

    const submitModuleNotice = () => {
        if (!noticingModule || !noticeTitle || !noticeContent) return;
        addModuleNotice({
            moduleId: noticingModule,
            title: noticeTitle,
            content: noticeContent,
            date: new Date().toISOString(),
            author: user?.name || 'Academic Office'
        });
        setNoticingModule(null);
        setNoticeTitle('');
        setNoticeContent('');
        alert(`Notice broadcasted to ${noticingModule} students.`);
    };

    const getCurriculum = (level: string) => {
        // Mock curriculum logic
        const baseModules = [
            "Anatomy & Phys", "Foundations of Medicine", "Professional Ethics",
            "Public Health", "Pharmacology I", "Clinical Basics"
        ];
        if (level === 'NTA 5') return baseModules.map(m => m.replace('I', 'II').replace('Basics', 'Intermediate'));
        if (level === 'NTA 6') return baseModules.map(m => m.replace('Foundations', 'Advanced').replace('Basics', 'Clinical Rotation'));
        return baseModules;
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-[100] overflow-y-auto animate-in fade-in slide-in-from-bottom-10 duration-500 scroll-smooth">
            
            {/* Subject Notice Modal */}
            {noticingModule && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-12 shadow-sm animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h5 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight">Post Subject Notice</h5>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">Target Module: {noticingModule}</p>
                            </div>
                            <button onClick={() => setNoticingModule(null)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Heading</label>
                                <input 
                                    type="text" 
                                    value={noticeTitle}
                                    onChange={e => setNoticeTitle(e.target.value)}
                                    placeholder="e.g. Assignment Deadline Update"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none font-bold text-sm text-slate-800 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Message</label>
                                <textarea 
                                    value={noticeContent}
                                    onChange={e => setNoticeContent(e.target.value)}
                                    placeholder="Explain the update to your students..."
                                    className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none font-medium text-sm text-slate-600 transition-all leading-relaxed"
                                />
                            </div>
                            <button onClick={submitModuleNotice} className="w-full bg-amber-600 text-white font-black py-5 rounded-[2.5rem] shadow-sm shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 duration-200 uppercase tracking-widest text-xs">
                                Broadcast Notice Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Overlay Modal (For View/Download/Upload) */}
            {/* Removed Module Overview Modal */}

            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-2xl border-b border-slate-100 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between gap-8">
                    <div className="flex items-center min-w-0">
                        <button 
                            onClick={onClose}
                            className="p-3.5 mr-6 rounded-[1.25rem] bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight truncate leading-none">{course.title}</h2>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{course.code}</span>
                                <span className="text-slate-200 text-xs">•</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{department?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200/50">
                        {[
                            { id: 'curriculum', label: 'Academic' },
                            { id: 'faculty', label: 'Facilitators' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-cyan-700 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {activeTab === 'curriculum' && (
                    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <LevelSection 
                            level="NTA 4" 
                            sm1Modules={getCurriculum('NTA 4').slice(0,3)} 
                            sm2Modules={getCurriculum('NTA 4').slice(3,6)} 
                            lecturers={lecturers}
                            students={students}
                            moduleNotices={moduleNotices}
                            onAction={handleAction}
                            canUpload={canUpload}
                            onUpload={handleUpload}
                            canAssign={canAssign}
                            isHod={isHod}
                            onUpdateRegistry={handleUpdateRegistry}
                            onAssignLecturer={handleAssignLecturer}
                            onPostNotice={handlePostNotice}
                        />
                        <LevelSection 
                            level="NTA 5" 
                            sm1Modules={getCurriculum('NTA 5').slice(0,3)} 
                            sm2Modules={getCurriculum('NTA 5').slice(3,6)} 
                            lecturers={lecturers}
                            students={students}
                            moduleNotices={moduleNotices}
                            onAction={handleAction}
                            canUpload={canUpload}
                            onUpload={handleUpload}
                            canAssign={canAssign}
                            isHod={isHod}
                            onUpdateRegistry={handleUpdateRegistry}
                            onAssignLecturer={handleAssignLecturer}
                            onPostNotice={handlePostNotice}
                        />
                        <LevelSection 
                            level="NTA 6" 
                            sm1Modules={getCurriculum('NTA 6').slice(0,3)} 
                            sm2Modules={getCurriculum('NTA 6').slice(3,6)} 
                            lecturers={lecturers}
                            students={students}
                            moduleNotices={moduleNotices}
                            onAction={handleAction}
                            canUpload={canUpload}
                            onUpload={handleUpload}
                            canAssign={canAssign}
                            isHod={isHod}
                            onUpdateRegistry={handleUpdateRegistry}
                            onAssignLecturer={handleAssignLecturer}
                            onPostNotice={handlePostNotice}
                        />
                    </div>
                )}

                {activeTab === 'faculty' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 bg-white shadow-sm border border-slate-100 p-8 rounded-[2.5rem]">
                        <LecturersView />
                    </div>
                )}
            </div>
        </div>
    );
};
