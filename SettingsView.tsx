
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const textBase = "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border";
    
    // Fallback if role happens to be empty
    if (!role) {
        return <span className={`${textBase} bg-slate-50 text-slate-400 border-slate-100 shadow-[0_0_12px_rgba(200,200,200,0.1)]`}>Unassigned</span>;
    }

    const colors: Record<string, string> = {
        'Principal': 'bg-purple-50 text-purple-600 border-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
        'HOD': 'bg-cyan-50 text-cyan-600 border-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
        'Teacher': 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-[0_0_12px_rgba(37,99,235,0.3)]',
        'Lecturer': 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-[0_0_12px_rgba(37,99,235,0.3)]',
        'President': 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        'Minister': 'bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    };
    
    // Default to amber if it's some other government title string like "Minister of Health"
    const isMinister = role.toLowerCase().includes('minister');
    const colorClass = colors[role] || (isMinister ? colors['Minister'] : 'bg-slate-50 text-slate-500 border-slate-100 shadow-[0_0_12px_rgba(148,163,184,0.3)]');
    
    return (
        <span className={`${textBase} ${colorClass}`}>
            {role}
        </span>
    );
};

const StaffSecuritySettings: React.FC = () => {
    const { staffConfirmationCode, updateStaffCode } = useAuth();
    const [newCode, setNewCode] = useState(staffConfirmationCode || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateStaffCode(newCode);
            setIsSaving(false);
            toast.success('Protocol update successful.');
            alert('Staff confirmation code updated successfully.');
        }, 600);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-[2.5rem] p-10 shadow-sm border border-emerald-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center space-x-6 mb-8">
                <div className="p-4 bg-white text-emerald-600 rounded-[2.5rem] shadow-sm border border-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight">Staff Verification Protocol</h3>
                    <p className="text-slate-500 font-medium mt-1">Manage the secret key required for new faculty and administration accounts.</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Current Staff Confirmation Secret</label>
                    <input 
                        type="text" 
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full p-5 bg-white border-2 border-emerald-100 rounded-[2.5rem] focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-slate-800 font-black tracking-widest shadow-sm"
                        placeholder="Secret verification word..."
                    />
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving || newCode === staffConfirmationCode}
                    className="md:self-end px-10 py-5 bg-cyan-600 text-white font-black rounded-[2.5rem] hover:bg-cyan-700 transition-all active:scale-95 duration-200 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-[10px] shadow-sm shadow-cyan-600/20"
                >
                    {isSaving ? 'Updating...' : 'Update Protocol'}
                </button>
            </div>
        </div>
    );
};

const ManageDepartmentHODs: React.FC = () => {
    const { lecturers, departments, updateUser } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAssignHOD = async (deptId: string, newLecturerId: string, oldHODId?: string) => {
        if (!newLecturerId) return;
        setProcessingId(deptId);
        
        setTimeout(async () => {
            try {
                // Demote old HOD to Teacher
                if (oldHODId && oldHODId !== newLecturerId) {
                    await updateUser(oldHODId, { role: 'Lecturer', title: '' }); // Clear title on demotion
                }
                // Promote new one to HOD and set title
                await updateUser(newLecturerId, { 
                    role: 'HOD', 
                    departmentId: deptId,
                    title: `HOD of ${deptId}`
                });
                toast.success("HOD assigned successfully.");
            } catch (error) {
                toast.error("Failed to assign HOD.");
            } finally {
                setProcessingId(null);
            }
        }, 1000); // Simulated delay
    };

    return (
        <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Department HOD Assignment</h3>
                    <p className="text-slate-500 font-medium mt-1">Structured leadership assignment per academic department.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => {
                    const currentHOD = lecturers.find(l => l.role === 'HOD' && (l.departmentId === dept.id || l.title?.includes(dept.id)));
                    // Show ALL lecturers in the dropdown as requested
                    const allStaffOptions = lecturers.filter(l => l.role !== 'Principal');

                    return (
                        <div key={dept.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-sm transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept.id}</span>
                            </div>

                            <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 mb-2">{dept.name}</h4>
                            
                            <div className="flex-1 mt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current HOD</p>
                                {currentHOD ? (
                                    <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6 animate-in fade-in duration-300">
                                        <img src={currentHOD.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                        <div className="ml-3 overflow-hidden">
                                            <p className="text-sm font-black text-slate-900 truncate">{currentHOD.name}</p>
                                            <div className="mt-1">
                                                <RoleBadge role="HOD" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 mb-6 text-center animate-in fade-in duration-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Head Assigned</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 relative">
                                <select 
                                    className="w-full text-sm font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:ring-4 focus:ring-cyan-50 focus:border-cyan-300 bg-slate-50 text-slate-700 outline-none appearance-none"
                                    value={currentHOD?.id || ""}
                                    onChange={(e) => handleAssignHOD(dept.id, e.target.value, currentHOD?.id)}
                                    disabled={processingId === dept.id}
                                >
                                    <option value="" disabled>Assign New Head...</option>
                                    {allStaffOptions.map(l => (
                                        <option key={l.id} value={l.id}>{l.name} ({l.departmentId || 'No Dept'})</option>
                                    ))}
                                </select>
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                
                                {processingId === dept.id && (
                                    <div className="flex items-center justify-center space-x-2 animate-pulse mt-3 bg-cyan-50 py-2 rounded-xl border border-cyan-100">
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Updating Department Head...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ManageStudentTitles: React.FC = () => {
    const { students, updateUser } = useAuth();
    
    const handleTitleChange = (studentId: string, newTitle: string) => {
        updateUser(studentId, { title: newTitle });
        toast.success("Title updated.");
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 border-b border-slate-50">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Student Leadership</h3>
                <p className="text-slate-400 mt-2 font-medium">Assign official government titles to active student leaders.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-50">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Representative</th>
                            <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Title</th>
                            <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title Update</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                        {students.map(student => (
                             <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-12 w-12 rounded-full border-2 border-slate-100 group-hover:border-emerald-200 transition-colors shadow-sm" src={student.avatar} alt="" />
                                        <div className="ml-5">
                                            <div className="text-base font-bold text-slate-900 leading-none">{student.name}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{student.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <RoleBadge role={student.title || ''} />
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap text-right">
                                    <input 
                                        type="text"
                                        placeholder="e.g. Minister of Health"
                                        defaultValue={student.title || ''} 
                                        onBlur={(e) => handleTitleChange(student.id, e.target.value)}
                                        className="text-[10px] uppercase tracking-widest font-black border-2 border-slate-100 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none w-64 transition-all bg-slate-50 text-slate-700 placeholder:text-slate-300"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const LeadershipView: React.FC = () => {
    const { user } = useAuth();
    
    // Strict rules as per instructions
    const isPrincipal = user?.role === 'Principal';
    const isPresident = user?.title === 'President';
    
    return (
        <div className="max-w-6xl mx-auto px-4 pb-12 w-full animate-in fade-in duration-700">
            {isPrincipal && (
                <>
                    <StaffSecuritySettings />
                    <ManageDepartmentHODs />
                </>
            )}
            
            {isPresident && <ManageStudentTitles />}
            
            {!isPrincipal && !isPresident && (
                 <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-20 text-center max-w-2xl mx-auto mt-20">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12 transition-transform hover:scale-110 duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">Security Restriction</h3>
                    <p className="text-slate-500 mt-6 leading-relaxed font-medium text-lg">
                        This administrative module requires high-level clearance. 
                        Only the <span className="text-purple-600 font-black uppercase tracking-widest text-[10px]">College Principal</span> or the 
                        <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px] ml-1">Student President</span> can manage leadership roles.
                    </p>
                    <div className="mt-12 pt-10 border-t border-slate-50">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] bg-red-50 py-2 px-4 rounded-full inline-block">Reference Code: AUTH-403</p>
                    </div>
                </div>
            )}
        </div>
    );
};
