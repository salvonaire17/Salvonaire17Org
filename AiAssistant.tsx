
import React, { useState } from 'react';
import { useDataContext } from '../hooks/useDataContext';
import type { Course } from '../types';
import { generateCourseDescription } from '../services/geminiService';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-sm hover:-translate-y-1 transition-all duration-300">
        <div>
            <div className="flex justify-between items-start">
                <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800">{course.title}</h4>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{course.code}</span>
            </div>
            <p className="text-sm font-medium text-cyan-700 mt-1">{course.departmentId}</p>
            <p className="text-sm text-slate-600 mt-4 h-24 overflow-y-auto">{course.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
            <p className="text-sm text-slate-500">Credits: <span className="font-semibold">{course.credits}</span></p>
            <button className="text-sm font-semibold text-cyan-700 hover:text-indigo-800 transition">View Details</button>
        </div>
    </div>
);

const AddCourseModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { addCourse } = useDataContext();
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [credits, setCredits] = useState(3);
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateDesc = async () => {
        if (!title) {
            alert("Please enter a course title first.");
            return;
        }
        setIsGenerating(true);
        try {
            const generatedDesc = await generateCourseDescription(title, keywords);
            setDescription(generatedDesc);
        } catch (error) {
            console.error(error);
            setDescription("Error generating description.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addCourse({ title, code, departmentId, credits, description });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-2xl transform transition-all">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-6 text-slate-800">Add New Course</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} className="p-2 border rounded-md w-full" required/>
                        <input type="text" placeholder="Course Code (e.g., CS101)" value={code} onChange={e => setCode(e.target.value)} className="p-2 border rounded-md w-full" required/>
                        <input type="text" placeholder="Department ID" value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="p-2 border rounded-md w-full" required/>
                        <input type="number" placeholder="Credits" value={credits} onChange={e => setCredits(Number(e.target.value))} className="p-2 border rounded-md w-full" required/>
                    </div>
                    <div>
                        <textarea placeholder="Course Description" value={description} onChange={e => setDescription(e.target.value)} className="p-2 border rounded-md w-full h-28" required/>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Add Course</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const Courses: React.FC = () => {
    const { courses } = useDataContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Course Catalog</h3>
                    <p className="text-sm text-slate-500 mt-1">Browse and manage all available courses.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-300">
                    + Add New Course
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
            {isModalOpen && <AddCourseModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};