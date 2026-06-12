
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import type { LecturerDetails } from '../types';
import { Users } from 'lucide-react';

const LecturerProfileModal: React.FC<{ lecturer: LecturerDetails; onClose: () => void }> = ({ lecturer, onClose }) => {
    const { user, departments, courses, promoteToHOD, purgeUnfamiliarUser, updateUser } = useAuth();
    const dept = departments.find(d => d.id === lecturer.departmentId);
    
    // Admin Module Assignment State
    const isAdmin = user?.role === 'Principal' || user?.role === 'Vice Principal' || user?.role === 'Academic Officer';
    const [assignedModules, setAssignedModules] = useState<string[]>(lecturer.modules || []);
    const [isSavingModules, setIsSavingModules] = useState(false);

    const lecturerModules = courses.filter(c => assignedModules.includes(c.id));

    const handleToggleAdminModule = (moduleId: string) => {
        setAssignedModules(prev => 
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const handleSaveModules = async () => {
        setIsSavingModules(true);
        try {
            await updateUser(lecturer.id, { modules: assignedModules });
            toast.success("Module assignments updated successfully");
        } catch (error) {
            toast.error("Failed to update modules");
        } finally {
            setIsSavingModules(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-sm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="relative h-32 sm:h-40 bg-gradient-to-r from-cyan-600 to-teal-500 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row sm:items-end gap-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-sm bg-white flex-shrink-0">
                            <img className="w-full h-full object-cover" src={lecturer.avatar} alt={lecturer.name} />
                        </div>
                        <div className="pb-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{lecturer.title ? `${lecturer.title} ` : ''}{lecturer.name}</h2>
                            <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest mt-2">{lecturer.role}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{dept?.name || 'Academic Faculty'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <a href={`mailto:${lecturer.email}`} className="hover:text-cyan-600 transition-colors">{lecturer.email}</a>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <a href={`tel:${lecturer.phone}`} className="hover:text-cyan-600 transition-colors">{lecturer.phone || 'Not Provided'}</a>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const { addContactsToGoogle } = await import('../services/contacts');
                                                await addContactsToGoogle([{ name: lecturer.name, email: lecturer.email, phone: lecturer.phone, role: lecturer.role }]);
                                                toast.success('Successfully added to Google Contacts');
                                            } catch (err: any) {
                                                toast.error('Failed to add to Google Contacts: ' + (err.message || ''));
                                            }
                                        }}
                                        className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center w-full"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Save to Google Contacts
                                    </button>
                                </div>
                            </div>
                            
                            {lecturer.classTeacherLevel && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Class Leadership</h4>
                                    <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest">Class Teacher: {lecturer.classTeacherLevel}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teaching Modules</h4>
                            {isAdmin ? (
                                <div className="space-y-4">
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {courses.filter(c => c.departmentId === lecturer.departmentId).length > 0 ? (
                                            courses.filter(c => c.departmentId === lecturer.departmentId).map(m => (
                                                <button 
                                                    key={m.id}
                                                    onClick={() => handleToggleAdminModule(m.id)}
                                                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                                                        assignedModules.includes(m.id) 
                                                        ? 'bg-cyan-50 border-cyan-200 text-cyan-800' 
                                                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="font-bold">{m.title}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">{m.code}</p>
                                                    </div>
                                                    {assignedModules.includes(m.id) && (
                                                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-slate-50 text-slate-400 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest rounded-xl border border-slate-100">
                                                No modules in this department
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleSaveModules}
                                        disabled={isSavingModules || JSON.stringify(assignedModules) === JSON.stringify(lecturer.modules)}
                                        className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                                    >
                                        {isSavingModules ? 'Saving...' : 'Save Module Assignments'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {lecturerModules.length > 0 ? (
                                        <div className="space-y-3">
                                            {lecturerModules.map(m => (
                                                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-xs font-bold text-slate-800">{m.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{m.code}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration / Research Focus</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Principal Promotion & Account Deletion Actions */}
                            {isAdmin && (
                                <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500 space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Account Control</h4>
                                    
                                    {(user?.role === 'Principal' || user?.role === 'Vice Principal' || user?.role === 'Academic Officer') && lecturer.role === 'Lecturer' && (
                                        <button 
                                            onClick={async () => {
                                                if (confirm(`Authorize Appointment: Are you sure you want to appoint ${lecturer.name} as Head of Department? This grants full academic coordination permissions.`)) {
                                                    try {
                                                        await promoteToHOD(lecturer.id, lecturer.departmentId || 'unassigned');
                                                        alert("HOD Appointment Confirmed: The lecturer has been promoted and will transition to the HOD interface upon their next activity.");
                                                        onClose();
                                                    } catch (err) {
                                                        alert("Appointment Failed: System error occurred.");
                                                    }
                                                }
                                            }}
                                            className="w-full flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-sm shadow-slate-200 active:scale-[0.98] group"
                                        >
                                            <svg className="w-5 h-5 mr-3 text-amber-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            <span className="text-xs uppercase tracking-[0.2em]">Appoint as HOD</span>
                                        </button>
                                    )}

                                    {/* The user already confirmed they can delete in AuthContext roles, but we double check here too */}
                                    <button 
                                        onClick={async () => {
                                            if (confirm(`PERMANENT TERMINATION: Are you sure you want to permanently delete ${lecturer.name}'s account? This action is IRREVERSIBLE and will revoke all access immediately.`)) {
                                                try {
                                                    await purgeUnfamiliarUser(lecturer.id);
                                                    onClose();
                                                } catch (err) {
                                                    alert("Deletion Failed: Administrative override failed.");
                                                }
                                            }
                                        }}
                                        className="w-full flex items-center justify-center p-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all border border-red-100 active:scale-[0.98] group"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        <span className="text-xs uppercase tracking-[0.2em]">Delete User Account</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LecturerCard: React.FC<{ lecturer: LecturerDetails; onViewProfile: (l: LecturerDetails) => void }> = ({ lecturer, onViewProfile }) => {
    const { departments, courses } = useAuth();
    const dept = departments.find(d => d.id === lecturer.departmentId);
    const lecturerModules = courses.filter(c => (lecturer.modules || []).includes(c.id));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-sm hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner group-hover:border-cyan-100 transition-colors">
                    <img className="w-full h-full object-cover" src={lecturer.avatar} alt={lecturer.name} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-5 h-5 rounded-full shadow-sm"></div>
            </div>
            
            <div className="mb-4">
                <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-cyan-600 transition-colors">{lecturer.title ? `${lecturer.title} ` : ''}{lecturer.name}</h4>
                <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mt-1.5">{lecturer.role}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dept?.name || 'Academic Faculty'}</p>
            </div>

            <div className="w-full border-t border-slate-50 pt-5 mt-1 mb-5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Teaching Modules</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                    {lecturerModules.length > 0 ? lecturerModules.map(m => (
                        <span key={m.id} className="px-2.5 py-0.5 bg-slate-50 text-slate-600 text-[9px] font-bold rounded-lg border border-slate-100">
                            {m.code}
                        </span>
                    )) : (
                        <span className="text-slate-400 text-[10px] italic font-medium">Administration / Research</span>
                    )}
                </div>
            </div>

            <div className="mt-auto w-full space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    {/* Email Action */}
                    <a 
                        href={`mailto:${lecturer.email}`} 
                        className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-all border border-transparent hover:border-cyan-100"
                        title="Send Email"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v10a2 2 0 002 2z" /></svg>
                    </a>
                    
                    {/* Call Action */}
                    <a 
                        href={`tel:${lecturer.phone}`} 
                        className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                        title="Call Lecturer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </a>

                    {/* Message Action */}
                    <a 
                        href={`sms:${lecturer.phone}`} 
                        className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-all border border-transparent hover:border-cyan-100"
                        title="Send SMS"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </a>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                    <button 
                         onClick={async () => {
                             try {
                                 const { addContactsToGoogle } = await import('../services/contacts');
                                 await addContactsToGoogle([{
                                     name: lecturer.name,
                                     email: lecturer.email,
                                     phone: lecturer.phone,
                                     role: lecturer.role
                                 }]);
                                 toast.success('Saved to Google Contacts');
                             } catch (err: any) {
                                 toast.error(err.message || 'Failed to sync to Google Contacts');
                             }
                         }}
                         className="flex items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                     >
                         Save to Contacts
                     </button>
                    <button 
                        onClick={() => onViewProfile(lecturer)}
                        className="flex items-center justify-center p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-all shadow-sm shadow-cyan-100 active:scale-[0.98] font-bold text-[10px] uppercase tracking-widest"
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export const LecturersView: React.FC = () => {
    const { lecturers } = useAuth();
    const [selectedLecturer, setSelectedLecturer] = useState<LecturerDetails | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncContacts = async () => {
        const confirmed = window.confirm('Sync all lecturers to your Google Contacts?');
        if (!confirmed) return;

        setIsSyncing(true);
        try {
            const { addContactsToGoogle } = await import('../services/contacts');
            const contactsList = lecturers.map(l => ({
                name: l.title ? `${l.title} ${l.name}` : l.name,
                email: l.email,
                phone: l.phone,
                role: l.role
            }));
            const count = await addContactsToGoogle(contactsList);
            toast.success(`Successfully synced ${count} contacts!`);
        } catch (err: any) {
            console.error('Failed to sync contacts', err);
            toast.error(err.message || 'Error syncing contacts');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {selectedLecturer && (
                <LecturerProfileModal lecturer={selectedLecturer} onClose={() => setSelectedLecturer(null)} />
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight">Facilitators Directory</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1">Meet the professional educators and administrative leadership of MCHAS.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSyncContacts}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <Users className="w-4 h-4" />
                        {isSyncing ? 'Syncing...' : 'Sync to Google Contacts'}
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Members:</span>
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-bold text-xs">{lecturers.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lecturers.map(lecturer => (
                    <LecturerCard key={lecturer.id} lecturer={lecturer} onViewProfile={setSelectedLecturer} />
                ))}
            </div>
        </div>
    );
};
