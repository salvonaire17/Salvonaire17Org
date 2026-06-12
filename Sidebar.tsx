
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    id: string | number;
    label: string;
}

interface PremiumDropdownProps {
    options: Option[];
    selectedId: string | number;
    onSelect: (id: any) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

const PremiumDropdown: React.FC<PremiumDropdownProps> = ({ 
    options, 
    selectedId, 
    onSelect, 
    label, 
    placeholder = 'Select Option',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === selectedId);

    return (
        <div className={`space-y-1.5 relative w-full ${isOpen ? 'z-50' : 'z-auto'} ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-4 border-2 rounded-2xl flex justify-between items-center transition-all bg-white outline-none ${
                    isOpen 
                    ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1) ]' 
                    : 'border-slate-50 hover:border-indigo-200'
                }`}
            >
                <span className={`font-bold text-sm truncate ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-cyan-700 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-y-auto max-h-[220px] py-1 scroll-smooth overscroll-contain"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-slate-400 font-medium italic text-center">No options available</div>
                        ) : (
                            options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-colors ${
                                        selectedId === opt.id 
                                        ? 'bg-cyan-50 text-indigo-700' 
                                        : 'hover:bg-slate-50 text-slate-600 font-medium'
                                    }`}
                                >
                                    <span className={`truncate mr-2 ${selectedId === opt.id ? 'font-bold' : ''}`}>{opt.label}</span>
                                    {selectedId === opt.id && <Check className="w-3.5 h-3.5 text-cyan-700 shrink-0" />}
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumDropdown;
