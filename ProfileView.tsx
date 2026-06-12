
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Role, StudentDetails, LecturerDetails, Course } from '../types';

import PremiumDropdown from '../components/PremiumDropdown';

export const CompleteProfileView: React.FC = () => {
    const { user, courses, departments, updateUser, setView } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [gender, setGender] = useState<'Male' | 'Female'>((user as any)?.gender || 'Female');
    const [courseId, setCourseId] = useState(user?.courseId || (courses[0]?.id || ''));
    const [level, setLevel] = useState((user as any)?.level || 'NTA 4');
    const [semester, setSemester] = useState<'SM1' | 'SM2'>((user as any)?.currentSemester || 'SM1');
    const [deptId, setDeptId] = useState(user?.departmentId || (departments[0]?.id || ''));
    const [modules, setModules] = useState<string[]>(
        user && 'modules' in user ? (user as LecturerDetails).modules || [] : []
    );
    const [phone, setPhone] = useState(user?.phone || '');
    const [specialization, setSpecialization] = useState(user?.specialization || '');
    const [regNumber, setRegNumber] = useState((user as any)?.nactvetRegNo || '');

    const isFaculty = user?.role === 'Lecturer' || user?.role === 'HOD';
    const isAdministrative = user?.role === 'Warden' || user?.role === 'Bursar' || user?.role === 'Admission Officer' || user?.role === 'Secretary';

    useEffect(() => {
        if (user?.role === 'HOD' && courseId) {
            const selectedCourse = courses.find(c => c.id === courseId);
            if (selectedCourse) setDeptId(selectedCourse.departmentId);
        }
    }, [courseId, user?.role, courses]);

    if (!user) return null;

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const updates: any = {
            isProfileComplete: true,
            phone: phone,
            departmentId: deptId,
            specialization: specialization,
            gender: gender
        };

        if (user.role === 'Student') {
            updates.courseId = courseId;
            updates.level = level;
            updates.currentSemester = semester;
            updates.nactvetRegNo = regNumber;
            const course = courses.find(c => c.id === courseId);
            if (course) updates.departmentId = course.departmentId;
        } else if (user.role === 'HOD') {
            updates.courseId = courseId;
            updates.modules = modules;
        } else if (user.role === 'Lecturer') {
            updates.modules = modules;
        }

        setTimeout(() => {
            updateUser(user.id, updates);
            setIsLoading(false);
            setView('dashboard');
        }, 1200);
    };

    const handleToggleModule = (id: string) => {
        setModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-cyan-100">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Setup Your Profile</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">College Registry Calibration</p>
                </div>

                <form onSubmit={handleComplete} className="space-y-8">
                    
                    <PremiumDropdown 
                        label="Gender"
                        placeholder="Select Gender"
                        options={[
                            { id: 'Male', label: 'Male' },
                            { id: 'Female', label: 'Female' }
                        ]}
                        selectedId={gender}
                        onSelect={setGender as any}
                    />

                    {user.role === 'Student' && (
                        <>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. MCHAS/001"
                                    value={regNumber}
                                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500/20 font-bold text-slate-700 outline-none uppercase transition-all"
                                />
                            </div>
                            <PremiumDropdown 
                                label="Degree Program / Course"
                                placeholder="Select Course"
                                options={courses.map(c => ({ id: c.id, label: c.title }))}
                                selectedId={courseId}
                                onSelect={setCourseId}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PremiumDropdown 
                                    label="Current NTA Level"
                                    placeholder="Select Level"
                                    options={[
                                        { id: 'NTA 4', label: 'NTA 4' },
                                        { id: 'NTA 5', label: 'NTA 5' },
                                        { id: 'NTA 6', label: 'NTA 6' }
                                    ]}
                                    selectedId={level as string}
                                    onSelect={setLevel}
                                />
                                <PremiumDropdown 
                                    label="Current Semester"
                                    placeholder="Select Semester"
                                    options={[
                                        { id: 'SM1', label: 'Semester I' },
                                        { id: 'SM2', label: 'Semester II' }
                                    ]}
                                    selectedId={semester}
                                    onSelect={setSemester as any}
                                />
                            </div>
                        </>
                    )}

                    {user?.role === 'Lecturer' && (
                        <div className="space-y-6">
                             <PremiumDropdown 
                                label="Primary Department"
                                placeholder="Select Department"
                                options={departments.map(d => ({ id: d.id, label: d.name }))}
                                selectedId={deptId}
                                onSelect={(id) => {
                                    setDeptId(id);
                                    // Filter selected modules to keep only the ones belonging to the newly selected department
                                    setModules(prev => prev.filter(modId => {
                                        const c = courses.find(course => course.id === modId);
                                        return c?.departmentId === id;
                                    }));
                                }}
                            />

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Courses / Modules You Teach</label>
                                <p className="text-xs font-bold text-slate-400">Select the courses you teach to associate with your profile and department.</p>
                                <div className="grid grid-cols-1 gap-3.5 max-h-64 overflow-y-auto pr-2 scrollbar-hide mt-2">
                                    {courses.filter(c => c.departmentId === deptId).length === 0 ? (
                                        <p className="text-xs font-bold text-slate-400 italic bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">No courses currently registered under this department.</p>
                                    ) : (
                                        courses.filter(c => c.departmentId === deptId).map(course => {
                                            const isSelected = modules.includes(course.id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={course.id}
                                                    onClick={() => handleToggleModule(course.id)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-cyan-50/50 border-cyan-500 text-cyan-800'
                                                            : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block">{course.code}</span>
                                                        <p className="text-sm font-black text-slate-800">{course.title}</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                        isSelected ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-200 bg-white'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {user?.role === 'HOD' && (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                             <p className="text-sm font-bold text-slate-500 italic text-center">As an HOD, your department and modules are assigned by the Principal, Vice Principal, or Academic Officer.</p>
                        </div>
                    )}

                    {/* Shared Contact Info */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Mobile Contact</label>
                        <input 
                            type="tel" 
                            required
                            placeholder="+255 7XX XXX XXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500/20 font-semibold text-slate-700 outline-none text-base transition-all"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-black transition-all active:scale-95 duration-200 uppercase tracking-widest text-[10px] disabled:opacity-50"
                    >
                        {isLoading ? 'Finalizing Profile...' : 'Authorize & Start Session'}
                    </button>
                </form>
            </div>
        </div>
    );
};
