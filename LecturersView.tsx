import React from 'react';
import { motion } from 'motion/react';
import { Info, MapPin, Mail, Phone, BookOpen, HeartPulse, GraduationCap, Award } from 'lucide-react';

export const AboutView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-sm">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-600/10 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <BookOpen size={40} className="text-cyan-400" />
                        About MCHAS
                    </h1>
                    <p className="text-slate-300 font-medium max-w-2xl text-lg">
                        Mbeya College of Health and Allied Sciences (MCHAS) — A constituent college of the University of Dar es Salaam, dedicated to advancing health education and research.
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Welcome Note & Background) */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight tracking-tight text-slate-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                                    <Info size={18} />
                                </span>
                                Welcome Note
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                                <p>
                                    Welcome to the Mbeya College of Health and Allied Sciences (MCHAS), a vibrant constituent college of the University of Dar es Salaam (UDSM) situated within the grounds of the Mbeya Zonal Referral Hospital in Mbeya, Tanzania.
                                </p>
                                <p>
                                    Our college was established with a profound mandate: to train competent healthcare professionals, conduct ground-breaking health research, and provide extensive consultancies and health services to the public. As part of UDSM's strategic expansion in the health and medical sectors, MCHAS operates in close synergy with regional healthcare facilities, providing an unmatched educational experience that blends theoretical instruction with intensive clinical exposure.
                                </p>
                                <p>
                                    Whether you are a prospective student, an ambitious researcher, or a dedicated faculty member, you belong to a community committed to transforming healthcare across Tanzania and the continent. We embrace innovation, excellence, and a deep commitment to humanity.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight tracking-tight text-slate-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <GraduationCap size={18} />
                                </span>
                                Academic Programmes
                            </h2>
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Doctor of Medicine (MD)</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        The core undergraduate medical program structured to provide comprehensive scientific knowledge and clinical expertise. Students undergo rigorous theoretical and practical training under specialized departments and affiliated hospitals.
                                    </p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Allied Health Sciences</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Focused on diverse streams of health services—from nursing and clinical pharmacology to radiology and laboratory sciences. We continuously expand our diploma and degree curricula to address the severe shortage of specialized health workers in the region.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Content (Mission, Vision, Contact) */}
                <div className="space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Award size={100} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-100 mb-2">Vision</h3>
                                <p className="font-medium text-lg mb-8 leading-snug">
                                    To become a reputable world-class college that is responsive to national, regional, and global health challenges and needs.
                                </p>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-100 mb-2">Mission</h3>
                                <p className="font-medium text-sm text-blue-50 leading-relaxed">
                                    To advance the medical and allied health sciences through teaching, research, and public service, producing competent health professionals equipped to transform clinical care.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight tracking-tight text-slate-800 mb-6">Contact Us</h2>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-sm font-medium text-slate-700">Mbeya Zonal Referral Hospital Grounds,<br />P.O. Box 6144, Mbeya, Tanzania</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-sm font-medium text-slate-700">principal.mchas@udsm.ac.tz</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone / Fax</p>
                                        <p className="text-sm font-medium text-slate-700">+255 25 295 7356</p>
                                    </div>
                                </li>
                            </ul>
                            
                            <hr className="my-6 border-slate-100" />
                            
                            <div className="flex items-center gap-3">
                                <HeartPulse className="text-rose-500" size={24} />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Part of UDSM</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
