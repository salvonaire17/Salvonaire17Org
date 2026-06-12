
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const SubmitComplaint: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [complaint, setComplaint] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!complaint.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'complaints'), {
                text: complaint,
                createdAt: new Date().toISOString(),
                status: 'pending'
            });
            setIsSuccess(true);
            setComplaint('');
            setTimeout(() => {
                setIsSuccess(false);
                setIsExpanded(false);
            }, 3000);
        } catch (error) {
            console.error("Error submitting complaint:", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.button
                        key="button"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setIsExpanded(true)}
                        className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 px-6 rounded-2xl shadow-sm hover:bg-slate-800 transition-all text-xs uppercase tracking-[0.2em]"
                    >
                        <MessageSquare size={18} className="text-cyan-400" />
                        Submit a Complaint
                    </motion.button>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm overflow-hidden relative focus-within:border-slate-300 focus-within:shadow-sm transition-all duration-300 flex flex-col"
                    >
                        {isSuccess ? (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-lg font-black text-slate-800">Submitted Anonymously</h4>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Thank you for your feedback. The administration will review this soon.</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <AlertCircle size={14} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Anonymous Feedback</p>
                                </div>
                                <textarea
                                    value={complaint}
                                    onChange={(e) => setComplaint(e.target.value)}
                                    placeholder="Type your complaint or suggestion here..."
                                    className="w-full min-h-[180px] p-0 bg-transparent border-none text-slate-800 text-[15px] leading-relaxed font-medium placeholder-slate-400 focus:ring-0 outline-none resize-none mb-6 mt-2"
                                />
                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !complaint.trim()}
                                        className="flex-[2] bg-slate-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={14} className="text-cyan-400" />
                                                Submit Issue
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
