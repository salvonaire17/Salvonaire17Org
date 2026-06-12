
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubmitComplaint } from '../components/SubmitComplaint';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    
    if (!user) return null;

    return (
        <div className="bg-white rounded-[2.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-700">
            <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Karibu, {user.name}!</h2>
                <p className="mt-2 md:mt-3 text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
                    Welcome to your personal portal at MCHAS. Explore our college resources, stay updated with announcements, 
                    and manage your academic journey efficiently.
                </p>
                <div className="mt-8 max-w-sm">
                    <SubmitComplaint />
                </div>
            </div>
            <div className="p-6 md:p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight mb-4">About MCHAS</h3>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 relative z-10">
                            Mbeya College of Health and Allied Sciences (MCHAS) is a prestigious constituent college of the 
                            <span className="text-cyan-600 font-bold ml-1">University of Dar es Salaam (UDSM)</span>. 
                            Located in the Southern Highlands of Tanzania, our college is dedicated to providing high-quality 
                            education in health sciences, fostering research, and delivering exemplary healthcare services to the community.
                        </p>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start space-x-3">
                                <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600 mt-0.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Vision</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">To be a leading center of excellence in health education and medical research in Africa.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 mt-0.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Mission</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Produce innovative healthcare professionals through quality teaching, research, and public service.</p>
                                </div>
                            </div>
                        </div>
                    </div>
             
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-sm text-white flex flex-col justify-between">
                        <div>
                            <div className="bg-cyan-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-cyan-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight tracking-tight mb-3">UDSM Affiliation</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Being part of the University of Dar es Salaam, MCHAS upholds the highest academic standards. 
                                Our graduates are recognized globally and are part of the extensive UDSM alumni network 
                                pioneering medical breakthroughs across the continent.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <div className="flex items-center space-x-4">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-cyan-600 flex items-center justify-center text-[9px] font-black">U</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-[9px] font-black">D</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-amber-600 flex items-center justify-center text-[9px] font-black">S</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-cyan-600 flex items-center justify-center text-[9px] font-black">M</div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Academic Recognition</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
