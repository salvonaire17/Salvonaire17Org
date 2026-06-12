
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Role } from '../types';

export const LoginScreen: React.FC = () => {
    const { login, signup, staffConfirmationCode } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [indexNumberInput, setIndexNumberInput] = useState('');
    const [studentNameInput, setStudentNameInput] = useState('');
    const [staffCodeInput, setStaffCodeInput] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roles: Role[] = ['Student', 'Parent', 'Lecturer', 'Principal', 'Vice Principal', 'Warden', 'Bursar', 'Admission Officer', 'Academic Officer', 'Supplies Officer', 'NHIF Officer'];

    const isValidLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    const isPasswordValid = isValidLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    const validatePassword = (pass: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(pass);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedRole) {
            setError('Please select your Access Level Authorization role from the list.');
            return;
        }

        if (mode === 'signup' && !['Student', 'Parent'].includes(selectedRole!)) {
            if (staffCodeInput !== staffConfirmationCode) {
                setError('Authentication Failed: Incorrect security phrase.');
                return;
            }
        }

        if (mode === 'signup' && selectedRole === 'Student' && !indexNumberInput.trim()) {
            setError('Please enter your Admission Index Number (e.g. S0101/0101/2023) from your admission letter.');
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password, selectedRole);
            } else {
                if (!validatePassword(password)) {
                    throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
                }
                try {
                    await signup({ 
                        name, 
                        email, 
                        password, 
                        role: selectedRole, 
                        phone: phoneNumber, 
                        indexNumber: selectedRole === 'Student' ? indexNumberInput.trim() : undefined,
                        linkedStudentName: selectedRole === 'Parent' ? studentNameInput.trim() : undefined
                    });
                } catch (signupErr: any) {
                    if (signupErr.message?.includes('auth/email-already-in-use')) {
                        // Email exists, try to log in instead
                        try {
                            await login(email, password, selectedRole);
                        } catch (loginErr: any) {
                            throw new Error('This email is already registered, but the password provided is incorrect. Please switch to Login mode.');
                        }
                    } else {
                        throw signupErr;
                    }
                }
            }
        } catch (err: any) {
            // Translate common Firebase errors
            if (err.message?.includes('auth/email-already-in-use')) {
                setError('This email is already registered. Please log in.');
            } else if (err.message?.includes('auth/invalid-credential') || err.message?.includes('auth/wrong-password')) {
                setError('Invalid email or password.');
            } else if (err.message === 'Wrong role') {
                setError('WRONG_ROLE_ERROR');
            } else {
                setError(err.message || 'Authentication failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-6 selection:bg-cyan-100">
            <div className="w-full max-w-[500px] animate-in fade-in zoom-in duration-700">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-900 rounded-[1.5rem] flex items-center justify-center shadow-inner shadow-blue-950/50">
                            <span className="text-white text-4xl font-black tracking-tighter">M</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">MCHAS Portal</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Mbeya College of Health and Allied Sciences</p>
                </div>

                <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm shadow-slate-200/60 p-6 md:p-10 border border-slate-100 relative">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6 md:mb-10 relative">
                        <div className={`absolute inset-y-1.5 w-[49%] bg-white rounded-xl shadow-sm border border-slate-100 transition-transform duration-300 ${mode === 'signup' ? 'translate-x-[102%]' : 'translate-x-0'}`} />
                        <button onClick={() => setMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest z-10 ${mode === 'login' ? 'text-slate-900' : 'text-slate-400'}`}>Session Log</button>
                        <button onClick={() => setMode('signup')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest z-10 ${mode === 'signup' ? 'text-slate-900' : 'text-slate-400'}`}>Join Faculty</button>
                    </div>

                    <form className="space-y-8" onSubmit={handleAuth}>
                        <div className="space-y-4">
                            {mode === 'signup' && (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Full Name (Provide Three Names)" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 font-bold text-slate-700 outline-none transition-all" 
                                    />
                                    <p className="text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-widest leading-tight">Use your full three names for official registration record matching</p>
                                </div>
                            )}
                            <input type="email" required placeholder="Institutional Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 font-bold text-slate-700 outline-none transition-all" />
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    placeholder="Access Key" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 font-bold text-slate-700 outline-none transition-all pr-14" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.42-1.581c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 00-4.243-4.243" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            
                            {mode === 'signup' && (
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-[11px] font-bold font-sans">
                                    <p className="text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Password Requirements</p>
                                    <div className={`flex items-center gap-2 transition-colors duration-300 ${isValidLength ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isValidLength ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'}`}>
                                            {isValidLength && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>Minimum 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-300 ${hasUpperCase ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${hasUpperCase ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'}`}>
                                            {hasUpperCase && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>At least one uppercase letter (A-Z)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-300 ${hasLowerCase ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${hasLowerCase ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'}`}>
                                            {hasLowerCase && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>At least one lowercase letter (a-z)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-300 ${hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${hasNumber ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'}`}>
                                            {hasNumber && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>At least one number (0-9)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-300 ${hasSpecialChar ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${hasSpecialChar ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'}`}>
                                            {hasSpecialChar && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>At least one special character (@$!%*?&)</span>
                                    </div>
                                </div>
                            )}
                            
                            {mode === 'signup' && (
                                <>
                                    <input type="tel" required placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 font-bold text-slate-700 outline-none transition-all" />
                                    {selectedRole === 'Student' && (
                                        <div className="animate-in fade-in slide-in-from-top-1 px-1 py-1 duration-300">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="Admission Index Number (e.g. S0101/0101/2023)" 
                                                    value={indexNumberInput} 
                                                    onChange={e => setIndexNumberInput(e.target.value)} 
                                                    className="w-full px-6 py-5 bg-cyan-50/50 border-2 border-cyan-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-cyan-100 outline-none transition-all placeholder:text-cyan-300 uppercase text-cyan-900" 
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold mt-2 ml-2 uppercase tracking-widest text-cyan-600">
                                                Required for your institutional registration identity
                                            </p>
                                        </div>
                                    )}
                                    {selectedRole === 'Parent' && (
                                        <div className="animate-in fade-in slide-in-from-top-1 px-1 py-1 duration-300">
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder="Student's Full Three Names" 
                                                value={studentNameInput} 
                                                onChange={e => setStudentNameInput(e.target.value)} 
                                                className="w-full px-6 py-5 bg-cyan-50/50 border-2 border-cyan-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 font-bold text-blue-900 outline-none transition-all placeholder:text-blue-300" 
                                            />
                                            <p className="text-[10px] text-blue-400 font-bold mt-2 ml-2 uppercase tracking-widest leading-tight">Must match the student's three registered names exactly for identity linking</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {mode === 'signup' && selectedRole && !['Student', 'Parent'].includes(selectedRole) && (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <input 
                                        type="password" 
                                        required 
                                        placeholder="Staff Phrase" 
                                        value={staffCodeInput} 
                                        onChange={e => setStaffCodeInput(e.target.value)} 
                                        className="w-full px-6 py-5 bg-cyan-50/50 border-2 border-cyan-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 font-bold text-indigo-900 outline-none transition-all placeholder:text-indigo-300" 
                                    />
                                </div>
                            )}
                        </div>

                        {/* High-End Role Selection List */}
                        <div className="space-y-1.5 relative w-full" ref={dropdownRef}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Role</label>
                            
                            <button
                                type="button"
                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                className={`w-full px-6 py-5 border-2 rounded-2xl flex justify-between items-center transition-all bg-white outline-none ${
                                    isRoleDropdownOpen 
                                    ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                                    : 'border-slate-100 hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                <span className={`font-bold ${selectedRole ? 'text-indigo-900' : 'text-slate-400'}`}>
                                    {selectedRole || 'Select Role'}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-cyan-700 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isRoleDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-sm overflow-y-auto max-h-[160px] py-1 scroll-smooth overscroll-contain"
                                        style={{ WebkitOverflowScrolling: 'touch' }}
                                    >
                                        {roles.map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRole(role);
                                                    setIsRoleDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                                                    selectedRole === role 
                                                    ? 'bg-cyan-50 text-indigo-700' 
                                                    : 'hover:bg-slate-50 text-slate-600 font-medium'
                                                }`}
                                            >
                                                <span className={selectedRole === role ? 'font-bold' : ''}>{role}</span>
                                                {selectedRole === role && <Check className="w-4 h-4 text-cyan-700" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error === 'WRONG_ROLE_ERROR' ? (
                            <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                                <h1 className="text-5xl font-black text-rose-600 mb-4">Wrong role</h1>
                                <p className="text-slate-500 font-bold">You selected the wrong role for this account.</p>
                                <button onClick={() => window.location.reload()} className="mt-8 bg-slate-900 text-white font-bold py-3 px-8 rounded-full">Try Again</button>
                            </div>
                        ) : error && <p className="text-red-500 text-xs font-black text-center animate-bounce">{error}</p>}

                        <button type="submit" disabled={isLoading || (mode === 'signup' && !isPasswordValid)} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.2rem] shadow-sm hover:bg-black transition-all active:scale-95 duration-200 uppercase tracking-widest text-[11px] disabled:opacity-50">
                            {isLoading ? 'Verifying Credentials...' : mode === 'login' ? 'Authorize Session' : 'Create Identity'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};
