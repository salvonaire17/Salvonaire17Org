import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  CreditCard,
  Building,
  GraduationCap
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setView } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center shadow-inner">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">MCHAS</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Management Portal</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-24">
        {/* Hero Section */}
        <div className="max-w-4xl pt-6 md:pt-10 pb-16 md:pb-20 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-blue-700 text-[10px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest mb-6 md:mb-8 mx-auto md:mx-0">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></span>
              Portal is Live
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Streamlined Semester Registration <br className="hidden md:block"/>& Campus Management.
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed mb-10 mx-auto md:mx-0">
              Skip the lines. Instantly verify your academic status, manage your GePG control numbers, track institutional clearances, and activate your semester card digitally.
            </p>
            <button 
              onClick={() => setView('login')}
              className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-blue-900 text-white rounded-2xl hover:bg-blue-800 transition-all shadow-sm shadow-blue-900/20 font-black uppercase tracking-widest text-sm"
            >
              Start Semester Reporting
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Live Portal Status Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32"
        >
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Active Registration</h3>
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900">Semester II, 2026 Continuation</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Integration Status</h3>
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900">GePG & NHIF Live Verification Enabled</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <FileCheck size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Support</h3>
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900">Digital Registry Desk Open</p>
          </div>
        </motion.div>

        {/* Features Pipeline */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-12 text-center">The 4-Step Digital Pipeline</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="hidden md:block absolute top-4 left-8 right-0 h-0.5 bg-slate-200"></div>
              <div className="relative z-10 bg-slate-50 pr-4">
                <div className="text-cyan-600 mb-4 flex justify-center md:justify-start items-center">
                  <span className="text-4xl font-black">1.</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2 text-center md:text-left">Student Reporting</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed text-center md:text-left">Validate your official admission records, confirm NTA levels, and report digitally.</p>
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-4 left-8 right-0 h-0.5 bg-slate-200"></div>
              <div className="relative z-10 bg-slate-50 pr-4">
                <div className="text-cyan-600 mb-4 flex justify-center md:justify-start items-center">
                  <span className="text-4xl font-black mr-2">2.</span>
                  <CreditCard size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2 text-center md:text-left">Financial Clearance</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed text-center md:text-left">Fetch your control number, reconcile GePG payments, and verify NHIF insurance.</p>
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-4 left-8 right-0 h-0.5 bg-slate-200"></div>
              <div className="relative z-10 bg-slate-50 pr-4">
                <div className="text-cyan-600 mb-4 flex justify-center md:justify-start items-center">
                  <span className="text-4xl font-black mr-2">3.</span>
                  <Building size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2 text-center md:text-left">Departmental Sign-off</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed text-center md:text-left">Track approvals securely from the Academic Head, Supplies, and Wardens.</p>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-slate-50 pr-4">
                <div className="text-emerald-500 mb-4 flex justify-center md:justify-start items-center">
                  <span className="text-4xl font-black mr-2">4.</span>
                  <FileCheck size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2 text-center md:text-left">Card Activation</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed text-center md:text-left">Download your finalized registration slip with Makamu Mkuu wa Chuo approval.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
