import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StaffWorkflowLayout } from '../components/StaffWorkflowLayout';
import { StudentDetails, Course } from '../types';
import { doc, updateDoc, collection, query, where, onSnapshot, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

// UI Helpers
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden ${className}`}>
        {children}
    </div>
);

const StatCard: React.FC<{ title: string; count: number; color: string; icon: React.ReactNode }> = ({ title, count, color, icon }) => (
    <Card className="p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: `${color}20`, color }}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">{count}</h4>
        </div>
    </Card>
);

export const AdmissionsView: React.FC = () => {
    const { user, role, courses, resetAllRegistrations, purgeUnfamiliarUser, users: allUsers, updateStudentReportingStatus, actionLoadingId } = useAuth();
    const [students, setStudents] = useState<StudentDetails[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'registered' | 'settings' | 'accounts'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 20;
    
    const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);

    const isAdmissionOfficer = useMemo(() => {
        const staffRoles = ['Admission Officer', 'Admission', 'Admin', 'Lecturer', 'HOD', 'Principal', 'Vice Principal', 'Academic Officer', 'System Administrator', 'Academic Registry', 'Secretary'];
        return staffRoles.includes(user?.role || '');
    }, [user?.role]);

    useEffect(() => {
        if (!isAdmissionOfficer) return;
        
        const q = query(collection(db, 'users'), where('role', '==', 'Student'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data: StudentDetails[] = [];
            snapshot.forEach(d => {
               const studentData = d.data() as StudentDetails;
               data.push({
                   id: d.id,
                   ...studentData,
                   reportingStatus: studentData.registrationStatus === 'Registered' ? 'Reported' : (studentData.reportingStatus || 'Pending'),
                   registrationStatus: studentData.registrationStatus || 'Unregistered'
               });
            });
            setStudents(data);
            setLoading(false);
        }, (err) => console.warn("Students snapshot error", err.message));
        return () => unsub();
    }, [isAdmissionOfficer]);

    const stats = useMemo(() => {
        const total = students.length;
        const pending = students.filter(s => s.reportingStatus === 'Pending').length;
        const reported = students.filter(s => s.reportingStatus === 'Reported').length;
        const rejected = students.filter(s => s.reportingStatus === 'Rejected').length;
        const registered = students.filter(s => s.registrationStatus === 'Registered').length;
        
        const byCourse = courses.map(c => ({
            name: c.code,
            value: students.filter(s => s.courseId === c.id).length
        })).filter(c => c.value > 0);

        return { total, pending, reported, rejected, registered, byCourse };
    }, [students, courses]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (s.admissionNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            if (activeTab === 'registered') {
                return matchesSearch && s.registrationStatus === 'Registered';
            }
            
            const matchesStatus = statusFilter === 'All' || s.reportingStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [students, searchQuery, statusFilter, activeTab]);

    const registeredStudents = useMemo(() => {
        return students.filter(s => s.registrationStatus === 'Registered');
    }, [students]);

    // Check for duplicates
    const duplicateMap = useMemo(() => {
        const counts: Record<string, number> = {};
        students.forEach(s => {
            const key = (s.email || s.admissionNumber || s.id || '').toLowerCase().trim();
            if (key) counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [students]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * studentsPerPage;
        return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
    }, [filteredStudents, currentPage]);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const [isBulkApproving, setIsBulkApproving] = useState(false);

    const bulkApproveStudents = async () => {
        const toApprove = filteredStudents.filter(s => s.reportingStatus !== 'Reported');
        if (toApprove.length === 0) {
            toast.error('No pending students found in the current view.');
            return;
        }

        if (!window.confirm(`Are you sure you want to approve reporting for ${toApprove.length} students?`)) {
            return;
        }

        setIsBulkApproving(true);
        const approvePromise = (async () => {
            const batch = writeBatch(db);
            const timestamp = new Date().toISOString();

            toApprove.forEach(student => {
                const studentRef = doc(db, 'users', student.id);
                batch.update(studentRef, { reportingStatus: 'Reported', reportingDate: timestamp, reviewedBy: user?.name, updatedAt: timestamp });

                const logRef = doc(collection(db, 'reportingLogs'));
                batch.set(logRef, {
                    actionType: 'APPROVE_REPORTING',
                    studentId: student.id,
                    officerName: user?.name,
                    timestamp,
                    details: `Approved reporting via Bulk Approve`
                });

                const notificationRef = doc(collection(db, 'notifications'));
                batch.set(notificationRef, {
                    userId: student.id,
                    title: `Reporting Status Approved`,
                    message: `Your reporting for the academic year has been approved by the Admin Officer.`,
                    type: 'APPROVAL',
                    read: false,
                    createdAt: timestamp
                });
            });

            await batch.commit();
        })();

        toast.promise(approvePromise, {
            loading: 'Approving students...',
            success: `Successfully approved reporting for ${toApprove.length} students.`,
            error: 'An error occurred during bulk approval.'
        });

        try {
            await approvePromise;
        } catch (error) {
            console.error("Bulk approval error:", error);
        } finally {
            setIsBulkApproving(false);
        }
    };


    if (!isAdmissionOfficer) {
        return <div className="p-8 text-center text-slate-500">You do not have permission to access the reporting management system.</div>;
    }

    const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden isolate">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-cyan-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Reporting Management</h3>
                    <p className="text-slate-400 font-medium mt-2">Manage incoming student reporting and registrations.</p>
                </div>
                <div className="flex bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'students' ? 'bg-cyan-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        Reporting
                    </button>
                    <button 
                        onClick={() => setActiveTab('accounts')}
                        className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'accounts' ? 'bg-cyan-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        Accounts
                    </button>
                    <button 
                        onClick={() => setActiveTab('registered')}
                        className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'registered' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        Registered
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        System Tools
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : activeTab === 'dashboard' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatCard title="Total Accounts" count={stats.total} color="#64748b" icon={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        } />
                        <StatCard title="Fully Registered" count={stats.registered} color="#0891b2" icon={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        } />
                        <StatCard title="Reported Only" count={stats.reported} color="#10b981" icon={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        } />
                        <StatCard title="Pending Reporting" count={stats.pending} color="#f59e0b" icon={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        } />
                        <StatCard title="Rejected" count={stats.rejected} color="#ef4444" icon={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        } />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8">
                            <h4 className="text-lg font-black text-slate-800 mb-6">Reporting Status Distribution</h4>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
                                        { name: 'Reported', count: stats.reported, fill: '#10b981' },
                                        { name: 'Rejected', count: stats.rejected, fill: '#ef4444' }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}/>
                                        <Bar dataKey="count" radius={[8, 8, 8, 8]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-8">
                            <h4 className="text-lg font-black text-slate-800 mb-6">Students by Course</h4>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.byCourse} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                            {stats.byCourse.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                                {stats.byCourse.map((c, i) => (
                                    <div key={c.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-xs font-semibold text-slate-600">{c.name} ({c.value})</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </motion.div>
            ) : activeTab === 'accounts' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <StaffWorkflowLayout
                        title="All Student Accounts"
                        officeRole="Academic Registry"
                        students={students}
                        courses={courses}
                        waitingFilter={() => true} // Show everyone
                        solvedFilter={() => false}
                        onProcessStudent={(s) => setSelectedStudent(s)}
                        onViewDetails={(s) => setSelectedStudent(s)}
                    />
                </motion.div>
            ) : activeTab === 'registered' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <StaffWorkflowLayout
                        title="Registered Directory"
                        officeRole="Admission Officer"
                        students={registeredStudents}
                        courses={courses}
                        waitingFilter={() => false}
                        solvedFilter={() => true}
                        onProcessStudent={(s) => setSelectedStudent(s)}
                        onViewDetails={(s) => setSelectedStudent(s)}
                    />
                </motion.div>
            ) : activeTab === 'settings' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
                    <Card className="p-8 border-red-100 bg-red-50/10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div>
                                <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 tracking-tight">Danger Zone: Start New Semester Registration (Reset)</h4>
                                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                    Clicking the button below will initiate a <span className="font-bold text-red-600">Global Registration Reset</span>. 
                                    This action will disconnect all currently registered students' clearance status and force 
                                    every student to restart the physical and digital registration workflow from Step 1 for the new semester.
                                </p>
                                <div className="mt-8 p-6 bg-white rounded-2xl border border-red-100 italic text-xs text-red-500 font-bold">
                                    Warning: This operation is irreversible and will affect live institutional data. 
                                    Only perform this at the start of a new academic semester/session.
                                </div>
                                <button 
                                    onClick={async () => {
                                        if (window.confirm("CRITICAL ACTION: Are you 100% sure you want to reset registration for ALL students?\n\nThis will force everyone back to Step 1 and clear their clearance approvals.")) {
                                            const confirmText = window.prompt("To proceed, type 'RESET ALL' in the box below:");
                                            if (confirmText === 'RESET ALL') {
                                                await resetAllRegistrations();
                                                setActiveTab('dashboard');
                                            } else {
                                                toast("Action cancelled. Confirmation text did not match.");
                                            }
                                        }
                                    }}
                                    className="mt-6 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm shadow-red-200 transition-all active:scale-95 duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Start New Semester (Reset All)
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-cyan-700 rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 tracking-tight">Global User Management</h4>
                                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                                    Administrative override to remove any user account from the system (Students, Staff, or Parents).
                                </p>
                                
                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Search by Name, Email, or Reg Number..." 
                                        className="flex-1 px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        id="globalUserSearch"
                                    />
                                    <button 
                                        onClick={async () => {
                                            const input = document.getElementById('globalUserSearch') as HTMLInputElement;
                                            const queryVal = input?.value?.trim()?.toLowerCase();
                                            if (!queryVal) return toast.error("Please enter a search term.");

                                            const foundUsers = allUsers.filter((u: any) => 
                                                u.name?.toLowerCase().includes(queryVal) ||
                                                u.email?.toLowerCase().includes(queryVal) || 
                                                u.id === queryVal ||
                                                (u.admissionNumber && u.admissionNumber.toLowerCase().includes(queryVal)) ||
                                                (u.nactvetRegNo && u.nactvetRegNo.toLowerCase().includes(queryVal))
                                            );
                                            
                                            if (foundUsers.length === 0) {
                                                return toast.error("No user found.");
                                            }

                                            if (foundUsers.length > 1) {
                                                toast.error(`Found ${foundUsers.length} matches. Please be more specific (e.g. use full name or full reg number).`);
                                                // For now, we'll just show the count. We could implement a picker modal but simplicity first.
                                                return;
                                            }

                                            const foundUser = foundUsers[0];

                                            if (window.confirm(`DANGER: Are you sure you want to PERMANENTLY remove ${foundUser.name} (${foundUser.role})? \n\nCredentials: ${foundUser.email} / ${foundUser.admissionNumber || foundUser.nactvetRegNo || 'No Reg No'}`)) {
                                                try {
                                                    await purgeUnfamiliarUser(foundUser.id);
                                                    input.value = '';
                                                } catch (error) {
                                                    console.error("Purge failed:", error);
                                                }
                                            }
                                        }}
                                        className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95 duration-200"
                                    >
                                        Search User
                                    </button>
                                </div>
                                <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Note: Searching by Registration Number or Full Name is the safest way to find the correct user.
                                </p>

                                <div className="mt-8 border-t border-slate-100 pt-8">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Master User List ({allUsers.length})</h5>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-50">
                                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Name & Role</th>
                                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Identifier</th>
                                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {allUsers.slice(0, 10).map(u => (
                                                    <tr key={u.id} className="group">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                                                                    {u.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                                                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{u.role}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <p className="text-xs font-bold text-slate-500">{u.nactvetRegNo || u.admissionNumber || u.email || 'No Identifier'}</p>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <button 
                                                                onClick={async () => {
                                                                    if (window.confirm(`DANGER: Are you sure you want to PERMANENTLY remove ${u.name}?`)) {
                                                                        await purgeUnfamiliarUser(u.id);
                                                                    }
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Delete Account"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {allUsers.length > 10 && (
                                            <p className="mt-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                Showing top 10 results. Use the search bar above to find a specific user by name or registration number.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <StaffWorkflowLayout
                        title="Admission Workflow"
                        officeRole="Admission Officer"
                        students={students}
                        courses={courses}
                        waitingFilter={(s) => s.reportingStatus !== 'Reported'}
                        solvedFilter={(s) => s.reportingStatus === 'Reported'}
                        onProcessStudent={(s) => setSelectedStudent(s)}
                        onViewDetails={(s) => setSelectedStudent(s)}
                    />
                </motion.div>
            )}

            {/* Student Details Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedStudent(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] bg-white rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={selectedStudent.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-white border border-slate-200" />
                                        {selectedStudent.reportingStatus === 'Reported' && (
                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm" title="Admission Approved">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 tracking-tight">{selectedStudent.name}</h3>
                                        <p className="text-sm font-medium text-slate-500">{courses.find(c=>c.id === selectedStudent.courseId)?.title}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                                <div className="space-y-8">
                                    {/* Personal & Contact Information */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Personal & Contact Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Full Name</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Gender</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.gender || 'Not Provided'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Email Address</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Phone Number</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.phone || 'Not Provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent / Guardian Information */}
                                    {selectedStudent.parentDetails && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Parent / Guardian Info</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyan-50 p-6 rounded-[2.5rem] border border-cyan-100">
                                                <div>
                                                    <span className="block text-xs font-semibold text-indigo-400">Guardian Name</span>
                                                    <span className="block text-sm font-bold text-slate-800">{selectedStudent.parentDetails.parentName}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-semibold text-indigo-400">Contact Number</span>
                                                    <span className="block text-sm font-bold text-slate-800">{selectedStudent.parentDetails.parentPhone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Registration Details */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registration Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Course</span>
                                                <span className="block text-sm font-bold text-slate-800">{courses.find(c => c.id === selectedStudent.courseId)?.title || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Academic Year</span>
                                                <span className="block text-sm font-bold text-slate-800">{new Date().getFullYear()}/{new Date().getFullYear()+1}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Admission Number</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.admissionNumber || 'Not Assigned'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Registration Number</span>
                                                <span className="block text-sm font-bold text-slate-800">{selectedStudent.nactvetRegNo || 'Not Assigned'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Reporting Date</span>
                                                <span className="block text-sm font-bold text-slate-800">
                                                    {selectedStudent.reportingDate ? new Date(selectedStudent.reportingDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-400">Reporting Status</span>
                                                <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    selectedStudent.reportingStatus === 'Reported' ? 'bg-emerald-100 text-emerald-700' :
                                                    selectedStudent.reportingStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {selectedStudent.reportingStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-slate-100 bg-white flex flex-wrap items-center justify-end gap-3 flex-shrink-0">
                                <button 
                                    disabled={actionLoadingId === selectedStudent.id}
                                    onClick={async () => {
                                        if (window.confirm(`PERMANENT DELETION: Are you sure you want to remove ${selectedStudent.name} and all their associated data from the system?`)) {
                                            await purgeUnfamiliarUser(selectedStudent.id);
                                            setSelectedStudent(null);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-all mr-auto"
                                >
                                    Delete Account
                                </button>
                                <button 
                                    disabled={actionLoadingId === selectedStudent.id}
                                    onClick={() => {
                                        if (window.confirm("Reset this student back to pending reporting status?")) {
                                            updateStudentReportingStatus(selectedStudent.id, 'Pending');
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all disabled:opacity-50"
                                >
                                    Reset Status
                                </button>
                                <button 
                                    disabled={actionLoadingId === selectedStudent.id}
                                    onClick={() => {
                                        const reason = window.prompt("Enter rejection reason:");
                                        if (reason) {
                                            updateStudentReportingStatus(selectedStudent.id, 'Rejected', reason);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-red-500 shadow-sm shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button 
                                    disabled={actionLoadingId === selectedStudent.id}
                                    onClick={() => {
                                        if (window.confirm("Approve this student's reporting?\nThe student will officially be marked as reported for the academic year.")) {
                                            updateStudentReportingStatus(selectedStudent.id, 'Reported');
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-emerald-500 shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                    {actionLoadingId === selectedStudent.id ? 'Processing...' : 'Approve Reporting'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
