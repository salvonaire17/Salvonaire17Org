
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Course } from '../types';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { improveCourseDescription } from '../services/geminiService';

const CourseCard: React.FC<{ course: Course; onClick: () => void; }> = ({ course, onClick }) => {
    const { departments } = useAuth();
    const departmentName = departments.find(d => d.id === course.departmentId)?.name || 'Unknown Department';

    return (
        <div onClick={onClick} className="bg-white rounded-[2.5rem] shadow-sm p-8 flex flex-col justify-between hover:shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 group overflow-hidden">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight pr-4">{course.title}</h4>
                    <span className="bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-100 flex-shrink-0">{course.code}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">{departmentName}</p>
                
                <div className="relative">
                    <p className="text-sm text-slate-600 h-24 overflow-hidden leading-relaxed font-medium">
                        {course.description}
                    </p>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules: <span className="text-slate-900 ml-1">Curriculum Ready</span></p>
                 <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Explore Portal &rarr;</span>
            </div>
        </div>
    );
};

export const CoursesView: React.FC = () => {
    const { courses } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="mb-12">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Academic Curriculum</h3>
                <p className="text-slate-500 font-medium mt-2 text-lg">Explore specialized NTA Levels and Semester modules offered at MCHAS.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={() => setSelectedCourse(course)} />
                ))}
            </div>
            {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
        </div>
    );
};
