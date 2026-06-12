
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Complaint } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
    AlertTriangle, 
    Clock, 
    CheckCircle2, 
    Trash2, 
    Filter,
    MessageSquare,
    Search
} from 'lucide-react';

export const ComplaintsView: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useAuth();
    useEffect(() => {
        if (!user) return;
        
        let q = query(
            collection(db, 'complaints'),
            orderBy('createdAt', 'desc')
        );

        // If not an admin/staff, only show their own complaints
        if (!['Principal', 'Admin', 'HOD', 'Admission Officer', 'Academic Officer'].includes(user.role)) {
            q = query(q, where('userId', '==', user.id));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Complaint[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Complaint & { status: string });
            });
            setComplaints(data);
            setLoading(false);
        }, (err) => console.warn("Complaints snapshot error", err.message));

        return () => unsubscribe();
    }, [user]);

    const filteredComplaints = complaints.filter(c => {
        const matchesFilter = filter === 'all' || (c as any).status === filter;
        const matchesSearch = c.text.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleResolve = async (id: string) => {
        try {
            await updateDoc(doc(db, 'complaints', id), {
                status: 'resolved'
            });
        } catch (error) {
            console.error("Error resolving complaint:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this complaint?")) return;
        try {
            await deleteDoc(doc(db, 'complaints', id));
        } catch (error) {
            console.error("Error deleting complaint:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="text-cyan-700" size={32} />
                        Campus Feedback
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Anonymous complaints and issues reported by students & staff.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    {(['pending', 'resolved', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-slate-900 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-700 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-800"
                />
            </div>

            {/* Complaints List */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredComplaints.map((complaint, idx) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-sm hover:border-cyan-100 transition-all group"
                        >
                            <div className="flex items-start gap-5">
                                <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    (complaint as any).status === 'resolved' 
                                    ? 'bg-emerald-50 text-emerald-500' 
                                    : 'bg-rose-50 text-rose-500'
                                } group-hover:scale-110 transition-transform`}>
                                    {(complaint as any).status === 'resolved' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                (complaint as any).status === 'resolved' 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-rose-100 text-rose-700 font-bold'
                                            }`}>
                                                {(complaint as any).status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {new Date(complaint.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {(complaint as any).status === 'pending' && (
                                                <button 
                                                    onClick={() => handleResolve(complaint.id)}
                                                    className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                                                    title="Mark as Resolved"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(complaint.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">
                                        {complaint.text}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredComplaints.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Feedback Found</h3>
                        <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
